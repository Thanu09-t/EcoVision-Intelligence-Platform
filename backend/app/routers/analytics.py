from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, Query

from app.schemas import (
    OverviewStats, ChartData, ChartDataset,
    WardRanking, HeatmapPoint, LeaderboardEntry, AIInsight, DashboardStats,
)
from app.routers.auth import get_current_user, require_role
from app.supabase_client import supabase_get, supabase_count

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview", response_model=OverviewStats)
async def get_overview(
    _: dict = Depends(require_role("municipal", "admin")),
):
    today = datetime.utcnow().date().isoformat()

    # Fetch all reports with predictions
    reports = await supabase_get("garbage_reports", {
        "select": "id,status,updated_at,reporter_id,ai_predictions(severity,is_illegal)",
    })
    vehicles = await supabase_get("vehicles", {"select": "id,status"})
    eco_logs = await supabase_get("eco_points_log", {"select": "points", "points": "gt.0"})

    total_sites = len(reports)
    critical_sites = sum(1 for r in reports if (r.get("ai_predictions") or {}).get("severity") == "critical")
    vehicles_available = sum(1 for v in vehicles if v.get("status") == "available")
    todays_cleanups = sum(1 for r in reports if r.get("status") == "completed" and r.get("updated_at", "").startswith(today))
    pending_reports = sum(1 for r in reports if r.get("status") == "pending")
    total_points = sum(e.get("points", 0) for e in eco_logs)
    active_citizens = len(set(r.get("reporter_id") for r in reports if r.get("reporter_id")))

    return OverviewStats(
        total_sites=total_sites,
        critical_sites=critical_sites,
        vehicles_available=vehicles_available,
        todays_cleanups=todays_cleanups,
        pending_reports=pending_reports,
        completed_today=todays_cleanups,
        total_eco_points_awarded=total_points,
        active_citizens=active_citizens,
    )


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Full dashboard stats with all KPIs."""
    today = datetime.utcnow().date().isoformat()

    reports = await supabase_get("garbage_reports", {
        "select": "id,status,updated_at,reporter_id,ai_predictions(severity,pollution_score,is_illegal)",
    })
    vehicles = await supabase_get("vehicles", {"select": "id,status"})
    eco_logs = await supabase_get("eco_points_log", {"select": "points", "points": "gt.0"})

    total_sites = len(reports)
    critical_sites = sum(1 for r in reports if (r.get("ai_predictions") or {}).get("severity") == "critical")
    vehicles_available = sum(1 for v in vehicles if v.get("status") == "available")
    vehicles_total = len(vehicles)
    todays_cleanups = sum(1 for r in reports if r.get("status") == "completed" and r.get("updated_at", "").startswith(today))
    pending_reports = sum(1 for r in reports if r.get("status") == "pending")
    total_points = sum(e.get("points", 0) for e in eco_logs)
    active_citizens = len(set(r.get("reporter_id") for r in reports if r.get("reporter_id")))
    illegal_dumps = sum(1 for r in reports if (r.get("ai_predictions") or {}).get("is_illegal"))

    scores = [
        (r.get("ai_predictions") or {}).get("pollution_score", 0)
        for r in reports
        if (r.get("ai_predictions") or {}).get("pollution_score") is not None
    ]
    avg_score = round(sum(scores) / max(len(scores), 1), 1)

    return DashboardStats(
        total_sites=total_sites,
        critical_sites=critical_sites,
        vehicles_available=vehicles_available,
        vehicles_total=vehicles_total,
        todays_cleanups=todays_cleanups,
        pending_reports=pending_reports,
        total_eco_points_awarded=int(total_points),
        active_citizens=active_citizens,
        illegal_dumps=illegal_dumps,
        avg_pollution_score=avg_score,
    )


@router.get("/ward-rankings", response_model=List[WardRanking])
async def get_ward_rankings(
    limit: int = Query(10, le=50),
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Ward-wise pollution rankings from live database."""
    reports = await supabase_get("garbage_reports", {
        "select": "ward,ai_predictions(severity,pollution_score)",
        "ward": "not.is.null",
    })

    # Aggregate by ward
    ward_data = {}
    for r in reports:
        w = r.get("ward")
        if not w:
            continue
        p = r.get("ai_predictions") or {}
        score = p.get("pollution_score")
        severity = p.get("severity")
        if w not in ward_data:
            ward_data[w] = {"scores": [], "critical": 0, "count": 0}
        ward_data[w]["count"] += 1
        if score is not None:
            ward_data[w]["scores"].append(score)
        if severity == "critical":
            ward_data[w]["critical"] += 1

    # Sort by avg score descending
    rankings = []
    for ward, data in sorted(
        ward_data.items(),
        key=lambda x: sum(x[1]["scores"]) / max(len(x[1]["scores"]), 1),
        reverse=True,
    )[:limit]:
        avg = round(sum(data["scores"]) / max(len(data["scores"]), 1), 1)
        if avg >= 75:
            color = "#ef4444"
        elif avg >= 55:
            color = "#f97316"
        elif avg >= 35:
            color = "#f59e0b"
        else:
            color = "#22c55e"

        rankings.append(WardRanking(
            ward=ward,
            avg_score=avg,
            total_reports=data["count"],
            critical_count=data["critical"],
            color=color,
        ))

    return rankings


