from typing import List
from fastapi import APIRouter, Depends

from app.schemas import NotificationOut
from app.routers.auth import get_current_user
from app.supabase_client import supabase_get, supabase_patch

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationOut])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
):
    rows = await supabase_get("notifications", {
        "user_id": f"eq.{current_user['id']}",
        "select": "*",
        "order": "created_at.desc",
        "limit": "50",
    })
    return [
        NotificationOut(
            id=n["id"],
            type=n["type"],
            title=n["title"],
            message=n["message"],
            is_read=n.get("is_read", False),
            report_id=n.get("report_id"),
            created_at=n["created_at"],
        )
        for n in rows
    ]


@router.post("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
):
    await supabase_patch(
        "notifications",
        {"id": f"eq.{notification_id}", "user_id": f"eq.{current_user['id']}"},
        {"is_read": True},
        return_data=False,
    )
    return {"success": True}


@router.post("/read-all")
async def mark_all_read(
    current_user: dict = Depends(get_current_user),
):
    await supabase_patch(
        "notifications",
        {"user_id": f"eq.{current_user['id']}", "is_read": "eq.false"},
        {"is_read": True},
        return_data=False,
    )
    return {"success": True}
