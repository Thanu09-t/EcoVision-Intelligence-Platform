from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query

from app.schemas import VehicleOut, VehicleCreate, VehicleUpdate, TeamOut
from app.routers.auth import get_current_user, require_role
from app.supabase_client import supabase_get, supabase_post, supabase_patch, supabase_delete

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


def _vehicle_out(v: dict) -> VehicleOut:
    return VehicleOut(
        id=v["id"],
        name=v["name"],
        license_plate=v["license_plate"],
        vehicle_type=v.get("vehicle_type", "garbage_truck"),
        capacity_tons=v.get("capacity_tons", 5.0),
        current_latitude=v.get("current_latitude"),
        current_longitude=v.get("current_longitude"),
        status=v.get("status", "available"),
        fuel_level=v.get("fuel_level", 100.0),
        driver_name=v.get("driver_name"),
    )


@router.get("", response_model=List[VehicleOut])
async def list_vehicles(
    status: Optional[str] = Query(None),
    _: dict = Depends(get_current_user),
):
    """List all vehicles, optionally filtered by status."""
    params = {"select": "*"}
    if status:
        params["status"] = f"eq.{status}"
    rows = await supabase_get("vehicles", params)
    return [_vehicle_out(v) for v in rows]


@router.get("/teams", response_model=List[TeamOut])
async def list_teams(
    _: dict = Depends(get_current_user),
):
    """List all cleanup teams."""
    rows = await supabase_get("teams", {"select": "*", "is_active": "eq.true"})
    return [
        TeamOut(
            id=t["id"],
            name=t["name"],
            supervisor_name=t.get("supervisor_name"),
            supervisor_phone=t.get("supervisor_phone"),
            member_count=t.get("member_count", 4),
            ward=t.get("ward"),
            is_active=t.get("is_active", True),
        )
        for t in rows
    ]


@router.get("/summary")
async def get_vehicle_summary(
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Get vehicle fleet summary stats."""
    vehicles = await supabase_get("vehicles", {"select": "id,status"})
    total = len(vehicles)
    available = sum(1 for v in vehicles if v.get("status") == "available")
    on_route = sum(1 for v in vehicles if v.get("status") == "on_route")
    maintenance = sum(1 for v in vehicles if v.get("status") == "maintenance")
    return {
        "total": total,
        "available": available,
        "on_route": on_route,
        "maintenance": maintenance,
        "offline": total - available - on_route - maintenance,
    }


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(
    vehicle_id: int,
    _: dict = Depends(get_current_user),
):
    rows = await supabase_get("vehicles", {"id": f"eq.{vehicle_id}", "select": "*"})
    if not rows:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return _vehicle_out(rows[0])


@router.post("", response_model=VehicleOut, status_code=201)
async def create_vehicle(
    data: VehicleCreate,
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Create a new vehicle."""
    # Check for duplicate license plate
    existing = await supabase_get("vehicles", {"license_plate": f"eq.{data.license_plate}", "select": "id"})
    if existing:
        raise HTTPException(status_code=400, detail="License plate already registered")

    vehicle = await supabase_post("vehicles", data.model_dump())
    return _vehicle_out(vehicle)


@router.patch("/{vehicle_id}", response_model=VehicleOut)
async def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Update vehicle details or status."""
    rows = await supabase_get("vehicles", {"id": f"eq.{vehicle_id}", "select": "id"})
    if not rows:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    update_data = data.model_dump(exclude_unset=True)
    if hasattr(update_data.get("status"), "value"):
        update_data["status"] = update_data["status"].value
    update_data["updated_at"] = datetime.utcnow().isoformat()

    vehicle = await supabase_patch("vehicles", {"id": f"eq.{vehicle_id}"}, update_data)
    return _vehicle_out(vehicle)


@router.delete("/{vehicle_id}")
async def delete_vehicle(
    vehicle_id: int,
    _: dict = Depends(require_role("admin")),
):
    """Delete a vehicle (admin only)."""
    rows = await supabase_get("vehicles", {"id": f"eq.{vehicle_id}", "select": "id"})
    if not rows:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    await supabase_delete("vehicles", {"id": f"eq.{vehicle_id}"})
    return {"success": True, "deleted_id": vehicle_id}
