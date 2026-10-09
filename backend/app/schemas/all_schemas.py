from pydantic import BaseModel, EmailStr
from typing import Optional, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    organization: Optional[str] = "Apex Financial Group"
    role: Optional[str] = "Analyst"

class UserLogin(BaseModel):
    email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    organization: str
    created_at: datetime

# --- Brand Schemas ---
class BrandCreate(BaseModel):
    name: str
    official_domain: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    official_handles: Optional[dict[str, str]] = {}
    target_keywords: Optional[list[str]] = []

class BrandUpdate(BaseModel):
    name: Optional[str] = None
    official_domain: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    official_handles: Optional[dict[str, str]] = None
    target_keywords: Optional[list[str]] = None

class BrandResponse(BaseModel):
    id: int
    name: str
    organization: str
    official_domain: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    official_handles: dict[str, str]
    target_keywords: list[str]
    threat_count: Optional[int] = 0
    created_at: datetime

# --- Threat Schemas ---
class ThreatScanRequest(BaseModel):
    indicator_value: str
    threat_type: Optional[str] = "Phishing Website"
    brand_id: Optional[int] = None
    title: Optional[str] = None
    notes: Optional[str] = None

class ThreatUpdate(BaseModel):
    status: Optional[str] = None  # New, Under Review, Reported, Resolved
    notes: Optional[str] = None

class ThreatResponse(BaseModel):
    id: int
    brand_id: Optional[int]
    brand_name: Optional[str] = None
    org_id: str
    threat_type: str
    indicator_value: str
    domain: str
    title: str
    registrar: str
    ip_address: str
    asn: str
    ssl_issuer: str
    risk_score: int
    severity: str
    confidence: float
    status: str
    detection_reasons: list[str]
    evidence_data: dict[str, Any]
    campaign_cluster: Optional[str]
    is_sample: bool
    created_at: datetime
    updated_at: datetime

class CaseNoteCreate(BaseModel):
    action: str = "Investigation Update"
    notes: str

class CaseNoteResponse(BaseModel):
    id: int
    threat_id: int
    user_name: str
    action: str
    notes: str
    created_at: datetime

# --- Early Warning Schemas ---
class EarlyWarningUpdate(BaseModel):
    status: str  # Active, Acknowledged, Dismissed

# --- Simulation Schemas ---
class SimulationRequest(BaseModel):
    scenario_key: str
    active_countermeasures: list[str]

# --- Report Export Request ---
class ReportExportRequest(BaseModel):
    format: str = "html"  # html, json, csv
