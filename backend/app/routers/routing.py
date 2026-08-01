import time
import math
from typing import List
from fastapi import APIRouter, Depends, HTTPException

from app.schemas import RouteOptimizationRequest, RouteOptimizationResult, OptimizedRoute, RouteStop
from app.routers.auth import require_role
from app.supabase_client import supabase_get

router = APIRouter(prefix="/api/routes", tags=["Route Optimization"])


def haversine(lat1, lng1, lat2, lng2) -> float:
    """Distance in km between two GPS points."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def nearest_neighbor_vrp(
    depot: tuple,
    locations: List[dict],
    num_vehicles: int,
) -> List[List[dict]]:
    """Simple nearest-neighbor heuristic for VRP (placeholder for OR-Tools)."""
    if not locations:
        return [[] for _ in range(num_vehicles)]

    unvisited = locations.copy()
    routes = [[] for _ in range(num_vehicles)]
    current_positions = [depot] * num_vehicles

    vehicle_idx = 0
    while unvisited:
        cur = current_positions[vehicle_idx]
        nearest = min(
            unvisited,
            key=lambda loc: haversine(cur[0], cur[1], loc["lat"], loc["lng"]),
        )
        routes[vehicle_idx].append(nearest)
        current_positions[vehicle_idx] = (nearest["lat"], nearest["lng"])
        unvisited.remove(nearest)
        vehicle_idx = (vehicle_idx + 1) % num_vehicles

    return routes


def ortools_vrp(
    depot: tuple,
    locations: List[dict],
    num_vehicles: int,
) -> List[List[dict]]:
    """Google OR-Tools VRP solver for vehicle routing optimization."""
    if not locations or num_vehicles <= 0:
        return [[] for _ in range(num_vehicles)]

    try:
        from ortools.constraint_solver import pywrapcp, routing_enums_pb2

        num_locations = len(locations) + 1
        depot_lat, depot_lng = depot
        all_coords = [(depot_lat, depot_lng)] + [(loc["lat"], loc["lng"]) for loc in locations]

        distance_matrix = []
        for i in range(num_locations):
            row = []
            for j in range(num_locations):
                if i == j:
                    row.append(0)
                else:
                    dist_km = haversine(all_coords[i][0], all_coords[i][1], all_coords[j][0], all_coords[j][1])
                    row.append(int(dist_km * 1000))  # distance in meters
            distance_matrix.append(row)

        manager = pywrapcp.RoutingIndexManager(num_locations, num_vehicles, 0)
        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(distance_callback)
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        dimension_name = "Distance"
        routing.AddDimension(
            transit_callback_index,
            0,      # no slack
            300000, # vehicle maximum travel distance in meters (300 km)
            True,   # start cumul to zero
            dimension_name,
        )
        distance_dimension = routing.GetDimensionOrDie(dimension_name)
        distance_dimension.SetGlobalSpanCostCoefficient(100)

        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        solution = routing.SolveWithParameters(search_parameters)

        routes = [[] for _ in range(num_vehicles)]
        if solution:
            for vehicle_id in range(num_vehicles):
                index = routing.Start(vehicle_id)
                index = solution.Value(routing.NextVar(index))
                while not routing.IsEnd(index):
                    node_index = manager.IndexToNode(index)
                    routes[vehicle_id].append(locations[node_index - 1])
                    index = solution.Value(routing.NextVar(index))
            return routes
    except Exception as e:
        print(f"[ERROR] OR-Tools solver failed: {e}. Falling back to nearest neighbor.")

    return nearest_neighbor_vrp(depot, locations, num_vehicles)


@router.post("/optimize", response_model=RouteOptimizationResult)
async def optimize_routes(
    data: RouteOptimizationRequest,
    current_user: dict = Depends(require_role("municipal", "admin")),
):
    """Run VRP route optimization for given vehicles and report locations."""
    start_time = time.time()

    # Fetch vehicles
    # Build an OR filter for vehicle IDs
    vehicle_ids_filter = ",".join(str(vid) for vid in data.vehicle_ids)
    vehicles = await supabase_get("vehicles", {
        "select": "*",
        "id": f"in.({vehicle_ids_filter})",
    })
    if not vehicles:
        raise HTTPException(status_code=404, detail="No vehicles found")

    # Fetch reports
    report_ids_filter = ",".join(str(rid) for rid in data.report_ids)
    reports = await supabase_get("garbage_reports", {
        "select": "*, ai_predictions(severity)",
        "id": f"in.({report_ids_filter})",
    })

    # Sort by severity (critical first)
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "very_low": 4}
    locations = sorted(
        [
            {
                "report_id": r["id"],
                "lat": r["latitude"],
                "lng": r["longitude"],
                "address": r.get("address"),
                "severity": (r.get("ai_predictions") or {}).get("severity", "medium"),
            }
            for r in reports
        ],
        key=lambda x: severity_order.get(x["severity"], 5),
    )

    depot = (data.depot_lat, data.depot_lng)
    vehicle_routes = ortools_vrp(depot, locations, len(vehicles))

    optimized_routes = []
    for i, vehicle in enumerate(vehicles):
        stops_data = vehicle_routes[i] if i < len(vehicle_routes) else []
        stops = [
            RouteStop(
                report_id=s["report_id"],
                latitude=s["lat"],
                longitude=s["lng"],
                address=s.get("address"),
                severity=s.get("severity"),
                order=j + 1,
            )
            for j, s in enumerate(stops_data)
        ]

        # Estimate distance
        total_dist = 0.0
        prev = depot
        for s in stops_data:
            total_dist += haversine(prev[0], prev[1], s["lat"], s["lng"])
            prev = (s["lat"], s["lng"])
        total_dist += haversine(prev[0], prev[1], depot[0], depot[1])

        optimized_routes.append(OptimizedRoute(
            vehicle_id=vehicle["id"],
            vehicle_name=vehicle["name"],
            stops=stops,
            total_distance_km=round(total_dist, 2),
            estimated_duration_hours=round(total_dist / 30, 2),  # 30 km/h avg
        ))

    elapsed_ms = int((time.time() - start_time) * 1000)

    return RouteOptimizationResult(
        routes=optimized_routes,
        unassigned_report_ids=[],
        optimization_time_ms=elapsed_ms,
    )
