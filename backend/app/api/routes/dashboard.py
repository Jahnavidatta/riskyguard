import json
from collections import Counter
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Threat, Brand, User, EarlyWarningAlert
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Metrics"])

@router.get("/stats")
def get_dashboard_stats(
    brand_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Dashboard Overview Statistics strictly scoped to the user's registered organization.
    Computes the 3 key metrics, 1 activity chart, recent high-priority threats, and early-warning summary.
    """
    query = db.query(Threat).filter(Threat.org_id == current_user.organization)
    if brand_id:
        query = query.filter(Threat.brand_id == brand_id)
        
    threats = query.all()
    brands_count = db.query(Brand).filter(Brand.organization == current_user.organization).count()

    # Three key metrics
    # 1. Active Threats: all unresolved threats
    active_threats = sum(1 for t in threats if t.status != "Resolved")
    # 2. High-Risk Threats: unresolved threats with High severity (score >= 70)
    high_risk_threats = sum(1 for t in threats if t.severity == "High" and t.status != "Resolved")
    # 3. Open Investigations: in New, Under Review, or Reported states
    open_investigations = sum(1 for t in threats if t.status in ["New", "Under Review", "Reported"])

    # Threat activity chart: 7-day timeline
    days_data = {}
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_str = d.strftime("%b %d")
        days_data[day_str] = {"date": day_str, "threats": 0, "high_risk": 0}

    for t in threats:
        if t.created_at:
            day_str = t.created_at.date().strftime("%b %d")
            if day_str in days_data:
                days_data[day_str]["threats"] += 1
                if t.severity == "High":
                    days_data[day_str]["high_risk"] += 1

    # Compact list of recent high-priority threats
    high_priority_threats = [t for t in threats if t.risk_score >= 60 and t.status != "Resolved"]
    high_priority_threats.sort(key=lambda x: (x.risk_score, x.created_at or datetime.min), reverse=True)
    recent_high_priority = []
    for t in high_priority_threats[:5]:
        recent_high_priority.append({
            "id": t.id,
            "domain": t.domain,
            "title": t.title,
            "threat_type": t.threat_type,
            "risk_score": t.risk_score,
            "severity": t.severity,
            "status": t.status,
            "is_sample": t.is_sample,
            "created_at": t.created_at
        })

    # Early-warning summary
    early_warnings = db.query(EarlyWarningAlert).filter(
        EarlyWarningAlert.org_id == current_user.organization,
        EarlyWarningAlert.status == "Active"
    )
    if brand_id:
        early_warnings = early_warnings.filter(EarlyWarningAlert.brand_id == brand_id)
    active_warnings = early_warnings.all()

    early_warning_summary = {
        "active_count": len(active_warnings),
        "has_warnings": len(active_warnings) > 0,
        "latest_alert": {
            "id": active_warnings[0].id,
            "title": active_warnings[0].title,
            "severity": active_warnings[0].severity,
            "pattern_type": active_warnings[0].pattern_type,
            "evidence": active_warnings[0].evidence_summary
        } if active_warnings else None
    }

    return {
        "metrics": {
            "active_threats": active_threats,
            "high_risk_threats": high_risk_threats,
            "open_investigations": open_investigations,
            "total_threats": len(threats),
            "monitored_brands": brands_count
        },
        "activity_chart": list(days_data.values()),
        "recent_high_priority": recent_high_priority,
        "early_warning_summary": early_warning_summary
    }