@router.get("/heatmap", response_model=List[HeatmapPoint])
async def get_heatmap_data(
    _: dict = Depends(get_current_user),
):
    """Return all report locations with pollution scores for heatmap rendering."""
    reports = await supabase_get("garbage_reports", {
        "select": "latitude,longitude,ai_predictions(pollution_score,severity)",
        "limit": "500",
    })

    return [
        HeatmapPoint(
            lat=r["latitude"],
            lng=r["longitude"],
            score=(r.get("ai_predictions") or {}).get("pollution_score", 0),
            severity=(r.get("ai_predictions") or {}).get("severity", "medium"),
        )
        for r in reports
        if (r.get("ai_predictions") or {}).get("pollution_score") is not None
    ]


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    limit: int = Query(20, le=50),
    _: dict = Depends(get_current_user),
):
    """Top citizens by eco-points."""
    users = await supabase_get("users", {
        "select": "id,full_name,ward,eco_points",
        "role": "eq.citizen",
        "is_active": "eq.true",
        "order": "eco_points.desc",
        "limit": str(limit),
    })

    # Get report counts per user
    reports = await supabase_get("garbage_reports", {"select": "reporter_id"})
    report_counts = {}
    for r in reports:
        rid = r.get("reporter_id")
        report_counts[rid] = report_counts.get(rid, 0) + 1

    def get_badge(pts: int) -> str:
        if pts >= 500:
            return "🌳 Planet Protector"
        elif pts >= 300:
            return "🌿 Eco Champion"
        elif pts >= 150:
            return "🌱 Green Guardian"
        elif pts >= 50:
            return "♻️ Eco Starter"
        return "🌾 Seedling"

    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=u["id"],
            full_name=u["full_name"],
            ward=u.get("ward"),
            eco_points=u.get("eco_points", 0),
            total_reports=report_counts.get(u["id"], 0),
            badge=get_badge(u.get("eco_points", 0)),
        )
        for i, u in enumerate(users)
    ]


