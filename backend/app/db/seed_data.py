import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.all_models import User, Organization, Brand, Threat, CaseNote, EarlyWarningAlert, ThreatRelationship
from app.core.security import hash_password
from app.ml.threat_classifier import assess_threat_risk

def seed_database_demo_data(db: Session) -> dict[str, int]:
    """
    Seeds rich demonstration data including organization multi-tenancy,
    monitored brands with descriptions, sample threats labeled [SAMPLE DATA],
    connected campaign infrastructure, investigation case logs, early warning alerts,
    and threat relationship records.
    """
    # 0. Seed Organization
    org = db.query(Organization).filter(Organization.name == "Apex Financial Group").first()
    if not org:
        org = Organization(name="Apex Financial Group", slug="apex-financial-group")
        db.add(org)
        db.commit()

    # 1. Seed Users if not existing
    admin_user = db.query(User).filter(User.email == "admin@riskradar.io").first()
    if not admin_user:
        admin_user = User(
            email="admin@riskradar.io",
            hashed_password=hash_password("RiskRadar@2026"),
            full_name="Chief Information Security Officer",
            role="Admin",
            organization="Apex Financial Group"
        )
        db.add(admin_user)

    analyst_user = db.query(User).filter(User.email == "analyst@riskradar.io").first()
    if not analyst_user:
        analyst_user = User(
            email="analyst@riskradar.io",
            hashed_password=hash_password("Analyst@2026"),
            full_name="Lead SOC Threat Analyst",
            role="Analyst",
            organization="Apex Financial Group"
        )
        db.add(analyst_user)

    db.commit()

    # 2. Seed Brands if not existing
    brand1 = db.query(Brand).filter(Brand.name == "Apex Global Bank").first()
    if not brand1:
        brand1 = Brand(
            name="Apex Global Bank",
            organization="Apex Financial Group",
            official_domain="apexbank.com",
            description="Tier-1 multinational retail and investment banking institution serving 12M global clients.",
            logo_url="https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=128&auto=format&fit=crop&q=80",
            official_handles=json.dumps({"x": "@apexbank", "linkedin": "apex-bank", "instagram": "@apexbank_official"}),
            target_keywords=json.dumps(["apex", "apexbank", "apex-pay", "apex-login", "apex-banking", "apex-verify"])
        )
        db.add(brand1)

    brand2 = db.query(Brand).filter(Brand.name == "SafePay Technologies").first()
    if not brand2:
        brand2 = Brand(
            name="SafePay Technologies",
            organization="Apex Financial Group",
            official_domain="safepay.io",
            description="Next-generation digital payment gateway and consumer multi-currency wallet.",
            logo_url="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=128&auto=format&fit=crop&q=80",
            official_handles=json.dumps({"x": "@safepay_io", "linkedin": "safepay-technologies"}),
            target_keywords=json.dumps(["safepay", "safepay-wallet", "safe-pay", "safepay-portal"])
        )
        db.add(brand2)

    brand3 = db.query(Brand).filter(Brand.name == "CloudScale Networks").first()
    if not brand3:
        brand3 = Brand(
            name="CloudScale Networks",
            organization="Apex Financial Group",
            official_domain="cloudscale.net",
            description="Enterprise edge cloud infrastructure and zero-trust SD-WAN networking.",
            logo_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&auto=format&fit=crop&q=80",
            official_handles=json.dumps({"x": "@cloudscale_net"}),
            target_keywords=json.dumps(["cloudscale", "cloud-scale", "cloudscale-vpn"])
        )
        db.add(brand3)

    db.commit()
    db.refresh(brand1)
    db.refresh(brand2)
    db.refresh(brand3)

    # 3. Seed Sample Threats if empty
    existing_threats = db.query(Threat).count()
    if existing_threats == 0:
        sample_definitions = [
            # Syndicate 1 (Shared IP 185.220.101.45, Namecheap registrar)
            {
                "brand_id": brand1.id,
                "threat_type": "Phishing Website",
                "indicator_value": "https://apex-bank-verify.xyz/login.php",
                "domain": "apex-bank-verify.xyz",
                "title": "Credential Harvesting Portal Mimicking Apex Bank",
                "registrar": "Namecheap Inc.",
                "ip_address": "185.220.101.45",
                "asn": "AS200052 (Bulletproof Transit)",
                "ssl_issuer": "Let's Encrypt Authority X3",
                "status": "Under Review",
                "campaign_cluster": "CAMPAIGN-SYNDICATE-01",
                "hours_ago": 18
            },
            {
                "brand_id": brand1.id,
                "threat_type": "Phishing Website",
                "indicator_value": "https://apexbank-secure-auth.top",
                "domain": "apexbank-secure-auth.top",
                "title": "Lookalike 2FA Phishing Interceptor",
                "registrar": "Namecheap Inc.",
                "ip_address": "185.220.101.45",
                "asn": "AS200052 (Bulletproof Transit)",
                "ssl_issuer": "Let's Encrypt Authority X3",
                "status": "Reported",
                "campaign_cluster": "CAMPAIGN-SYNDICATE-01",
                "hours_ago": 36
            },
            {
                "brand_id": brand1.id,
                "threat_type": "Typosquatting Domain",
                "indicator_value": "https://apex-banking-update.click",
                "domain": "apex-banking-update.click",
                "title": "Combosquatting Domain Prepared for Urgent KYC Lures",
                "registrar": "Namecheap Inc.",
                "ip_address": "185.220.101.45",
                "asn": "AS200052 (Bulletproof Transit)",
                "ssl_issuer": "ZeroSSL RSA Domain CA",
                "status": "New",
                "campaign_cluster": "CAMPAIGN-SYNDICATE-01",
                "hours_ago": 8
            },
            {
                "brand_id": brand1.id,
                "threat_type": "Phishing Website",
                "indicator_value": "https://apex-customer-support.xyz/helpdesk",
                "domain": "apex-customer-support.xyz",
                "title": "Deceptive Support Ticket Gateway Harvesting Passwords",
                "registrar": "Namecheap Inc.",
                "ip_address": "185.220.101.45",
                "asn": "AS200052 (Bulletproof Transit)",
                "ssl_issuer": "Let's Encrypt Authority X3",
                "status": "Under Review",
                "campaign_cluster": "CAMPAIGN-SYNDICATE-01",
                "hours_ago": 26
            },
            # Syndicate 2 (Shared IP 91.215.85.17, Hostinger registrar)
            {
                "brand_id": brand2.id,
                "threat_type": "Phishing Website",
                "indicator_value": "https://safepay-wallet-recovery.work",
                "domain": "safepay-wallet-recovery.work",
                "title": "Fake SafePay Seed Phrase Extraction Gateway",
                "registrar": "Hostinger Operations, UAB",
                "ip_address": "91.215.85.17",
                "asn": "AS49870 (Hostinger Datacenter)",
                "ssl_issuer": "Sectigo RSA Domain Validation CA",
                "status": "Under Review",
                "campaign_cluster": "CAMPAIGN-SYNDICATE-02",
                "hours_ago": 14
            },
            {
                "brand_id": brand2.id,
                "threat_type": "Phishing Website",
                "indicator_value": "https://safepay-login-portal.site",
                "domain": "safepay-login-portal.site",
                "title": "Fake SafePay OAuth Authorization Screen",
                "registrar": "Hostinger Operations, UAB",
                "ip_address": "91.215.85.17",
                "asn": "AS49870 (Hostinger Datacenter)",
                "ssl_issuer": "Sectigo RSA Domain Validation CA",
                "status": "New",
                "campaign_cluster": "CAMPAIGN-SYNDICATE-02",
                "hours_ago": 4
            },
            # Social Profile & Mobile APK Threats
            {
                "brand_id": brand1.id,
                "threat_type": "Fake Support Profile",
                "indicator_value": "https://twitter.com/ApexBank_HelpDesk_Official",
                "domain": "twitter.com",
                "title": "Impersonating Official Customer Care on X (Twitter)",
                "registrar": "Public Social Platform",
                "ip_address": "104.244.42.1",
                "asn": "AS13414 (Twitter Inc)",
                "ssl_issuer": "DigiCert TLS RSA SHA256 2020 CA1",
                "status": "Reported",
                "campaign_cluster": None,
                "hours_ago": 48
            },
            {
                "brand_id": brand1.id,
                "threat_type": "Malicious App",
                "indicator_value": "https://apk-fastload.buzz/apps/ApexBankMobile-v5.apk",
                "domain": "apk-fastload.buzz",
                "title": "Trojanized Android Banking Application with SMS Intercept",
                "registrar": "Tucows Domains Inc.",
                "ip_address": "194.87.144.20",
                "asn": "AS206981 (Offshore Host)",
                "ssl_issuer": "cPanel, Inc. Certification Authority",
                "status": "New",
                "campaign_cluster": None,
                "hours_ago": 12
            },
            {
                "brand_id": brand1.id,
                "threat_type": "Executive Impersonation",
                "indicator_value": "https://linkedin.com/in/mark-spencer-ceo-apex-official",
                "domain": "linkedin.com",
                "title": "Spoofed Executive Profile Attempting Vendor Fraud",
                "registrar": "Public Professional Network",
                "ip_address": "108.174.10.10",
                "asn": "AS14413 (LinkedIn)",
                "ssl_issuer": "DigiCert Global Root CA",
                "status": "Resolved",
                "campaign_cluster": None,
                "hours_ago": 72
            },
            # Low Risk Items to show discrimination
            {
                "brand_id": brand1.id,
                "threat_type": "Typosquatting Domain",
                "indicator_value": "https://apex-partners-advisory.com",
                "domain": "apex-partners-advisory.com",
                "title": "Unrelated Financial Advisory Firm (Benign Third-Party)",
                "registrar": "GoDaddy LLC",
                "ip_address": "198.185.159.144",
                "asn": "AS53831 (Squarespace)",
                "ssl_issuer": "Let's Encrypt",
                "status": "Resolved",
                "campaign_cluster": None,
                "hours_ago": 96
            }
        ]

        created_threats = []
        for s in sample_definitions:
            assessment = assess_threat_risk(
                indicator_value=s["indicator_value"],
                threat_type=s["threat_type"],
                brand_name="Apex Global Bank" if s["brand_id"] == brand1.id else "SafePay Technologies",
                official_domain="apexbank.com" if s["brand_id"] == brand1.id else "safepay.io",
                target_keywords=["apex", "apexbank", "safepay", "wallet"],
                registrar=s["registrar"],
                asn=s["asn"]
            )

            # Benign override for the low risk sample
            if "partners-advisory" in s["domain"]:
                assessment["risk_score"] = 28
                assessment["severity"] = "Low"
                assessment["confidence"] = 0.90

            created_time = datetime.utcnow() - timedelta(hours=s["hours_ago"])
            reasons_list = [f"{f['factor']}: {f['evidence']}" for f in assessment["factors"]]

            threat_obj = Threat(
                brand_id=s["brand_id"],
                org_id="Apex Financial Group",
                threat_type=s["threat_type"],
                indicator_value=s["indicator_value"],
                domain=s["domain"],
                title=s["title"],
                registrar=s["registrar"],
                ip_address=s["ip_address"],
                asn=s["asn"],
                ssl_issuer=s["ssl_issuer"],
                risk_score=assessment["risk_score"],
                severity=assessment["severity"],
                confidence=assessment["confidence"],
                status=s["status"],
                detection_reasons=json.dumps(reasons_list),
                evidence_data=json.dumps(assessment),
                campaign_cluster=s["campaign_cluster"],
                is_sample=True,  # Clearly distinguish sample data
                created_at=created_time,
                updated_at=created_time
            )
            db.add(threat_obj)
            db.flush()
            created_threats.append(threat_obj)

            # Add an initial case log
            note = CaseNote(
                threat_id=threat_obj.id,
                user_name="RiskRadar Automated Pipeline",
                action="Detection & Ingestion",
                notes=f"Detected indicator via automated telemetry. Calculated Risk Score: {assessment['risk_score']} ({assessment['severity']}). [SAMPLE DATA]",
                created_at=created_time
            )
            db.add(note)

            if s["status"] in ["Under Review", "Reported", "Resolved"]:
                note2 = CaseNote(
                    threat_id=threat_obj.id,
                    user_name="Lead SOC Threat Analyst",
                    action=f"Status: {s['status']}",
                    notes=f"Analyst initiated case handling: verified evidence parameters. Takedown notice queued to registrar abuse desk at {s['registrar']}.",
                    created_at=created_time + timedelta(hours=2)
                )
                db.add(note2)

        # Seed Threat Relationships
        if len(created_threats) >= 4:
            # Connect Syndicate 1 threats (0, 1, 2, 3 share 185.220.101.45)
            rel1 = ThreatRelationship(
                source_threat_id=created_threats[0].id,
                target_threat_id=created_threats[1].id,
                relationship_type="HOSTED_ON_SAME_IP",
                evidence="Both indicators resolve to bulletproof IP 185.220.101.45 and registered via Namecheap Inc.",
                confidence=0.95,
                is_confirmed=True
            )
            rel2 = ThreatRelationship(
                source_threat_id=created_threats[0].id,
                target_threat_id=created_threats[3].id,
                relationship_type="HOSTED_ON_SAME_IP",
                evidence="Shared hosting provider infrastructure on 185.220.101.45",
                confidence=0.95,
                is_confirmed=True
            )
            db.add_all([rel1, rel2])

        # Seed Early Warnings
        alert1 = EarlyWarningAlert(
            brand_id=brand1.id,
            org_id="Apex Financial Group",
            title="Critical Surge Alert: Multiple Coordinated Domains Targeting Apex Global Bank",
            pattern_type="Combosquatting Domain Surge",
            surge_count=4,
            severity="Critical",
            confidence=0.88,
            evidence_summary="Detected 4 newly registered lookalike domains within a 72-hour window. Temporal clustering indicates an active reconnaissance or pre-weaponization phase.",
            status="Active",
            detected_at=datetime.utcnow() - timedelta(hours=12)
        )
        alert2 = EarlyWarningAlert(
            brand_id=brand1.id,
            org_id="Apex Financial Group",
            title="Infrastructure Pivot Warning: Shared Host 185.220.101.45",
            pattern_type="Hosting Infrastructure Reuse",
            surge_count=4,
            severity="High",
            confidence=0.92,
            evidence_summary="Host IP 185.220.101.45 is serving 4 distinct brand-impersonation indicators under Namecheap. Attackers are reusing shared server configuration.",
            status="Active",
            detected_at=datetime.utcnow() - timedelta(hours=24)
        )
        alert3 = EarlyWarningAlert(
            brand_id=brand1.id,
            org_id="Apex Financial Group",
            title="Cross-Platform Brand Hijacking Signal",
            pattern_type="Omnichannel Social Spoofing",
            surge_count=2,
            severity="Medium",
            confidence=0.84,
            evidence_summary="Coordinated social media accounts detected impersonating VIP customer-care handles on Twitter and LinkedIn while simultaneously routing victims to external phishing URLs.",
            status="Acknowledged",
            detected_at=datetime.utcnow() - timedelta(hours=36),
            acknowledged_at=datetime.utcnow() - timedelta(hours=6)
        )
        db.add_all([alert1, alert2, alert3])

        db.commit()

    return {"status": "success", "message": "Demo sample dataset seeded successfully"}
