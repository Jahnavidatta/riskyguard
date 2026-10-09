import json
import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Threat, Brand, User
from app.api.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Investigation Reports & Export"])

@router.get("/export/{threat_id}", response_class=HTMLResponse)
def export_threat_html_report(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a beautifully formatted, printable Digital Risk Investigation Dossier.
    Suitable for executive briefing, legal takedowns, and incident records.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    brand_name = t.brand.name if t.brand else current_user.organization
    evidence = json.loads(t.evidence_data) if t.evidence_data else {}
    factors = evidence.get("factors", [])

    notes = [f"[{n.created_at.strftime('%Y-%m-%d %H:%M')}] {n.user_name} ({n.action}): {n.notes}" for n in t.case_notes]

    severity_color = "#ef4444" if t.severity == "High" else ("#f59e0b" if t.severity == "Medium" else "#10b981")

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>RiskRadar Security Dossier - #{t.id} {t.domain}</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; line-height: 1.6; }}
            .header {{ border-bottom: 3px solid #0284c7; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }}
            .brand-title {{ font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }}
            .badge {{ display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 700; font-size: 14px; color: #fff; background-color: {severity_color}; }}
            .card {{ border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 24px; background: #f8fafc; }}
            .grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }}
            .metric {{ font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600; }}
            .val {{ font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; font-family: monospace; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 16px; }}
            th, td {{ border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; font-size: 14px; }}
            th {{ background: #f1f5f9; font-weight: 600; }}
            .footer {{ margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #94a3b8; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="brand-title">🛡️ RiskRadar | Threat Investigation Dossier</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 4px;">Incident Reference #{t.id} &bull; Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</div>
            </div>
            <div>
                <span class="badge">{t.severity} Risk &bull; Score {t.risk_score}/100</span>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a;">Executive Threat Summary</h3>
            <p>
                This dossier documents an active digital threat targeting <strong>{brand_name}</strong>.
                The indicator <code>{t.indicator_value}</code> was identified by the RiskRadar AI detection engine
                and classified with <strong>{t.severity} severity</strong> and <strong>{int(t.confidence * 100)}% model confidence</strong>.
                Current investigation status is <strong>{t.status}</strong>.
            </p>
        </div>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a;">Technical Infrastructure & IOC Parameters</h3>
            <div class="grid">
                <div><div class="metric">Threat Indicator</div><div class="val">{t.indicator_value}</div></div>
                <div><div class="metric">Domain Host</div><div class="val">{t.domain}</div></div>
                <div><div class="metric">Host IP Address</div><div class="val">{t.ip_address}</div></div>
                <div><div class="metric">Registrar</div><div class="val">{t.registrar}</div></div>
                <div><div class="metric">Autonomous System (ASN)</div><div class="val">{t.asn}</div></div>
                <div><div class="metric">SSL Certificate Authority</div><div class="val">{t.ssl_issuer}</div></div>
            </div>
        </div>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a;">Documented Evidence & Scoring Factors</h3>
            <table>
                <thead>
                    <tr>
                        <th>Risk Factor</th>
                        <th>Technique Observed</th>
                        <th>Impact</th>
                        <th>Corroborating Evidence</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join(f"<tr><td><strong>{f.get('factor', 'Detection')}</strong></td><td>{f.get('technique', 'N/A')}</td><td style='color: #ef4444; font-weight: bold;'>{f.get('impact', '')}</td><td>{f.get('evidence', '')}</td></tr>" for f in factors)}
                </tbody>
            </table>
        </div>

        <div class="card">
            <h3 style="margin-top: 0; color: #0f172a;">Case Audit Log & Analyst Actions</h3>
            {''.join(f"<div style='margin-bottom: 8px; font-size: 13px; border-left: 3px solid #38bdf8; padding-left: 10px;'>{note}</div>" for note in notes) if notes else "<p style='color: #94a3b8;'>No manual notes recorded.</p>"}
        </div>

        <div class="footer">
            Confidential &bull; Prepared by RiskRadar Digital Risk Protection Platform for {current_user.organization or 'Enterprise Security'} &bull; All Rights Reserved.
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.get("/export-all/csv")
def export_all_threats_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exports all organization threats to a downloadable CSV format."""
    threats = db.query(Threat).filter(Threat.org_id == current_user.organization).order_by(Threat.created_at.desc()).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Threat ID", "Target Brand", "Threat Type", "Indicator Value", "Domain",
        "Risk Score", "Severity", "Confidence", "Status", "IP Address",
        "Registrar", "ASN", "Campaign Cluster", "Is Sample Data", "Created At"
    ])

    for t in threats:
        writer.writerow([
            t.id,
            t.brand.name if t.brand else "Unassigned",
            t.threat_type,
            t.indicator_value,
            t.domain,
            t.risk_score,
            t.severity,
            t.confidence,
            t.status,
            t.ip_address,
            t.registrar,
            t.asn,
            t.campaign_cluster or "None",
            t.is_sample,
            t.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=RiskRadar_Threat_Export_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"}
    )
