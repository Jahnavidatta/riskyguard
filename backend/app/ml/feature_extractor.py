import math
import re
from urllib.parse import urlparse

# Cyrillic / Greek lookalikes that attack Latin letters
HOMOGLYPH_MAP = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
    'і': 'i', 'ј': 'j', 'ѕ': 's', 'ԁ': 'd', 'ԛ': 'q', 'ԝ': 'w', 'ӧ': 'o',
    'α': 'a', 'β': 'b', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'τ': 't', 'ω': 'w',
    '0': 'o', '1': 'l', '3': 'e', '5': 's', '8': 'b', '@': 'a', '$': 's'
}

HIGH_RISK_TLDS = {
    'xyz': 25, 'top': 30, 'tk': 35, 'ml': 35, 'ga': 35, 'cf': 35, 'gq': 35,
    'buzz': 25, 'work': 20, 'click': 25, 'rest': 20, 'icu': 25, 'sbs': 20,
    'vip': 20, 'fit': 20, 'cc': 15, 'to': 15, 'shop': 15, 'club': 15,
    'live': 15, 'site': 15, 'online': 15, 'space': 15, 'fun': 15
}

SUSPICIOUS_KEYWORDS = [
    'login', 'signin', 'sign-in', 'log-in', 'verify', 'verification', 'update',
    'account', 'banking', 'secure', 'security', 'wallet', 'kyc', 'support',
    'auth', 'authenticate', '2fa', 'mfa', 'recover', 'billing', 'invoice',
    'helpdesk', 'service-desk', 'portal', 'client', 'webmail', 'confirm'
]

def calculate_shannon_entropy(text: str) -> float:
    """Calculates the Shannon Entropy of a string to detect randomized domains / DGAs."""
    if not text:
        return 0.0
    text_len = len(text)
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    entropy = 0.0
    for count in freq.values():
        p = count / text_len
        entropy -= p * math.log2(p)
    return round(entropy, 3)

def detect_homoglyphs(text: str) -> tuple[bool, list[str], str]:
    """Detects Cyrillic, Greek, or leetspeak homoglyphs disguised as standard Latin characters."""
    detected = []
    normalized_chars = []
    has_homoglyphs = False
    
    for char in text:
        if ord(char) > 127:  # Non-ASCII character
            if char in HOMOGLYPH_MAP:
                has_homoglyphs = True
                detected.append(f"Unicode char '{char}' (U+{ord(char):04X}) mimicking '{HOMOGLYPH_MAP[char]}'")
                normalized_chars.append(HOMOGLYPH_MAP[char])
            else:
                normalized_chars.append(char)
        else:
            normalized_chars.append(char)
            
    normalized_str = "".join(normalized_chars)
    return has_homoglyphs, detected, normalized_str

def parse_url_safely(url_or_domain: str) -> dict:
    """Safely extracts scheme, hostname, path, and query components without triggering SSRF."""
    raw = url_or_domain.strip()
    if not raw.startswith("http://") and not raw.startswith("https://"):
        raw = "http://" + raw
    try:
        parsed = urlparse(raw)
        hostname = (parsed.hostname or "").lower()
        path = parsed.path or ""
        query = parsed.query or ""
        return {
            "valid": bool(hostname),
            "hostname": hostname,
            "path": path,
            "query": query,
            "raw": url_or_domain
        }
    except Exception:
        return {
            "valid": False,
            "hostname": raw.split("/")[0].lower(),
            "path": "",
            "query": "",
            "raw": url_or_domain
        }

def extract_url_lexical_features(url_str: str) -> dict:
    """Extracts comprehensive lexical and structural cyber-threat features from a URL."""
    parsed = parse_url_safely(url_str)
    hostname = parsed["hostname"]
    path = parsed["path"]
    
    # Domain and TLD separation
    parts = hostname.split(".")
    tld = parts[-1] if len(parts) > 1 else ""
    registered_domain = ".".join(parts[-2:]) if len(parts) >= 2 else hostname
    subdomain = ".".join(parts[:-2]) if len(parts) > 2 else ""

    # Homoglyphs and Punycode
    is_punycode = hostname.startswith("xn--") or ".xn--" in hostname
    has_homoglyphs, homoglyph_details, normalized_host = detect_homoglyphs(hostname)
    
    # Entropy
    entropy = calculate_shannon_entropy(hostname)
    
    # Suspicious keywords in hostname or path
    full_target = f"{hostname}/{path}".lower()
    keywords_found = [kw for kw in SUSPICIOUS_KEYWORDS if kw in full_target]
    
    # Structural features
    length = len(url_str)
    digit_count = sum(c.isdigit() for c in hostname)
    digit_ratio = round(digit_count / max(len(hostname), 1), 3)
    hyphen_count = hostname.count("-")
    subdomain_levels = max(0, len(parts) - 2)
    tld_risk_score = HIGH_RISK_TLDS.get(tld, 0)
    
    return {
        "hostname": hostname,
        "registered_domain": registered_domain,
        "subdomain": subdomain,
        "tld": tld,
        "tld_risk_score": tld_risk_score,
        "is_punycode": is_punycode,
        "has_homoglyphs": has_homoglyphs,
        "homoglyph_details": homoglyph_details,
        "normalized_host": normalized_host,
        "entropy": entropy,
        "high_entropy": entropy > 3.75,
        "keywords_found": keywords_found,
        "digit_ratio": digit_ratio,
        "hyphen_count": hyphen_count,
        "subdomain_levels": subdomain_levels,
        "url_length": length
    }
