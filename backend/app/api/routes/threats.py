import json
import socket
from datetime import datetime
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Threat, Brand, CaseNote, User
from app.schemas.all_schemas import ThreatScanRequest, ThreatUpdate, ThreatResponse, CaseNoteCreate, CaseNoteResponse
from app.ml.threat_classifier import assess_threat_risk
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/threats", tags=["Threat Detection & Investigation"])

def validate_ssrf_safe_indicator(indicator_url: str) -> str:
    """
    Validates that submitted URLs do not target internal networks or loopback addresses.
    Prevents Server-Side Request Forgery (SSRF).
    """
    raw = indicator_url.strip()
    if not raw.startswith("http://") and not raw.startswith("https://"):
        raw = "http://" + raw
    try:
        parsed = urlparse(raw)
        hostname = (parsed.hostname or "").lower()
        if not hostname:
            raise ValueError("Invalid hostname in URL")

        # Check blocked loopback and RFC 1918 prefixes
        for prefix in settings.BLOCKED_IP_PREFIXES:
            if hostname == prefix or hostname.startswith(prefix):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"SSRF Protection: Submissions targeting internal or private network host '{hostname}' are prohibited."
                )

        # Resolve IP to check if it resolves to private loopback
        try:
            resolved_ip = socket.gethostbyname(hostname)
            for prefix in settings.BLOCKED_IP_PREFIXES:
                if resolved_ip.startswith(prefix):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"SSRF Protection: Domain resolves to private IP address '{resolved_ip}', which is prohibited."
                    )
        except (socket.gaierror, socket.herror):
            # If domain cannot be resolved yet (newly registered or offline), allow lexical analysis
            pass

        return hostname
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid URL or indicator string: {str(e)}"
        )

