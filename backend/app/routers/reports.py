import os
import uuid
import aiofiles
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query

from app.config import settings
from app.schemas import ReportOut, ReportStatusUpdate, MapDataPoint, AIPredictionOut
from app.routers.auth import get_current_user, require_role
from app.services.ai_service import run_inference
from app.supabase_client import supabase_get, supabase_post, supabase_patch

router = APIRouter(prefix="/api/reports", tags=["Reports"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


def _build_report_out(r: dict) -> ReportOut:
    """Convert a Supabase report row (with embedded prediction) to ReportOut."""
    pred_data = r.get("prediction") or r.get("ai_predictions")
    prediction = None
    if pred_data and isinstance(pred_data, dict) and pred_data.get("id"):
        prediction = AIPredictionOut(
            id=pred_data["id"],
            detected_objects=pred_data.get("detected_objects"),
            waste_types=pred_data.get("waste_types"),
            primary_waste_type=pred_data.get("primary_waste_type"),
            garbage_area_m2=pred_data.get("garbage_area_m2"),
            coverage_percentage=pred_data.get("coverage_percentage"),
            severity=pred_data.get("severity"),
            pollution_score=pred_data.get("pollution_score"),
            illegal_dump_type=pred_data.get("illegal_dump_type", "unknown"),
            is_illegal=pred_data.get("is_illegal", False),
            model_version=pred_data.get("model_version", "mock-v1.0"),
            processing_time_ms=pred_data.get("processing_time_ms"),
            created_at=pred_data.get("created_at", r["created_at"]),
        )

    return ReportOut(
        id=r["id"],
        reporter_id=r["reporter_id"],
        image_url=r["image_url"],
        thumbnail_url=r.get("thumbnail_url"),
        latitude=r["latitude"],
        longitude=r["longitude"],
        address=r.get("address"),
        ward=r.get("ward"),
        description=r.get("description"),
        status=r["status"],
        prediction=prediction,
        created_at=r["created_at"],
        updated_at=r["updated_at"],
    )


@router.post("/upload", response_model=ReportOut, status_code=201)
async def upload_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: Optional[str] = Form(None),
    ward: Optional[str] = Form(None),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a garbage image with GPS coordinates."""
    ext = os.path.splitext(image.filename or "")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    if image.size and image.size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")

    # Save image
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    async with aiofiles.open(filepath, "wb") as f:
        content = await image.read()
        await f.write(content)

    image_url = f"/uploads/{filename}"

    # Run AI inference
    prediction_data = await run_inference(filepath)

    # Insert prediction
    prediction = await supabase_post("ai_predictions", {
        "detected_objects": prediction_data.get("detected_objects"),
        "waste_types": prediction_data.get("waste_types"),
        "primary_waste_type": prediction_data.get("primary_waste_type"),
        "garbage_area_m2": prediction_data.get("garbage_area_m2"),
        "coverage_percentage": prediction_data.get("coverage_percentage"),
        "severity": prediction_data.get("severity"),
        "pollution_score": prediction_data.get("pollution_score"),
        "illegal_dump_type": prediction_data.get("illegal_dump_type", "unknown"),
        "is_illegal": prediction_data.get("is_illegal", False),
        "model_version": prediction_data.get("model_version", "mock-v1.0"),
        "processing_time_ms": prediction_data.get("processing_time_ms"),
    })

    user_ward = ward or current_user.get("ward")

    # Create report
    report = await supabase_post("garbage_reports", {
        "reporter_id": current_user["id"],
        "image_url": image_url,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "ward": user_ward,
        "prediction_id": prediction["id"],
        "status": "pending",
    })

    # Update prediction with report_id
    await supabase_patch(
        "ai_predictions",
        {"id": f"eq.{prediction['id']}"},
        {"report_id": report["id"]},
        return_data=False,
    )

    # Award eco-points
    points = 10
    reason = "Submitted a garbage report"
    severity = prediction_data.get("severity", "low")
    if severity in ("high", "critical"):
        points += 20
        reason = "Reported a critical pollution site (+bonus)"

    new_eco = current_user.get("eco_points", 0) + points
    await supabase_patch("users", {"id": f"eq.{current_user['id']}"}, {"eco_points": new_eco}, return_data=False)
    await supabase_post("eco_points_log", {
        "user_id": current_user["id"],
        "points": points,
        "reason": reason,
        "report_id": report["id"],
    }, return_data=False)

    # Send notification
    await supabase_post("notifications", {
        "user_id": current_user["id"],
        "type": "success",
        "title": "Report Submitted",
        "message": f"Your report has been submitted and is under review. AI detected: {prediction_data.get('primary_waste_type', 'mixed')} waste.",
        "report_id": report["id"],
    }, return_data=False)

    # Reload with prediction
    report["prediction"] = prediction
    return _build_report_out(report)


@router.get("", response_model=List[ReportOut])
async def list_reports(
    status: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    current_user: dict = Depends(get_current_user),
):
    """List reports. Citizens see only their own; municipal/admin see all."""
    params = {
        "select": "*, ai_predictions(*)",
        "order": "created_at.desc",
        "limit": str(limit),
        "offset": str(offset),
    }

    if current_user.get("role") == "citizen":
        params["reporter_id"] = f"eq.{current_user['id']}"

    if status:
        params["status"] = f"eq.{status}"
    if ward:
        params["ward"] = f"eq.{ward}"

    rows = await supabase_get("garbage_reports", params)

    results = []
    for r in rows:
        # PostgREST returns the FK join as the FK column name or table name
        pred = r.pop("ai_predictions", None)
        if pred:
            r["prediction"] = pred
        results.append(_build_report_out(r))
    return results


@router.get("/{report_id}", response_model=ReportOut)
async def get_report(
    report_id: int,
    current_user: dict = Depends(get_current_user),
):
    params = {
        "select": "*, ai_predictions(*)",
        "id": f"eq.{report_id}",
    }

    rows = await supabase_get("garbage_reports", params)
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")

    r = rows[0]
    if current_user.get("role") == "citizen" and r["reporter_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    pred = r.pop("ai_predictions", None)
    if pred:
        r["prediction"] = pred
    return _build_report_out(r)


@router.get("/map-data", response_model=list[MapDataPoint])
async def get_map_data(
    severity: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    limit: int = Query(500, le=1000),
    current_user: dict = Depends(get_current_user),
):
    """Returns all report locations with AI data for GIS map. Accessible to all roles."""
    params = {
        "select": "id,latitude,longitude,ward,address,status,created_at,ai_predictions(severity,pollution_score,primary_waste_type,is_illegal,garbage_area_m2)",
        "order": "created_at.desc",
        "limit": str(limit),
    }
    if ward:
        params["ward"] = f"eq.{ward}"

    rows = await supabase_get("garbage_reports", params)

    out = []
    for r in rows:
        p = r.get("ai_predictions") or {}
        sev = p.get("severity")
        if severity and sev != severity:
            continue
        out.append(MapDataPoint(
            id=r["id"],
            latitude=r["latitude"],
            longitude=r["longitude"],
            ward=r.get("ward"),
            address=r.get("address"),
            severity=sev,
            pollution_score=p.get("pollution_score"),
            primary_waste_type=p.get("primary_waste_type"),
            is_illegal=p.get("is_illegal", False),
            status=r["status"],
            garbage_area_m2=p.get("garbage_area_m2"),
            created_at=r["created_at"],
        ))
    return out


@router.post("/{report_id}/assign")
async def assign_report(
    report_id: int,
    vehicle_id: Optional[int] = None,
    team_id: Optional[int] = None,
    current_user: dict = Depends(require_role("municipal", "admin")),
):
    """Assign a vehicle and/or team to a report."""
    rows = await supabase_get("garbage_reports", {"id": f"eq.{report_id}", "select": "id,reporter_id"})
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")
    report = rows[0]

    # Update status to assigned
    await supabase_patch(
        "garbage_reports",
        {"id": f"eq.{report_id}"},
        {"status": "assigned", "updated_at": datetime.utcnow().isoformat()},
        return_data=False,
    )

    # Notify reporter
    await supabase_post("notifications", {
        "user_id": report["reporter_id"],
        "type": "info",
        "title": "Team Assigned 👷",
        "message": "A municipal cleanup team has been assigned to your reported site.",
        "report_id": report_id,
    }, return_data=False)

    return {"success": True, "report_id": report_id, "status": "assigned"}


@router.patch("/{report_id}/status", response_model=ReportOut)
async def update_report_status(
    report_id: int,
    data: ReportStatusUpdate,
    current_user: dict = Depends(require_role("municipal", "admin")),
):
    rows = await supabase_get("garbage_reports", {
        "id": f"eq.{report_id}",
        "select": "*, ai_predictions(*)",
    })
    if not rows:
        raise HTTPException(status_code=404, detail="Report not found")

    report = rows[0]

    status_val = data.status.value if hasattr(data.status, 'value') else data.status
    await supabase_patch(
        "garbage_reports",
        {"id": f"eq.{report_id}"},
        {"status": status_val, "updated_at": datetime.utcnow().isoformat()},
        return_data=False,
    )

    # Notify the reporter
    status_messages = {
        "under_review": ("Under Review", "Your report is being reviewed by our team."),
        "assigned": ("Team Assigned", "A cleanup team has been assigned to your report."),
        "cleaning_started": ("Cleaning Started", "The cleanup crew has arrived at the location."),
        "completed": ("Cleanup Completed! 🎉", "The garbage has been cleared. Thank you for reporting!"),
        "rejected": ("Report Rejected", "Your report has been reviewed and marked as not actionable."),
    }
    title, message = status_messages.get(status_val, ("Status Updated", data.notes or ""))

    notif_type = "success" if status_val == "completed" else "info"
    await supabase_post("notifications", {
        "user_id": report["reporter_id"],
        "type": notif_type,
        "title": title,
        "message": message,
        "report_id": report_id,
    }, return_data=False)

    # Award bonus points on completion
    if status_val == "completed":
        await supabase_post("eco_points_log", {
            "user_id": report["reporter_id"],
            "points": 50,
            "reason": "Cleanup completed for your reported site",
            "report_id": report_id,
        }, return_data=False)

        # Update reporter's eco_points
        reporter_rows = await supabase_get("users", {"id": f"eq.{report['reporter_id']}", "select": "eco_points"})
        if reporter_rows:
            new_pts = (reporter_rows[0].get("eco_points", 0)) + 50
            await supabase_patch("users", {"id": f"eq.{report['reporter_id']}"}, {"eco_points": new_pts}, return_data=False)

    # Return updated report
    report["status"] = status_val
    pred = report.pop("ai_predictions", None)
    if pred:
        report["prediction"] = pred
    return _build_report_out(report)
