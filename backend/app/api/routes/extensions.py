import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Threat, Brand, User, EarlyWarningAlert
from app.schemas.all_schemas import SimulationRequest, EarlyWarningUpdate
from app.services.extensions_service import (
    analyze_early_warning_signals,
    PREDEFINED_SIMULATION_SCENARIOS,
    COUNTERMEASURES,
    run_risk_simulation,
    generate_threat_investigation_brief,
    get_threat_campaign_timeline
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/extensions", tags=["Advanced Detection Extensions"])

# --- EXTENSION 2: EARLY WARNING SYSTEM ---
@router.get("/early-warnings")
def get_early_warning_signals(
    brand_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unique Feature Two: Early Warning System
    Records when indicators are first observed, compares observations against patterns,
    and returns early warnings that can be acknowledged or dismissed.
    """
    query = db.query(Threat).filter(Threat.org_id == current_user.organization)
    brand_name = current_user.organization
    
    if brand_id:
        query = query.filter(Threat.brand_id == brand_id)
        brand = db.query(Brand).filter(
            Brand.id == brand_id,
            Brand.organization == current_user.organization
        ).first()
        if brand:
            brand_name = brand.name
    else:
        first_brand = db.query(Brand).filter(Brand.organization == current_user.organization).first()
        if first_brand:
            brand_name = first_brand.name

    threat_rows = query.all()
    threat_dicts = [
        {
            "id": t.id,
            "domain": t.domain,
            "threat_type": t.threat_type,
            "risk_score": t.risk_score,
            "ip_address": t.ip_address,
            "registrar": t.registrar,
            "created_at": t.created_at
        }
        for t in threat_rows
    ]

    # Generate signals dynamically from temporal clustering
    computed_signals = analyze_early_warning_signals(threat_dicts, brand_name=brand_name)

    # Sync with DB EarlyWarningAlert records for this organization
    db_alerts = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.org_id == current_user.organization).all()
    existing_by_title = {a.title: a for a in db_alerts}

    # Add or update
    for sig in computed_signals:
        if sig["title"] not in existing_by_title:
            new_alert = EarlyWarningAlert(
                brand_id=brand_id,
                org_id=current_user.organization,
                title=sig["title"],
                pattern_type=sig["pattern_type"],
                surge_count=sig["surge_count"],
                severity=sig["severity"],
                confidence=sig["confidence"],
                evidence_summary=sig["evidence_summary"],
                status="Active",
                detected_at=datetime.utcnow()
            )
            db.add(new_alert)
            db.flush()
            existing_by_title[sig["title"]] = new_alert

    db.commit()

    # Query all alerts for display
    alerts_query = db.query(EarlyWarningAlert).filter(EarlyWarningAlert.org_id == current_user.organization)
    if brand_id:
        alerts_query = alerts_query.filter(EarlyWarningAlert.brand_id == brand_id)
    all_alerts = alerts_query.order_by(EarlyWarningAlert.detected_at.desc()).all()

    formatted_signals = []
    for a in all_alerts:
        formatted_signals.append({
            "id": a.id,
            "title": a.title,
            "pattern_type": a.pattern_type,
            "surge_count": a.surge_count,
            "severity": a.severity,
            "confidence": a.confidence,
            "evidence_summary": a.evidence_summary,
            "status": a.status,
            "detected_at": a.detected_at.strftime("%b %d, %Y %H:%M UTC") if a.detected_at else "Recently",
            "acknowledged_at": a.acknowledged_at.strftime("%b %d, %Y %H:%M UTC") if a.acknowledged_at else None,
            "dismissed_at": a.dismissed_at.strftime("%b %d, %Y %H:%M UTC") if a.dismissed_at else None,
            "recommended_action": "Review threat connections for shared infrastructure and queue registrar takedown notices.",
            "limitations": "Early warnings rely on velocity heuristics; manual corroboration recommended."
        })

    return {
        "brand_name": brand_name,
        "monitored_window": "72 Hours",
        "signals": formatted_signals,
        "summary": {
            "active_signals_count": sum(1 for s in formatted_signals if s["status"] == "Active"),
            "critical_signals_count": sum(1 for s in formatted_signals if s["severity"] == "Critical" and s["status"] == "Active"),
            "high_signals_count": sum(1 for s in formatted_signals if s["severity"] == "High" and s["status"] == "Active"),
            "total_signals": len(formatted_signals)
        }
    }

@router.patch("/early-warnings/{alert_id}")
def update_early_warning_status(
    alert_id: int,
    req: EarlyWarningUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows analysts to review, acknowledge, or dismiss early warning alerts.
    """
    alert = db.query(EarlyWarningAlert).filter(
        EarlyWarningAlert.id == alert_id,
        EarlyWarningAlert.org_id == current_user.organization
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Early warning record not found.")

    valid_statuses = ["Active", "Acknowledged", "Dismissed"]
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    alert.status = req.status
    if req.status == "Acknowledged":
        alert.acknowledged_at = datetime.utcnow()
    elif req.status == "Dismissed":
        alert.dismissed_at = datetime.utcnow()

    db.commit()
    return {"status": "success", "alert_id": alert.id, "new_status": alert.status}

# --- EXTENSION 3: DIGITAL RISK WHAT-IF SIMULATOR ---
@router.get("/simulation/scenarios")
def get_simulation_scenarios():
    """Returns available attack scenarios and protective countermeasure toggles."""
    return {
        "scenarios": PREDEFINED_SIMULATION_SCENARIOS,
        "countermeasures": COUNTERMEASURES
    }

@router.post("/simulation/run")
def execute_simulation(req: SimulationRequest):
    """
    Unique Feature Three: Digital Risk What-If Simulator
    Simulates hypothetical threat scenarios before they occur.
    Transparently calculates impact reduction and residual risk.
    """
    result = run_risk_simulation(req.scenario_key, req.active_countermeasures)
    return result

# --- EXTENSION 4: EXPLAINABLE INVESTIGATION ASSISTANT ---
@router.get("/assistant/explain/{threat_id}")
def get_threat_assistant_brief(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explainable Threat Investigation Assistant
    Summarizes threat evidence, explains risk scoring breakdown,
    checks for missing evidence, and suggests actionable investigation playbooks.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    threat_dict = {
        "id": t.id,
        "title": t.title,
        "domain": t.domain,
        "indicator_value": t.indicator_value,
        "threat_type": t.threat_type,
        "risk_score": t.risk_score,
        "severity": t.severity,
        "registrar": t.registrar,
        "ip_address": t.ip_address,
        "detection_reasons": json.loads(t.detection_reasons) if t.detection_reasons else []
    }

    brief = generate_threat_investigation_brief(threat_dict)
    return brief

# --- EXTENSION 5: THREAT CAMPAIGN EVOLUTION TIMELINE ---
@router.get("/timeline/{threat_id}")
def get_campaign_timeline(
    threat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Threat Campaign Evolution Timeline
    Visualizes the chronological lifecycle progression:
    Domain Acquisition -> DNS/MX Setup -> SSL Issuance -> Phishing Staging -> RiskRadar Detection -> SOC Action.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    threat_dict = {
        "id": t.id,
        "domain": t.domain,
        "registrar": t.registrar,
        "ip_address": t.ip_address,
        "risk_score": t.risk_score,
        "status": t.status
    }

    timeline_events = get_threat_campaign_timeline(threat_dict)
    return {
        "threat_id": t.id,
        "indicator": t.indicator_value,
        "campaign_cluster": t.campaign_cluster or "Independent Operation",
        "timeline": timeline_events
    }
