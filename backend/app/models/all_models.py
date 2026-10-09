import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Analyst")  # Admin, Analyst, Viewer
    organization = Column(String(255), default="Apex Financial Group")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    organization = Column(String(255), default="Apex Financial Group", index=True)
    name = Column(String(255), nullable=False)
    official_domain = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    official_handles = Column(Text, default="{}")  # JSON: {"x": "@apexbank", "linkedin": "company/apexbank"}
    target_keywords = Column(Text, default="[]")  # JSON: ["apex", "apexbank", "secure-apex"]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    threats = relationship("Threat", back_populates="brand", cascade="all, delete-orphan")
    early_warnings = relationship("EarlyWarningAlert", back_populates="brand", cascade="all, delete-orphan")

class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True)
    org_id = Column(String(255), default="Apex Financial Group", index=True)
    threat_type = Column(String(100), nullable=False)  # Phishing Website, Typosquatting Domain, Fake Support Profile, Malicious App, Executive Impersonation
    indicator_value = Column(String(1000), nullable=False)  # URL or Social Profile link
    domain = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    registrar = Column(String(255), default="Unknown Registrar")
    ip_address = Column(String(100), default="Unknown IP")
    asn = Column(String(100), default="Unknown ASN")
    ssl_issuer = Column(String(255), default="Unknown SSL")
    risk_score = Column(Integer, default=0)  # 0 to 100
    severity = Column(String(50), default="Low")  # Low, Medium, High
    confidence = Column(Float, default=0.85)  # 0.0 to 1.0
    status = Column(String(50), default="New")  # New, Under Review, Reported, Resolved
    detection_reasons = Column(Text, default="[]")  # JSON array of strings
    evidence_data = Column(Text, default="{}")  # JSON object with metrics
    campaign_cluster = Column(String(100), nullable=True)  # e.g. "Campaign-FIN-VIPER-04"
    is_sample = Column(Boolean, default=False)  # Explicitly distinguish sample vs live data
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    brand = relationship("Brand", back_populates="threats")
    case_notes = relationship("CaseNote", back_populates="threat", cascade="all, delete-orphan")

class CaseNote(Base):
    __tablename__ = "case_notes"

    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(255), default="Security Analyst")
    action = Column(String(100), default="Note Added")  # Status Change, Evidence Added, Takedown Sent, Note Added
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    threat = relationship("Threat", back_populates="case_notes")

class EarlyWarningAlert(Base):
    __tablename__ = "early_warnings"

    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"), nullable=True)
    org_id = Column(String(255), default="Apex Financial Group", index=True)
    title = Column(String(255), nullable=False)
    pattern_type = Column(String(100), nullable=False)  # Surge, Combosquatting Cluster, Shared Subnet Weaponization
    surge_count = Column(Integer, default=1)
    severity = Column(String(50), default="Medium")  # Medium, High, Critical
    confidence = Column(Float, default=0.80)
    evidence_summary = Column(Text, nullable=False)
    status = Column(String(50), default="Active")  # Active, Acknowledged, Dismissed
    detected_at = Column(DateTime, default=datetime.datetime.utcnow)
    acknowledged_at = Column(DateTime, nullable=True)
    dismissed_at = Column(DateTime, nullable=True)

    brand = relationship("Brand", back_populates="early_warnings")

class ThreatRelationship(Base):
    __tablename__ = "threat_relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"), nullable=False)
    target_threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(100), nullable=False)  # HOSTED_ON_SAME_IP, SHARED_REGISTRAR, SHARED_SSL, SIMILAR_DOMAIN
    evidence = Column(Text, nullable=False)
    confidence = Column(Float, default=0.85)
    is_confirmed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
