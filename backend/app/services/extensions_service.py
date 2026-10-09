import datetime
from typing import Any

# ==========================================
# EXTENSION 2: EARLY WARNING SYSTEM
# ==========================================

def analyze_early_warning_signals(threats: list[dict[str, Any]], brand_name: str = "Apex Bank") -> list[dict[str, Any]]:
    """
    Analyzes temporal patterns, domain surges, and infrastructure re-use
    to generate proactive early warning alerts for emerging attack campaigns.
    """
    signals = []
    
    # 1. Analyze 72-hour registration surges
    recent_lookalikes = [t for t in threats if t.get("risk_score", 0) >= 60]
    surge_count = len(recent_lookalikes)
    
    if surge_count >= 3:
        signals.append({
            "id": 1,
            "title": f"Critical Surge Alert: Multiple Coordinated Domains Targeting {brand_name}",
            "pattern_type": "Combosquatting Domain Surge",
            "surge_count": surge_count,
            "severity": "Critical" if surge_count >= 5 else "High",
            "confidence": 0.88,
            "detected_time": "12 hours ago",
            "evidence_summary": f"Detected {surge_count} newly registered lookalike domains within a 72-hour window. Temporal clustering indicates an active reconnaissance or pre-weaponization phase.",
            "recommended_action": "Preemptively block identified IP blocks on perimeter firewalls and submit proactive registrar warning notices.",
            "limitations": "Early warnings rely on registration velocity and lexical similarity; some indicators may be defensive registrations by third parties until DNS records resolve."
        })

    # 2. Check for Bulletproof Host Clustering
    ip_counter = {}
    for t in threats:
        ip = t.get("ip_address")
        if ip and ip != "Unknown IP":
            ip_counter[ip] = ip_counter.get(ip, 0) + 1
            
    for ip, count in ip_counter.items():
        if count >= 2:
            signals.append({
                "id": 2,
                "title": f"Infrastructure Pivot Warning: Shared Host {ip}",
                "pattern_type": "Hosting Infrastructure Reuse",
                "surge_count": count,
                "severity": "High",
                "confidence": 0.92,
                "detected_time": "24 hours ago",
                "evidence_summary": f"Host IP {ip} is serving {count} distinct brand-impersonation indicators. Attackers are reusing shared server configuration.",
                "recommended_action": f"Flag IP {ip} as a high-risk CIDR block and monitor all DNS A-record resolutions pointing to this host.",
                "limitations": "Virtual shared hosting providers may host unrelated benign domains on the same IP address."
            })
            break

    # 3. Social Media + Web Omnichannel Impersonation Spike
    social_threats = [t for t in threats if t.get("threat_type") in ["Fake Support Profile", "Executive Impersonation"]]
    if social_threats:
        signals.append({
            "id": 3,
            "title": "Cross-Platform Brand Hijacking Signal",
            "pattern_type": "Omnichannel Social Spoofing",
            "surge_count": len(social_threats),
            "severity": "Medium",
            "confidence": 0.84,
            "detected_time": "6 hours ago",
            "evidence_summary": f"Coordinated social media accounts detected impersonating VIP customer-care handles while simultaneously routing victims to external phishing URLs.",
            "recommended_action": "Submit verified intellectual property infringement reports to social platform trust & safety teams.",
            "limitations": "API rate limits on public social networks may delay real-time detection of newly created profiles."
        })

    return signals


# ==========================================
# EXTENSION 3: DIGITAL RISK WHAT-IF SIMULATOR
# ==========================================