@router.get("/", response_model=list[ThreatResponse])
def get_threats(
    brand_id: int = Query(None),
    severity: str = Query(None),
    status_filter: str = Query(None, alias="status"),
    threat_type: str = Query(None),
    is_sample: bool = Query(None),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves threat indicators strictly isolated to the user's registered organization,
    with granular filtering and search.
    """
    query = db.query(Threat).filter(Threat.org_id == current_user.organization)

    if brand_id is not None:
        query = query.filter(Threat.brand_id == brand_id)
    if severity:
        query = query.filter(Threat.severity == severity)
    if status_filter:
        query = query.filter(Threat.status == status_filter)
    if threat_type:
        query = query.filter(Threat.threat_type == threat_type)
    if is_sample is not None:
        query = query.filter(Threat.is_sample == is_sample)
    if search:
        search_pattern = f"%{search.lower().strip()}%"
        query = query.filter(
            (Threat.domain.ilike(search_pattern)) |
            (Threat.title.ilike(search_pattern)) |
            (Threat.indicator_value.ilike(search_pattern)) |
            (Threat.registrar.ilike(search_pattern))
        )

    threats = query.order_by(Threat.created_at.desc()).all()
    results = []
    for t in threats:
        results.append({
            "id": t.id,
            "brand_id": t.brand_id,
            "brand_name": t.brand.name if t.brand else "Unassigned Brand",
            "org_id": t.org_id,
            "threat_type": t.threat_type,
            "indicator_value": t.indicator_value,
            "domain": t.domain,
            "title": t.title,
            "registrar": t.registrar,
            "ip_address": t.ip_address,
            "asn": t.asn,
            "ssl_issuer": t.ssl_issuer,
            "risk_score": t.risk_score,
            "severity": t.severity,
            "confidence": t.confidence,
            "status": t.status,
            "detection_reasons": json.loads(t.detection_reasons) if t.detection_reasons else [],
            "evidence_data": json.loads(t.evidence_data) if t.evidence_data else {},
            "campaign_cluster": t.campaign_cluster,
            "is_sample": t.is_sample,
            "created_at": t.created_at,
            "updated_at": t.updated_at
        })
    return results

@router.post("/scan", response_model=ThreatResponse)
def scan_and_submit_threat(
    req: ThreatScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits a suspicious URL or profile for AI-powered lexical, similarity, and risk assessment.
    Enforces SSRF protection, stores record under user's organization, and tags as [LIVE] (is_sample=False).
    """
    hostname = validate_ssrf_safe_indicator(req.indicator_value)

    # Resolve Brand context within user's organization
    brand = None
    if req.brand_id:
        brand = db.query(Brand).filter(
            Brand.id == req.brand_id,
            Brand.organization == current_user.organization
        ).first()
    if not brand:
        brand = db.query(Brand).filter(Brand.organization == current_user.organization).first()

    brand_name = brand.name if brand else current_user.organization
    official_domain = brand.official_domain if brand else "company.com"
    keywords = json.loads(brand.target_keywords) if (brand and brand.target_keywords) else [brand_name.lower()]

    simulated_registrars = ["Namecheap Inc.", "GoDaddy LLC", "Hostinger Operations, UAB", "Tucows Domains Inc.", "Dynadot LLC"]
    simulated_reg = simulated_registrars[abs(hash(hostname)) % len(simulated_registrars)]
    simulated_ip = f"185.220.{abs(hash(hostname)) % 254 + 1}.{(abs(hash(hostname)) * 7) % 254 + 1}"

    # Perform Explainable Risk Assessment
    assessment = assess_threat_risk(
        indicator_value=req.indicator_value,
        threat_type=req.threat_type or "Phishing Website",
        brand_name=brand_name,
        official_domain=official_domain,
        target_keywords=keywords,
        registrar=simulated_reg,
        asn="AS200052"
    )

    reasons_list = [f"{f['factor']}: {f['evidence']}" for f in assessment["factors"]]
    title = req.title or f"Suspicious {req.threat_type or 'Indicator'} Targeting {brand_name}"

    new_threat = Threat(
        brand_id=brand.id if brand else None,
        org_id=current_user.organization,
        threat_type=req.threat_type or "Phishing Website",
        indicator_value=req.indicator_value,
        domain=hostname,
        title=title,
        registrar=simulated_reg,
        ip_address=simulated_ip,
        asn="AS200052 (Hosting Transit)",
        ssl_issuer="Let's Encrypt Authority X3",
        risk_score=assessment["risk_score"],
        severity=assessment["severity"],
        confidence=assessment["confidence"],
        status="New",
        detection_reasons=json.dumps(reasons_list),
        evidence_data=json.dumps(assessment),
        campaign_cluster=None,
        is_sample=False,  # Live real-time user-submitted threat
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(new_threat)
    db.commit()
    db.refresh(new_threat)

    # Create Case log entry
    case_note = CaseNote(
        threat_id=new_threat.id,
        user_name=current_user.full_name,
        action="Live Threat Submission",
        notes=f"User submitted suspicious indicator for analysis. Model assigned score {assessment['risk_score']} ({assessment['severity']}). {req.notes or 'No initial analyst notes provided.'}",
        created_at=datetime.utcnow()
    )
    db.add(case_note)
    db.commit()

    return {
        "id": new_threat.id,
        "brand_id": new_threat.brand_id,
        "brand_name": brand.name if brand else "Unassigned",
        "org_id": new_threat.org_id,
        "threat_type": new_threat.threat_type,
        "indicator_value": new_threat.indicator_value,
        "domain": new_threat.domain,
        "title": new_threat.title,
        "registrar": new_threat.registrar,
        "ip_address": new_threat.ip_address,
        "asn": new_threat.asn,
        "ssl_issuer": new_threat.ssl_issuer,
        "risk_score": new_threat.risk_score,
        "severity": new_threat.severity,
        "confidence": new_threat.confidence,
        "status": new_threat.status,
        "detection_reasons": reasons_list,
        "evidence_data": assessment,
        "campaign_cluster": new_threat.campaign_cluster,
        "is_sample": new_threat.is_sample,
        "created_at": new_threat.created_at,
        "updated_at": new_threat.updated_at
    }

@router.get("/{threat_id}", response_model=ThreatResponse)
def get_threat_detail(threat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieves full investigation details for a specific threat belonging to the user's organization.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    return {
        "id": t.id,
        "brand_id": t.brand_id,
        "brand_name": t.brand.name if t.brand else "Unassigned Brand",
        "org_id": t.org_id,
        "threat_type": t.threat_type,
        "indicator_value": t.indicator_value,
        "domain": t.domain,
        "title": t.title,
        "registrar": t.registrar,
        "ip_address": t.ip_address,
        "asn": t.asn,
        "ssl_issuer": t.ssl_issuer,
        "risk_score": t.risk_score,
        "severity": t.severity,
        "confidence": t.confidence,
        "status": t.status,
        "detection_reasons": json.loads(t.detection_reasons) if t.detection_reasons else [],
        "evidence_data": json.loads(t.evidence_data) if t.evidence_data else {},
        "campaign_cluster": t.campaign_cluster,
        "is_sample": t.is_sample,
        "created_at": t.created_at,
        "updated_at": t.updated_at
    }

@router.patch("/{threat_id}")
def update_threat_status(
    threat_id: int,
    req: ThreatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates investigation case status (New, Under Review, Reported, Resolved) and adds an audit log.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    old_status = t.status
    if req.status:
        t.status = req.status
        t.updated_at = datetime.utcnow()

    # Log action to Case History
    note_text = req.notes or f"Threat status transition from '{old_status}' to '{req.status}'."
    log_entry = CaseNote(
        threat_id=t.id,
        user_name=current_user.full_name,
        action=f"Status: {t.status}",
        notes=note_text,
        created_at=datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()

    return {"status": "success", "new_status": t.status, "message": "Case status updated successfully"}

@router.get("/{threat_id}/notes", response_model=list[CaseNoteResponse])
def get_case_notes(threat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retrieves full case investigation notes and audit history.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    notes = db.query(CaseNote).filter(CaseNote.threat_id == threat_id).order_by(CaseNote.created_at.desc()).all()
    return notes

@router.post("/{threat_id}/notes", response_model=CaseNoteResponse)
def add_case_note(
    threat_id: int,
    req: CaseNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Appends an analyst finding or investigation note.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")

    note = CaseNote(
        threat_id=threat_id,
        user_name=current_user.full_name,
        action=req.action,
        notes=req.notes,
        created_at=datetime.utcnow()
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{threat_id}")
def delete_threat(threat_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Deletes a threat record from the database.
    """
    t = db.query(Threat).filter(
        Threat.id == threat_id,
        Threat.org_id == current_user.organization
    ).first()
    if not t:
        raise HTTPException(status_code=404, detail="Threat indicator not found or access denied")
    db.delete(t)
    db.commit()
    return {"status": "success", "message": "Threat removed successfully"}
