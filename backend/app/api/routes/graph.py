from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import Threat, User
from app.network.graph_engine import build_threat_relationship_graph
from app.api.deps import get_current_user

router = APIRouter(prefix="/graph", tags=["Threat Relationship Analysis (NetworkX)"])

@router.get("/threat-connections")
def get_threat_connections(
    brand_id: int = Query(None),
    min_risk: int = Query(0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unique Feature One: Hidden Threat Connection Finder
    Uses NetworkX to construct an explainable relationship graph connecting threats
    strictly isolated to the user's organization via shared IPs, registrars, and SSL.
    """
    query = db.query(Threat).filter(Threat.org_id == current_user.organization)
    if brand_id:
        query = query.filter(Threat.brand_id == brand_id)
    if min_risk > 0:
        query = query.filter(Threat.risk_score >= min_risk)

    threat_rows = query.all()
    
    threat_dicts = []
    for t in threat_rows:
        threat_dicts.append({
            "id": t.id,
            "title": t.title,
            "domain": t.domain,
            "indicator_value": t.indicator_value,
            "threat_type": t.threat_type,
            "risk_score": t.risk_score,
            "severity": t.severity,
            "registrar": t.registrar,
            "ip_address": t.ip_address,
            "asn": t.asn,
            "ssl_issuer": t.ssl_issuer,
            "is_sample": t.is_sample
        })

    graph_data = build_threat_relationship_graph(threat_dicts)
    return graph_data