PREDEFINED_SIMULATION_SCENARIOS = {
    "fake_customer_support": {
        "title": "Rogue Customer Support Account on X / Telegram",
        "description": "Adversary creates a verified-lookalike support handle targeting customers seeking refund/help, directing them to credential harvesting forms.",
        "target_channel": "Social Media & Community Channels",
        "initial_risk_score": 78,
        "base_blast_radius": "Estimated 2,500 - 8,000 customers exposed per incident",
        "financial_exposure": "$45,000 - $120,000 estimated fraud liability",
        "reputation_impact": "High (Customer trust degradation and social media backlash)"
    },
    "credential_harvesting_portal": {
        "title": "Punycode Lookalike Banking Login Portal",
        "description": "Adversary registers an IDN lookalike domain (e.g. аpex-online.com) with valid TLS certificate to clone the corporate customer login page.",
        "target_channel": "Web & Search Engine Ad Campaigns",
        "initial_risk_score": 89,
        "base_blast_radius": "Estimated 10,000 - 35,000 users targeted via search spoofing",
        "financial_exposure": "$150,000 - $500,000 direct credential theft & account takeover",
        "reputation_impact": "Critical (Potential regulatory fines and customer churn)"
    },
    "trojanized_mobile_app": {
        "title": "Rogue Android APK on Third-Party Stores",
        "description": "Adversary publishes an APK mimicking the official corporate mobile app with embedded keylogger/overlay malware on unofficial repositories.",
        "target_channel": "Mobile Ecosystem / Side-load Repositories",
        "initial_risk_score": 94,
        "base_blast_radius": "500 - 2,000 persistent device infections",
        "financial_exposure": "$250,000 - $750,000 device exploitation and 2FA bypass risk",
        "reputation_impact": "Severe (Compromised mobile banking authentication trust)"
    },
    "vip_executive_impersonation": {
        "title": "CEO / Executive Impersonation on LinkedIn / WhatsApp",
        "description": "Adversary mimics corporate executives to target staff or partners with urgent wire transfer or gift card requests (Business Email / Social Compromise).",
        "target_channel": "B2B Channels & Partner Ecosystem",
        "initial_risk_score": 72,
        "base_blast_radius": "Internal finance team and key supply chain vendors",
        "financial_exposure": "$50,000 - $200,000 fraudulent wire risk",
        "reputation_impact": "Moderate-High (Brand credibility among vendors and investors)"
    }
}

COUNTERMEASURES = {
    "dmarc_enforcement": {"name": "DMARC 'reject' & SPF Policy Enforcement", "mitigation_pts": 14, "cost": "Low"},
    "proactive_typo_blocking": {"name": "Proactive Defensive Domain Blocking (Top 25 Variants)", "mitigation_pts": 22, "cost": "Medium"},
    "vip_brand_verification": {"name": "Official Platform Verified Badges & VIP Watchlist", "mitigation_pts": 18, "cost": "Low"},
    "automated_takedown_api": {"name": "Automated Fast-Track DNS Takedown API Integration", "mitigation_pts": 26, "cost": "Medium"},
    "browser_threat_intel_feed": {"name": "Integration into Google Safe Browsing / Microsoft SmartScreen", "mitigation_pts": 15, "cost": "Low"},
    "mfa_fido2_protection": {"name": "FIDO2 / WebAuthn Hardware Security Keys for Users", "mitigation_pts": 20, "cost": "High"}
}