@router.get("/ai-insights", response_model=List[AIInsight])
async def get_ai_insights(
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Auto-generated AI insights from live database patterns."""
    today = datetime.utcnow().date().isoformat()

    reports = await supabase_get("garbage_reports", {
        "select": "id,status,ward,updated_at,ai_predictions(severity,pollution_score,primary_waste_type,is_illegal)",
    })
    vehicles = await supabase_get("vehicles", {"select": "id,status"})

    insights = []

    # Critical pending
    critical_pending = sum(
        1 for r in reports
        if r.get("status") == "pending" and (r.get("ai_predictions") or {}).get("severity") == "critical"
    )
    if critical_pending > 0:
        insights.append(AIInsight(
            type="critical",
            icon="🔴",
            title=f"{critical_pending} critical sites need immediate action",
            detail="Pending critical reports require vehicle dispatch within 2 hours.",
        ))

    # Illegal dumps pending
    illegal_pending = sum(
        1 for r in reports
        if r.get("status") == "pending" and (r.get("ai_predictions") or {}).get("is_illegal")
    )
    if illegal_pending > 0:
        insights.append(AIInsight(
            type="warning",
            icon="⚠️",
            title=f"{illegal_pending} illegal dump sites detected",
            detail="Coordinate with enforcement team to issue notices and clear sites.",
        ))

    # Top polluted ward
    ward_scores = {}
    for r in reports:
        w = r.get("ward")
        p = r.get("ai_predictions") or {}
        score = p.get("pollution_score")
        if w and score is not None:
            ward_scores.setdefault(w, []).append(score)
    if ward_scores:
        top_ward = max(ward_scores.items(), key=lambda x: sum(x[1]) / len(x[1]))
        avg = round(sum(top_ward[1]) / len(top_ward[1]), 1)
        insights.append(AIInsight(
            type="warning",
            icon="🏙️",
            title=f"{top_ward[0]} has highest pollution index ({avg}/100)",
            detail="Consider increasing patrol frequency and bin density in this ward.",
        ))

    # Dominant waste type
    waste_counts = {}
    for r in reports:
        wt = (r.get("ai_predictions") or {}).get("primary_waste_type")
        if wt:
            waste_counts[wt] = waste_counts.get(wt, 0) + 1
    if waste_counts:
        top_waste = max(waste_counts.items(), key=lambda x: x[1])
        waste_name = top_waste[0].replace("_", " ").title()
        insights.append(AIInsight(
            type="info",
            icon="♻️",
            title=f"{waste_name} is the dominant waste type ({top_waste[1]} sites)",
            detail=f"Expand {waste_name.lower()} recycling infrastructure and citizen awareness.",
        ))

    # Cleanups today
    cleanups_today = sum(
        1 for r in reports
        if r.get("status") == "completed" and r.get("updated_at", "").startswith(today)
    )
    if cleanups_today > 0:
        insights.append(AIInsight(
            type="success",
            icon="✅",
            title=f"{cleanups_today} sites cleaned today",
            detail="Great progress! Keep momentum by assigning vehicles to pending high-priority sites.",
        ))

    # Vehicle utilization
    total_v = max(len(vehicles), 1)
    on_route = sum(1 for v in vehicles if v.get("status") == "on_route")
    util_pct = round(on_route / total_v * 100, 0)
    insights.append(AIInsight(
        type="info",
        icon="🚛",
        title=f"Fleet utilization at {int(util_pct)}% ({on_route}/{total_v} vehicles active)",
        detail="Dispatch idle vehicles to pending high-priority zones to improve coverage.",
    ))

    return insights


@router.get("/charts/monthly")
async def get_monthly_chart(
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Reports submitted per month for the last 6 months."""
    reports = await supabase_get("garbage_reports", {"select": "created_at"})

    months = []
    counts = []
    for i in range(5, -1, -1):
        dt = datetime.utcnow() - timedelta(days=30 * i)
        label = dt.strftime("%b %Y")
        start = dt.replace(day=1, hour=0, minute=0, second=0)
        if i > 0:
            end = (datetime.utcnow() - timedelta(days=30 * (i - 1))).replace(day=1)
        else:
            end = datetime.utcnow()

        count = sum(
            1 for r in reports
            if start.isoformat() <= r.get("created_at", "") < end.isoformat()
        )
        months.append(label)
        counts.append(count)

    return ChartData(
        labels=months,
        datasets=[ChartDataset(label="Reports Submitted", data=counts, color="#22c55e")],
    )


@router.get("/charts/waste-types")
async def get_waste_type_chart(
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Waste type distribution across all predictions."""
    predictions = await supabase_get("ai_predictions", {
        "select": "primary_waste_type",
        "primary_waste_type": "not.is.null",
    })

    waste_counts = {}
    for p in predictions:
        wt = p.get("primary_waste_type")
        if wt:
            waste_counts[wt] = waste_counts.get(wt, 0) + 1

    colors = {
        "plastic": "#3b82f6", "organic": "#22c55e", "glass": "#a855f7",
        "metal": "#f59e0b", "electronic": "#ef4444", "biomedical": "#ec4899",
        "construction": "#78716c", "mixed": "#6b7280",
    }

    # Sort by count descending
    sorted_items = sorted(waste_counts.items(), key=lambda x: x[1], reverse=True)
    labels = [item[0].replace("_", " ").title() for item in sorted_items]
    data = [item[1] for item in sorted_items]
    dataset_colors = [colors.get(item[0], "#6b7280") for item in sorted_items]

    return {
        "labels": labels,
        "datasets": [{"label": "Waste Type Distribution", "data": data, "colors": dataset_colors}],
    }


@router.get("/charts/severity-trend")
async def get_severity_trend(
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Average pollution score per week for the last 8 weeks."""
    reports = await supabase_get("garbage_reports", {
        "select": "created_at,ai_predictions(pollution_score)",
    })

    weeks = []
    scores = []
    for i in range(7, -1, -1):
        start = datetime.utcnow() - timedelta(weeks=i + 1)
        end = datetime.utcnow() - timedelta(weeks=i)
        label = f"W{8 - i}"

        week_scores = [
            (r.get("ai_predictions") or {}).get("pollution_score", 0)
            for r in reports
            if start.isoformat() <= r.get("created_at", "") < end.isoformat()
            and (r.get("ai_predictions") or {}).get("pollution_score") is not None
        ]
        avg = round(sum(week_scores) / max(len(week_scores), 1), 1) if week_scores else 0
        weeks.append(label)
        scores.append(avg)

    return ChartData(
        labels=weeks,
        datasets=[ChartDataset(label="Avg Pollution Score", data=scores, color="#f59e0b")],
    )


@router.get("/charts/ward-comparison")
async def get_ward_comparison(
    limit: int = Query(8, le=20),
    _: dict = Depends(require_role("municipal", "admin")),
):
    """Ward-by-ward report count and avg score comparison."""
    reports = await supabase_get("garbage_reports", {
        "select": "ward,ai_predictions(pollution_score)",
        "ward": "not.is.null",
    })

    ward_data = {}
    for r in reports:
        w = r.get("ward")
        if not w:
            continue
        score = (r.get("ai_predictions") or {}).get("pollution_score")
        if w not in ward_data:
            ward_data[w] = {"count": 0, "scores": []}
        ward_data[w]["count"] += 1
        if score is not None:
            ward_data[w]["scores"].append(score)

    sorted_wards = sorted(ward_data.items(), key=lambda x: x[1]["count"], reverse=True)[:limit]

    labels = [w[0] for w in sorted_wards]
    counts = [w[1]["count"] for w in sorted_wards]
    avg_scores = [
        round(sum(w[1]["scores"]) / max(len(w[1]["scores"]), 1), 1)
        for w in sorted_wards
    ]

    return {
        "labels": labels,
        "datasets": [
            ChartDataset(label="Report Count", data=counts, color="#22c55e"),
            ChartDataset(label="Avg Pollution Score", data=avg_scores, color="#f59e0b"),
        ],
    }
