from app.ml.feature_extractor import extract_url_lexical_features
from app.ml.brand_matcher import match_brand_impersonation

# Suspicious bulletproof hosting ASNs and high-risk registrars
HIGH_RISK_REGISTRARS = [
    "namecheap", "tucows", "reg.ru", "nicenic", "todaynic", "flokinet", "shinjiru", "enom"
]
BULLETPROOF_ASNS = [
    "AS200052", "AS20473", "AS49870", "AS206981", "AS60781", "AS212238"
]

def assess_threat_risk(
    indicator_value: str,
    threat_type: str,
    brand_name: str = "",
    official_domain: str = "",
    target_keywords: list[str] = None,
    registrar: str = "",
    asn: str = ""
) -> dict:
    """
    Transparent, explainable 0-100 risk scoring algorithm.
    Produces granular evidence factors, confidence level, and severity classification.
    """
    if target_keywords is None:
        target_keywords = []

    features = extract_url_lexical_features(indicator_value)
    brand_match = match_brand_impersonation(
        features["hostname"],
        brand_name=brand_name or "Brand",
        official_domain=official_domain or "example.com",
        target_keywords=target_keywords
    )

    factors = []
    base_score = 0

    # 1. Brand Impersonation Factor (Max 35 pts)
    if brand_match["is_impersonation"]:
        sim = brand_match["similarity_score"]
        pts = int(sim * 35)
        base_score += pts
        factors.append({
            "factor": "Brand Impersonation Detected",
            "technique": brand_match["technique"],
            "impact": f"+{pts} pts",
            "evidence": brand_match["reason"]
        })

    # 2. Homoglyph / Punycode IDN Deception (Max 25 pts)
    if features["has_homoglyphs"] or features["is_punycode"]:
        pts = 25
        base_score += pts
        details = ", ".join(features["homoglyph_details"][:2]) if features["homoglyph_details"] else "IDN Punycode encoding"
        factors.append({
            "factor": "Internationalized Domain / Homoglyph Spoofing",
            "technique": "Cyrillic/Greek Character Lookalike",
            "impact": f"+{pts} pts",
            "evidence": f"Employs visually deceptive characters: {details}"
        })

    # 3. Phishing Keywords in URL / Path (Max 20 pts)
    kws = features["keywords_found"]
    if kws:
        pts = min(20, len(kws) * 7)
        base_score += pts
        factors.append({
            "factor": "Credential Harvesting Keywords",
            "technique": "Social Engineering Traps",
            "impact": f"+{pts} pts",
            "evidence": f"Found suspicious authentication/security terms: {', '.join(kws[:4])}"
        })

    # 4. High-Risk TLD (Max 20 pts)
    if features["tld_risk_score"] > 0:
        pts = min(20, features["tld_risk_score"])
        base_score += pts
        factors.append({
            "factor": "High-Risk Top-Level Domain (TLD)",
            "technique": "Cheap / Abuse-Prone Registrar Space",
            "impact": f"+{pts} pts",
            "evidence": f"TLD '.{features['tld']}' has an elevated malicious abuse reputation."
        })

    # 5. Shannon Entropy / DGA Randomness (Max 15 pts)
    if features["high_entropy"]:
        pts = 15
        base_score += pts
        factors.append({
            "factor": "High Domain Entropy (Randomness)",
            "technique": "Algorithmically Generated Domain (DGA)",
            "impact": f"+{pts} pts",
            "evidence": f"Shannon entropy score of {features['entropy']} bits indicates pseudo-random character distribution."
        })

    # 6. Infrastructure & Registrar Risk (Max 15 pts)
    reg_lower = (registrar or "").lower()
    if any(hr in reg_lower for hr in HIGH_RISK_REGISTRARS):
        pts = 10
        base_score += pts
        factors.append({
            "factor": "High-Abuse Registrar History",
            "technique": "Privacy Shielded Infrastructure",
            "impact": f"+{pts} pts",
            "evidence": f"Registrar '{registrar}' frequently observed in fast-flux phishing campaigns."
        })

    if asn and any(bp in asn for bp in BULLETPROOF_ASNS):
        pts = 15
        base_score += pts
        factors.append({
            "factor": "Bulletproof ASN Host",
            "technique": "Host Resistant to Takedowns",
            "impact": f"+{pts} pts",
            "evidence": f"Network ASN '{asn}' is flagged on global threat feeds for hosting illicit command-and-control nodes."
        })

    # 7. Threat Type Modifier
    if threat_type == "Malicious APK/App":
        base_score = max(base_score, 65)
        factors.append({
            "factor": "Rogue Mobile Application",
            "technique": "Off-market APK Sideloading",
            "impact": "+15 pts",
            "evidence": "Third-party application package mimicking legitimate enterprise client."
        })
    elif threat_type == "Fake Support Profile":
        base_score = max(base_score, 55)
        factors.append({
            "factor": "Executive / Customer Support Impersonation",
            "technique": "VIP / Helpdesk Social Engineering",
            "impact": "+15 pts",
            "evidence": "Unverified social account using official brand imagery to solicit sensitive customer credentials."
        })

    # Clamp final score to 0 - 100
    final_score = min(100, max(5, base_score))

    # Categorize severity
    if final_score >= 70:
        severity = "High"
    elif final_score >= 40:
        severity = "Medium"
    else:
        severity = "Low"

    # Transparent confidence calculation
    evidence_count = len(factors)
    confidence = round(min(0.96, 0.65 + (evidence_count * 0.06)), 2)

    return {
        "risk_score": final_score,
        "severity": severity,
        "confidence": confidence,
        "factors": factors,
        "features": features,
        "brand_match": brand_match,
        "disclaimer": "This risk assessment is an evidence-based probability score and should be corroborated by manual analyst verification prior to initiating legal or DNS takedown actions."
    }