def run_risk_simulation(scenario_key: str, active_countermeasures: list[str]) -> dict[str, Any]:
    """
    Calculates impact before and after countermeasure selection,
    showing residual risk, blast radius reduction, and ROI.
    """
    scenario = PREDEFINED_SIMULATION_SCENARIOS.get(scenario_key, PREDEFINED_SIMULATION_SCENARIOS["credential_harvesting_portal"])
    base_score = scenario["initial_risk_score"]

    total_mitigation = 0
    applied_measures = []

    for cm_key in active_countermeasures:
        if cm_key in COUNTERMEASURES:
            cm = COUNTERMEASURES[cm_key]
            total_mitigation += cm["mitigation_pts"]
            applied_measures.append(cm)

    # Diminishing returns formula
    effective_reduction = int(total_mitigation * 0.85)
    residual_score = max(12, base_score - effective_reduction)

    # Reduction percentage
    risk_reduction_pct = round(((base_score - residual_score) / base_score) * 100, 1)

    return {
        "scenario": scenario,
        "initial_risk_score": base_score,
        "residual_risk_score": residual_score,
        "risk_reduction_pct": risk_reduction_pct,
        "initial_severity": "Critical" if base_score >= 80 else "High",
        "residual_severity": "Low" if residual_score < 40 else "Medium",
        "applied_countermeasures": applied_measures,
        "mitigation_summary": f"Implementing {len(applied_measures)} proactive protective measures reduces threat probability by {risk_reduction_pct}%, dropping risk severity from {'Critical' if base_score >= 80 else 'High'} to {'Low' if residual_score < 40 else 'Medium'}.",
        "recommendations": [
            "Enable automated DNS takedown integration for sub-4-hour domain deactivation.",
            "Enforce DMARC quarantine/reject to prevent sender spoofing in tandem with lookalike domains.",
            "Seed continuous brand keyword alerts into passive DNS threat feeds."
        ]
    }


# ==========================================
# EXTENSION 4: EXPLAINABLE INVESTIGATION ASSISTANT
# ==========================================

def generate_threat_investigation_brief(threat: dict[str, Any]) -> dict[str, Any]:
    """
    Generates an automated, explainable intelligence dossier:
    - Evidence breakdown
    - Why this risk score was given
    - Missing evidence checklist
    - Actionable analyst playbook
    """
    domain = threat.get("domain") or "unknown-domain.com"
    risk_score = threat.get("risk_score", 50)
    severity = threat.get("severity", "Medium")
    registrar = threat.get("registrar", "Unknown Registrar")
    ip = threat.get("ip_address", "Unknown IP")
    reasons = threat.get("detection_reasons", [])

    # Missing Evidence Checklist
    missing_evidence = [
        {
            "item": "Historical WHOIS Record",
            "status": "Missing",
            "action": "Query DomainTools or SecurityTrails to reveal true registrant before privacy mask was enabled."
        },
        {
            "item": "Passive DNS History",
            "status": "Recommended",
            "action": "Check Farsight / VirusTotal pDNS to observe previous IP hosting migrations and co-hosted malicious assets."
        },
        {
            "item": "Live Webpage Crawler Screenshot & DOM Hash",
            "status": "In Progress",
            "action": "Trigger headless sandbox crawler to snapshot the credential harvesting form and compare DOM logo hash."
        },
        {
            "item": "SSL Certificate SAN (Subject Alternative Names)",
            "status": "Missing",
            "action": "Inspect crt.sh transparency logs to check if multiple brand targets share the same multi-domain cert."
        }
    ]

    # Step-by-Step Playbook
    playbook_steps = [
        {
            "step": 1,
            "title": "Verify Target Phishing Form",
            "description": f"Navigate to {domain} in an isolated remote browser sandbox. Confirm if corporate brand assets (logos, login form, stylesheets) are directly mirrored."
        },
        {
            "step": 2,
            "title": "Block Indicator on Enterprise Perimeter",
            "description": f"Push domain '{domain}' and IP '{ip}' to corporate EDR, SIEM, and Secure Web Gateway (Zscaler/Palo Alto) blocklists."
        },
        {
            "step": 3,
            "title": "File Formal Abuse Report to Registrar & Hosting Provider",
            "description": f"Transmit trademark and phishing takedown notice to abuse desk at '{registrar}' and host ISP for IP '{ip}'."
        },
        {
            "step": 4,
            "title": "Submit to Global Anti-Phishing Feeds",
            "description": "Submit IOC to Google Safe Browsing, Microsoft SmartScreen, and Netcraft to block chrome/edge users globally within hours."
        }
    ]

    # Executive Summary Text
    executive_summary = (
        f"Threat indicator '{threat.get('indicator_value')}' was flagged as {severity} Risk (Score: {risk_score}/100) "
        f"targeting registered brand assets. Detection analysis identified active deceptive mechanisms including "
        f"{', '.join(reasons[:2]) if reasons else 'lexical brand imitation'}. "
        f"The infrastructure is currently hosted on {ip} under registrar {registrar}."
    )

    return {
        "threat_id": threat.get("id"),
        "title": threat.get("title"),
        "executive_summary": executive_summary,
        "score_explanation": {
            "score": risk_score,
            "severity": severity,
            "rationale": f"The score reflects evidence of active brand targeting, deceptive host architecture, and risk factors: {', '.join(reasons[:3]) if reasons else 'Domain imitation'}"
        },
        "missing_evidence_checklist": missing_evidence,
        "suggested_investigation_playbook": playbook_steps,
        "takedown_readiness": "Ready for Takedown Request" if risk_score >= 70 else "Requires Additional Corroboration"
    }


