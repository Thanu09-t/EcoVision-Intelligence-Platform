from typing import List, Optional
from fastapi import APIRouter, Depends, Query

from app.schemas import GeoJSONCollection, GeoJSONFeature
from app.routers.auth import get_current_user
from app.supabase_client import supabase_get

router = APIRouter(prefix="/api/map", tags=["GIS Map"])


@router.get("/sites", response_model=GeoJSONCollection)
async def get_pollution_sites(
    severity: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(500, le=2000),
    _: dict = Depends(get_current_user),
):
    """Return GeoJSON FeatureCollection of all garbage sites for map rendering."""
    params = {
        "select": "*, ai_predictions(*)",
        "limit": str(limit),
    }
    if ward:
        params["ward"] = f"eq.{ward}"
    if status:
        params["status"] = f"eq.{status}"

    rows = await supabase_get("garbage_reports", params)

    features = []
    for r in rows:
        p = r.get("ai_predictions") or {}
        severity_val = p.get("severity", "medium")
        score = p.get("pollution_score", 50.0)
        waste_type = p.get("primary_waste_type", "mixed")
        area = p.get("garbage_area_m2", 0.0)

        if severity and severity_val != severity:
            continue

        features.append(GeoJSONFeature(
            geometry={"type": "Point", "coordinates": [r["longitude"], r["latitude"]]},
            properties={
                "id": r["id"],
                "status": r["status"],
                "severity": severity_val,
                "pollution_score": score,
                "primary_waste_type": waste_type,
                "garbage_area_m2": area,
                "ward": r.get("ward"),
                "address": r.get("address"),
                "image_url": r.get("image_url"),
                "description": r.get("description"),
                "created_at": r.get("created_at", ""),
                "is_illegal": p.get("is_illegal", False),
            }
        ))

    return GeoJSONCollection(features=features)


@router.get("/heatmap")
async def get_heatmap_data(
    _: dict = Depends(get_current_user),
):
    """Return lat/lng/intensity points for Leaflet.heat heatmap overlay."""
    rows = await supabase_get("garbage_reports", {
        "select": "latitude,longitude,ai_predictions(pollution_score)",
    })

    points = []
    for r in rows:
        p = r.get("ai_predictions") or {}
        intensity = p.get("pollution_score", 50.0) / 100.0 if p.get("pollution_score") else 0.5
        points.append([r["latitude"], r["longitude"], intensity])

    return {"points": points, "max_intensity": 1.0}


@router.get("/ward-stats")
async def get_ward_stats(
    _: dict = Depends(get_current_user),
):
    """Per-ward aggregated pollution stats."""
    rows = await supabase_get("garbage_reports", {
        "select": "ward,ai_predictions(pollution_score)",
        "ward": "not.is.null",
    })

    ward_data = {}
    for r in rows:
        w = r.get("ward")
        if not w:
            continue
        score = (r.get("ai_predictions") or {}).get("pollution_score")
        if w not in ward_data:
            ward_data[w] = {"total": 0, "scores": []}
        ward_data[w]["total"] += 1
        if score is not None:
            ward_data[w]["scores"].append(score)

    return {
        "wards": [
            {
                "ward": ward,
                "total_reports": data["total"],
                "avg_pollution_score": round(
                    sum(data["scores"]) / max(len(data["scores"]), 1), 1
                ),
            }
            for ward, data in ward_data.items()
        ]
    }
