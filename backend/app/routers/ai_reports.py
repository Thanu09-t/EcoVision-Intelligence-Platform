from datetime import datetime
from fastapi import APIRouter, Depends

from app.schemas import AIReportRequest, AIReportOut
from app.routers.auth import require_role
from app.services.report_service import generate_ai_report

router = APIRouter(prefix="/api/ai-reports", tags=["AI Reports"])


@router.post("/generate", response_model=AIReportOut)
async def generate_report(
    data: AIReportRequest,
    current_user: dict = Depends(require_role("municipal", "admin")),
):
    """Generate an AI-powered pollution report using LLM or template engine."""
    report = await generate_ai_report(data)
    return report


@router.post("/download-pdf")
async def download_pdf_report(
    data: AIReportRequest,
    current_user: dict = Depends(require_role("municipal", "admin")),
):
    """Generate an AI report and download it as a formatted PDF."""
    from fastapi.responses import StreamingResponse
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    report = await generate_ai_report(data)

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#22c55e'),
        spaceAfter=15
    )
    section_title_style = ParagraphStyle(
        'SecTitle',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#3b82f6'),
        spaceBefore=15,
        spaceAfter=10
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#000000'),
        spaceAfter=8
    )

    story.append(Paragraph(report.title, title_style))
    story.append(Paragraph(f"Generated at: {report.generated_at.strftime('%Y-%m-%d %H:%M:%S UTC')}", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Executive Summary", section_title_style))
    story.append(Paragraph(report.summary, body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Key Findings", section_title_style))
    for finding in report.key_findings:
        story.append(Paragraph(f"• {finding}", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Priority Areas", section_title_style))
    for area in report.priority_areas:
        story.append(Paragraph(f"• {area}", body_style))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Recommendations", section_title_style))
    for rec in report.recommendations:
        story.append(Paragraph(f"• {rec}", body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("Statistics Overview", section_title_style))
    table_data = [["Metric", "Value"]]
    for k, v in report.statistics.items():
        label = k.replace("_", " ").title()
        table_data.append([label, str(v)])

    t = Table(table_data, colWidths=[200, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    story.append(t)

    doc.build(story)
    buffer.seek(0)

    filename = f"ecovision_ai_report_{data.report_type}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )



@router.get("/templates")
async def list_report_templates(_: dict = Depends(require_role("municipal", "admin"))):
    """Available report templates."""
    return {
        "templates": [
            {"id": "daily", "name": "Daily Report", "description": "Today's pollution overview"},
            {"id": "weekly", "name": "Weekly Report", "description": "Last 7 days summary"},
            {"id": "monthly", "name": "Monthly Report", "description": "Full monthly analysis"},
            {"id": "ward", "name": "Ward Report", "description": "Ward-specific detailed report"},
            {"id": "critical", "name": "Critical Alert Report", "description": "All critical sites requiring immediate action"},
        ]
    }