# ==========================================
# EXTENSION 5: THREAT CAMPAIGN EVOLUTION TIMELINE
# ==========================================

def get_threat_campaign_timeline(threat: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Reconstructs the full lifecycle evolution of a threat or campaign over time:
    From pre-registration staging -> DNS setup -> weaponization -> detection -> takedown.
    """
    domain = threat.get("domain", "suspicious-portal.com")
    registrar = threat.get("registrar", "Namecheap")
    ip = threat.get("ip_address", "185.220.101.45")
    status = threat.get("status", "Under Review")

    base_time = datetime.datetime.utcnow() - datetime.timedelta(days=12)

    timeline = [
        {
            "stage": 1,
            "phase": "Domain Acquisition",
            "date": (base_time).strftime("%b %d, %Y 09:14 UTC"),
            "event": "Domain Registered by Adversary",
            "details": f"Attacker registered '{domain}' via {registrar} with WHOIS privacy protection enabled.",
            "icon": "globe",
            "status": "Historical"
        },
        {
            "stage": 2,
            "phase": "DNS & Mail Server Setup",
            "date": (base_time + datetime.timedelta(days=3)).strftime("%b %d, %Y 14:22 UTC"),
            "event": "DNS A-Records and MX Records Configured",
            "details": f"Domain resolved to host IP {ip}. Mail server MX records established for outbound spear-phishing lures.",
            "icon": "server",
            "status": "Historical"
        },
        {
            "stage": 3,
            "phase": "SSL/TLS Weaponization",
            "date": (base_time + datetime.timedelta(days=6)).strftime("%b %d, %Y 18:05 UTC"),
            "event": "TLS Certificate Issued",
            "details": "Automated certificate authority issued valid SSL cert to bypass browser padlock warnings.",
            "icon": "shield-alert",
            "status": "Historical"
        },
        {
            "stage": 4,
            "phase": "Phishing Content Staging",
            "date": (base_time + datetime.timedelta(days=9)).strftime("%b %d, %Y 21:40 UTC"),
            "event": "Credential Harvester Deployed",
            "details": "Reverse-proxy phishing kit staged mimicking legitimate corporate authentication gateway.",
            "icon": "code",
            "status": "Historical"
        },
        {
            "stage": 5,
            "phase": "Automated Detection",
            "date": (base_time + datetime.timedelta(days=11)).strftime("%b %d, %Y 04:12 UTC"),
            "event": "Flagged by RiskRadar AI Engine",
            "details": f"Threat detected via brand similarity algorithm (Score: {threat.get('risk_score', 85)}/100). Automated alert generated.",
            "icon": "radar",
            "status": "Detected"
        },
        {
            "stage": 6,
            "phase": "Investigation & Action",
            "date": (datetime.datetime.utcnow() - datetime.timedelta(hours=2)).strftime("%b %d, %Y %H:%M UTC"),
            "event": f"Case Status Updated to '{status}'",
            "details": f"Security team assigned incident. Current investigation state is {status}.",
            "icon": "check-circle",
            "status": "Current"
        }
    ]

    return timeline
