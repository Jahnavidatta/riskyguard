from app.ml.feature_extractor import detect_homoglyphs

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculates edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def levenshtein_similarity(s1: str, s2: str) -> float:
    """Normalized similarity score between 0.0 and 1.0 based on Levenshtein distance."""
    s1, s2 = s1.lower(), s2.lower()
    if s1 == s2:
        return 1.0
    max_len = max(len(s1), len(s2))
    if max_len == 0:
        return 1.0
    dist = levenshtein_distance(s1, s2)
    return max(0.0, round(1.0 - (dist / max_len), 3))

def jaro_winkler_similarity(s1: str, s2: str) -> float:
    """Jaro-Winkler distance measuring brand prefix similarity."""
    s1, s2 = s1.lower(), s2.lower()
    if s1 == s2:
        return 1.0

    len1, len2 = len(s1), len(s2)
    if len1 == 0 or len2 == 0:
        return 0.0

    match_distance = max(len1, len2) // 2 - 1
    s1_matches = [False] * len1
    s2_matches = [False] * len2
    matches = 0

    for i in range(len1):
        start = max(0, i - match_distance)
        end = min(i + match_distance + 1, len2)
        for j in range(start, end):
            if s2_matches[j]:
                continue
            if s1[i] == s2[j]:
                s1_matches[i] = True
                s2_matches[j] = True
                matches += 1
                break

    if matches == 0:
        return 0.0

    # Count transpositions
    k = 0
    transpositions = 0
    for i in range(len1):
        if not s1_matches[i]:
            continue
        while not s2_matches[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    transpositions //= 2
    jaro = (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3.0

    # Common prefix adjustment (up to 4 chars)
    prefix = 0
    for i in range(min(4, min(len1, len2))):
        if s1[i] == s2[i]:
            prefix += 1
        else:
            break

    jaro_winkler = jaro + (prefix * 0.1 * (1 - jaro))
    return round(min(1.0, max(0.0, jaro_winkler)), 3)

def match_brand_impersonation(candidate_domain: str, brand_name: str, official_domain: str, target_keywords: list[str]) -> dict:
    """
    Evaluates brand impersonation tactics:
    - Homoglyph mimicry (e.g., аpex vs apex)
    - Direct typosquatting (1-2 edit distance)
    - Combosquatting (brand + keyword e.g., apex-security)
    - Subdomain spoofing (apex.fakeportal.com)
    - Keyword containment
    """
    candidate_clean = candidate_domain.lower().strip()
    official_clean = official_domain.lower().strip()
    brand_clean = brand_name.lower().strip()

    # Extract domain label (without TLD)
    official_core = official_clean.split(".")[0]
    candidate_parts = candidate_clean.split(".")
    candidate_core = candidate_parts[0] if len(candidate_parts) <= 2 else candidate_parts[-2]

    # Check homoglyph
    _, _, normalized_candidate = detect_homoglyphs(candidate_clean)
    homoglyph_hit = normalized_candidate != candidate_clean and (
        official_core in normalized_candidate or brand_clean in normalized_candidate
    )

    # Check if exact official domain (Not a threat if it's the real brand itself!)
    if candidate_clean == official_clean:
        return {
            "is_impersonation": False,
            "similarity_score": 0.0,
            "technique": "Legitimate Brand Domain",
            "reason": "Indicator matches the official verified brand domain."
        }

    # 1. Homoglyph Mimicry
    if homoglyph_hit:
        return {
            "is_impersonation": True,
            "similarity_score": 0.98,
            "technique": "Homoglyph Attack (IDN Spoofing)",
            "reason": f"Uses non-Latin lookalike characters to disguise domain as '{official_core}'."
        }

    # 2. Subdomain Spoofing: e.g. apexbank.com.login-portal.top
    if official_clean in candidate_clean or f"{brand_clean}." in candidate_clean:
        return {
            "is_impersonation": True,
            "similarity_score": 0.95,
            "technique": "Subdomain / Host Injection",
            "reason": f"Embeds legitimate brand domain '{official_clean}' as a subdomain under an attacker-controlled root."
        }

    # 3. Combosquatting: brand name coupled with phishing words (e.g. apex-verify, apexbank-login)
    for kw in target_keywords + ['login', 'verify', 'support', 'security', 'account', 'pay', 'portal']:
        if f"{brand_clean}-{kw}" in candidate_clean or f"{brand_clean}{kw}" in candidate_clean or f"{kw}-{brand_clean}" in candidate_clean:
            return {
                "is_impersonation": True,
                "similarity_score": 0.90,
                "technique": "Combosquatting",
                "reason": f"Combines brand name '{brand_clean}' with deceptive operational keyword '{kw}'."
            }

    # 4. Levenshtein and Jaro-Winkler Typosquatting
    lev_score = levenshtein_similarity(candidate_core, official_core)
    jw_score = jaro_winkler_similarity(candidate_core, official_core)
    combined_score = round((lev_score * 0.4) + (jw_score * 0.6), 3)

    if combined_score >= 0.80 and candidate_core != official_core:
        return {
            "is_impersonation": True,
            "similarity_score": combined_score,
            "technique": "Typosquatting (Lookalike Variation)",
            "reason": f"Domain core '{candidate_core}' has high typographical similarity ({int(combined_score * 100)}%) to official brand '{official_core}'."
        }

    # 5. Partial token match in candidate
    if brand_clean in candidate_core and len(candidate_core) > len(brand_clean):
        return {
            "is_impersonation": True,
            "similarity_score": 0.75,
            "technique": "Brand Token Affixation",
            "reason": f"Contains brand name '{brand_clean}' with extra suspicious prefixes or suffixes."
        }

    return {
        "is_impersonation": False,
        "similarity_score": combined_score,
        "technique": "None",
        "reason": "No strong lexical brand impersonation detected."
    }
