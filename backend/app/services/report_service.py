"""
EcoVision AI – Report Generation Service

Generates natural-language pollution reports using either:
  - Template engine (default, no API key needed)
  - OpenAI GPT (set LLM_PROVIDER=openai)
  - Google Gemini (set LLM_PROVIDER=gemini)
"""

from datetime import datetime, timedelta
from typing import Optional

from app.schemas import AIReportRequest, AIReportOut
from app.config import settings
from app.supabase_client import supabase_get


async def _gather_stats(data: AIReportRequest) -> dict:
    """Collect database statistics for the report period."""
    date_to = data.date_to or datetime.utcnow()
    if data.report_type == "daily":
        date_from = date_to - timedelta(days=1)
    elif data.report_type == "weekly":
        date_from = date_to - timedelta(weeks=1)
    elif data.report_type == "monthly":
        date_from = date_to - timedelta(days=30)
    else:
        date_from = data.date_from or (date_to - timedelta(days=7))

    params = {
        "select": "id,ward,ai_predictions(severity,primary_waste_type,pollution_score)",
        "created_at": f"gte.{date_from.isoformat()}",
    }
    if data.ward:
        params["ward"] = f"eq.{data.ward}"

    reports = await supabase_get("garbage_reports", params)

    total = len(reports)
    critical_count = 0
    high_count = 0
    waste_type_counts = {}
    avg_score_sum = 0.0
    score_count = 0

    for r in reports:
        p = r.get("ai_predictions") or {}
        severity = p.get("severity")
        if severity == "critical":
            critical_count += 1
        elif severity == "high":
            high_count += 1
        wt = p.get("primary_waste_type")
        if wt:
            waste_type_counts[wt] = waste_type_counts.get(wt, 0) + 1
        ps = p.get("pollution_score")
        if ps is not None:
            avg_score_sum += ps
            score_count += 1

    primary_waste = max(waste_type_counts, key=waste_type_counts.get) if waste_type_counts else "mixed"
    primary_pct = round(waste_type_counts.get(primary_waste, 0) / max(total, 1) * 100, 1)
    avg_score = round(avg_score_sum / max(score_count, 1), 1)

    return {
        "total": total,
        "critical": critical_count,
        "high": high_count,
        "primary_waste": primary_waste,
        "primary_pct": primary_pct,
        "avg_score": avg_score,
        "date_from": date_from,
        "date_to": date_to,
        "ward": data.ward,
        "waste_breakdown": waste_type_counts,
    }


def _template_report(stats: dict, report_type: str) -> AIReportOut:
    """Generate report using Jinja2-style templates — no LLM required."""
    ward_label = f"Ward {stats['ward']}" if stats.get("ward") else "All Wards"
    period_str = f"{stats['date_from'].strftime('%d %b')} – {stats['date_to'].strftime('%d %b %Y')}"

    title = f"EcoVision AI {report_type.title()} Pollution Report – {ward_label}"

    summary = (
        f"{ward_label} recorded {stats['total']} garbage reports between {period_str}. "
        f"The average pollution score was {stats['avg_score']}/100. "
        f"{stats['critical']} sites were classified as critical and {stats['high']} as high priority. "
        f"The dominant waste type was {stats['primary_waste'].replace('_', ' ').title()} "
        f"at {stats['primary_pct']}% of all reports."
    )

    findings = [
        f"Total garbage reports: {stats['total']}",
        f"Critical sites requiring immediate action: {stats['critical']}",
        f"High-priority sites: {stats['high']}",
        f"Dominant waste type: {stats['primary_waste'].replace('_', ' ').title()} ({stats['primary_pct']}%)",
        f"Average pollution score: {stats['avg_score']}/100",
    ]

    priority_areas = []
    if stats["critical"] > 0:
        priority_areas.append(f"{ward_label} – {stats['critical']} critical locations detected")
    if stats["primary_waste"] in ("biomedical", "electronic"):
        priority_areas.append("Hazardous waste collection required (biomedical/electronic)")
    if stats["avg_score"] > 70:
        priority_areas.append("Overall pollution index is elevated — intensify patrol frequency")

    recommendations = [
        "Deploy additional cleanup vehicles to critical zones",
        f"Focus on {stats['primary_waste'].replace('_', ' ')} waste collection infrastructure",
        "Coordinate with sanitation teams for immediate response to critical sites",
        "Run community awareness campaigns to reduce illegal dumping",
        "Install CCTV surveillance at repeat illegal dump locations",
    ]
    if stats["critical"] > 5:
        recommendations.insert(0, "Declare high-alert status for the ward — mobilize emergency cleanup")

    return AIReportOut(
        title=title,
        generated_at=datetime.utcnow(),
        report_type=report_type,
        summary=summary,
        key_findings=findings,
        priority_areas=priority_areas or ["No immediate critical areas — maintain current schedule"],
        recommendations=recommendations,
        statistics={
            "total_reports": stats["total"],
            "critical_sites": stats["critical"],
            "high_priority_sites": stats["high"],
            "avg_pollution_score": stats["avg_score"],
            "primary_waste_type": stats["primary_waste"],
            "primary_waste_percentage": stats["primary_pct"],
            "period": f"{stats['date_from'].isoformat()} to {stats['date_to'].isoformat()}",
        },
    )


async def _llm_report(stats: dict, report_type: str) -> AIReportOut:
    """
    Generate report using an LLM (OpenAI / Gemini).
    """
    prompt = f"""
You are an environmental analyst for a Smart City waste management system.
Generate a professional pollution report based on the following data:

Report Type: {report_type}
Ward: {stats.get('ward', 'All Wards')}
Total Reports: {stats['total']}
Critical Sites: {stats['critical']}
High Priority Sites: {stats['high']}
Average Pollution Score: {stats['avg_score']}/100
Primary Waste Type: {stats['primary_waste']} ({stats['primary_pct']}%)
Waste Breakdown: {stats['waste_breakdown']}

Generate a JSON response with keys:
- summary (string, 2-3 sentences)
- key_findings (list of 5 strings)
- priority_areas (list of 3 strings)
- recommendations (list of 5 strings)
"""
    if settings.LLM_PROVIDER == "openai":
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                json={
                    "model": settings.LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"},
                },
                timeout=30.0,
            )
            content = response.json()["choices"][0]["message"]["content"]
            import json
            parsed = json.loads(content)

    elif settings.LLM_PROVIDER == "gemini":
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={settings.GEMINI_API_KEY}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=30.0,
            )
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            import json
            parsed = json.loads(text)
    else:
        return _template_report(stats, report_type)

    ward_label = f"Ward {stats['ward']}" if stats.get("ward") else "All Wards"
    return AIReportOut(
        title=f"EcoVision AI {report_type.title()} Report – {ward_label}",
        generated_at=datetime.utcnow(),
        report_type=report_type,
        summary=parsed.get("summary", ""),
        key_findings=parsed.get("key_findings", []),
        priority_areas=parsed.get("priority_areas", []),
        recommendations=parsed.get("recommendations", []),
        statistics={
            "total_reports": stats["total"],
            "critical_sites": stats["critical"],
            "avg_pollution_score": stats["avg_score"],
        },
    )


async def generate_ai_report(data: AIReportRequest) -> AIReportOut:
    """Main entry point for report generation."""
    stats = await _gather_stats(data)

    if settings.LLM_PROVIDER in ("openai", "gemini"):
        return await _llm_report(stats, data.report_type)
    return _template_report(stats, data.report_type)
