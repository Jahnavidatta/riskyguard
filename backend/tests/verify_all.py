import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def request(path, method="GET", payload=None, token=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(content)
            except Exception:
                return resp.status, content
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, err_body

def test_full_system():
    print("===================================================================")
    print("      RISKRADAR PLATFORM COMPREHENSIVE AUTOMATED VERIFICATION      ")
    print("===================================================================")

    # 1. Health check
    print("\n[1] Health Check & Status Verification...")
    status, res = request("/health")
    assert status == 200 and res["status"] == "healthy"
    print("  -> Health OK:", res)

    # 2. Authentication: Unauthenticated Access Control Check
    print("\n[2] Testing Route Protection (Access Control)...")
    status, res = request("/api/threats/")
    assert status == 401, f"Expected 401 Unauthorized, got {status}"
    print("  -> PASS: Protected route rejected unauthenticated request with HTTP 401.")

    # 3. Authentication: Invalid Login Rejection
    print("\n[3] Testing Backend Credential Validation...")
    status, res = request("/api/auth/login", method="POST", payload={
        "email": "analyst@riskradar.io",
        "password": "WrongPassword123"
    })
    assert status == 401, f"Expected 401 for wrong password, got {status}"
    print("  -> PASS: Invalid credentials correctly rejected with HTTP 401.")

    # 4. Authentication: Successful Login & JWT Token Retrieval
    print("\n[4] Authenticating Demonstration Analyst Account...")
    status, login_res = request("/api/auth/login", method="POST", payload={
        "email": "analyst@riskradar.io",
        "password": "Analyst@2026"
    })
    assert status == 200 and "access_token" in login_res
    token = login_res["access_token"]
    user = login_res["user"]
    print(f"  -> PASS: Authenticated as '{user['full_name']}' ({user['email']}), Org: '{user['organization']}'")
    print(f"  -> JWT Token Issued (first 20 chars): {token[:20]}...")

    # 5. Profile Verification (/me)
    print("\n[5] Fetching User Profile (/me)...")
    status, me = request("/api/auth/me", token=token)
    assert status == 200 and me["email"] == "analyst@riskradar.io"
    print(f"  -> PASS: Profile matches: {me['full_name']} | Role: {me['role']}")

    # 6. Monitored Brands for Organization
    print("\n[6] Testing Monitored Brand Assets...")
    status, brands = request("/api/brands/", token=token)
    assert status == 200 and len(brands) >= 1
    print(f"  -> PASS: Retrieved {len(brands)} registered brands for {user['organization']}:")
    for b in brands:
        print(f"     - {b['name']} ({b['official_domain']}): {b.get('threat_count', 0)} threats")

    # 7. Threat Telemetry Inventory & Filtering
    print("\n[7] Testing Threat Inventory & Data Source Demarcation...")
    status, threats = request("/api/threats/", token=token)
    assert status == 200 and len(threats) >= 1
    sample_threat = threats[0]
    print(f"  -> PASS: {len(threats)} total threats retrieved.")
    print(f"     First indicator: #{sample_threat['id']} [{sample_threat['severity']}] {sample_threat['domain']}")
    print(f"     Data Type Tag: {'[SAMPLE DATA]' if sample_threat['is_sample'] else '[LIVE TELEMETRY]'}")

    # 8. Threat Detection & Lexical/SSRF Scanning
    print("\n[8] Testing Live Threat Analysis Engine & SSRF Protection...")
    
    # 8a: Verify SSRF rejection on private host
    ssrf_status, ssrf_res = request("/api/threats/scan", method="POST", payload={
        "indicator_value": "http://127.0.0.1:8000/internal-secrets",
        "threat_type": "Phishing Website"
    }, token=token)
    assert ssrf_status == 400, f"Expected 400 for loopback SSRF, got {ssrf_status}"
    print(f"  -> PASS: SSRF Attempt Blocked: {ssrf_res.get('detail')}")

    # 8b: Valid live submission
    scan_status, scan_res = request("/api/threats/scan", method="POST", payload={
        "indicator_value": "https://apex-banking-token-verify.xyz/login.php",
        "threat_type": "Phishing Website",
        "title": "Automated Verification Test Indicator",
        "notes": "Triage check for Shannon entropy and combosquatting."
    }, token=token)
    assert scan_status == 200 and scan_res["risk_score"] > 0
    assert scan_res["is_sample"] is False
    print(f"  -> PASS: Indicator Scored: {scan_res['risk_score']}/100 ({scan_res['severity']}) Confidence: {int(scan_res['confidence']*100)}%")
    print(f"     Evidence Factors: {scan_res['detection_reasons'][:2]}")

    # 9. Unique Feature 1: NetworkX Hidden Threat Connection Finder
    print("\n[9] Testing NetworkX Threat Relationship Topology...")
    status, graph = request("/api/graph/threat-connections", token=token)
    assert status == 200
    print(f"  -> PASS: NetworkX Topology Built: {graph['summary']['total_nodes']} nodes, {graph['summary']['total_links']} edges.")
    print(f"     Identified Coordinated Campaigns: {len(graph['campaigns'])}")
    for camp in graph['campaigns']:
        print(f"     * {camp['campaign_id']}: {camp['threat_count']} threats, Avg Risk {camp['average_risk']} ({camp['evidence_rationale']})")

    # 10. Unique Feature 2: Early Warning Radar System
    print("\n[10] Testing Early Warning Radar & Status Transitions...")
    status, warnings = request("/api/extensions/early-warnings", token=token)
    assert status == 200 and len(warnings["signals"]) > 0
    first_warn = warnings["signals"][0]
    print(f"  -> PASS: Retrieved {len(warnings['signals'])} early warning signals.")
    print(f"     Signal #1: [{first_warn['severity']}] {first_warn['title']} (State: {first_warn['status']})")

    # Test acknowledging early warning
    ack_status, ack_res = request(f"/api/extensions/early-warnings/{first_warn['id']}", method="PATCH", payload={
        "status": "Acknowledged"
    }, token=token)
    assert ack_status == 200 and ack_res["new_status"] == "Acknowledged"
    print(f"  -> PASS: Acknowledged Early Warning #{first_warn['id']}")

    # 11. Unique Feature 3: Digital Risk What-If Simulator
    print("\n[11] Testing Digital Risk What-If Simulation Model...")
    sim_status, sim_res = request("/api/extensions/simulation/run", method="POST", payload={
        "scenario_key": "credential_harvesting_portal",
        "active_countermeasures": ["dmarc_enforcement", "automated_takedown_api", "proactive_typo_blocking"]
    }, token=token)
    assert sim_status == 200
    print(f"  -> PASS: Simulator Model Executed:")
    print(f"     Baseline Risk: {sim_res['initial_risk_score']} ({sim_res['initial_severity']})")
    print(f"     Residual Risk: {sim_res['residual_risk_score']} ({sim_res['residual_severity']})")
    print(f"     Net Risk Reduction: -{sim_res['risk_reduction_pct']}%")

    # 12. Case Notes & Investigation Lifecycle
    print("\n[12] Testing Case Management Audit History...")
    note_status, note_res = request(f"/api/threats/{sample_threat['id']}/notes", method="POST", payload={
        "action": "Triage Corroboration",
        "notes": "Verified WHOIS privacy mask and DNS passive records."
    }, token=token)
    assert note_status == 200 and note_res["threat_id"] == sample_threat["id"]
    print(f"  -> PASS: Appended Case Note to Threat #{sample_threat['id']}")

    # 13. Downloadable Security Reports (HTML & CSV)
    print("\n[13] Testing Report Generation (Executive Dossier & CSV)...")
    status, html_data = request(f"/api/reports/export/{sample_threat['id']}", token=token)
    assert status == 200 and "RiskRadar Security Dossier" in str(html_data)
    print("  -> PASS: Printable HTML Dossier successfully rendered.")

    status, csv_data = request("/api/reports/export-all/csv", token=token)
    assert status == 200 and "Threat ID,Target Brand" in str(csv_data)
    print("  -> PASS: CSV Threat Inventory streamed successfully.")

    # 14. Multi-Tenant Tenancy Isolation Test
    print("\n[14] Testing Multi-Tenant Organizational Isolation...")
    # Register an isolated user in a separate organization
    status, reg_res = request("/api/auth/register", method="POST", payload={
        "email": "test_tenant@acmecorp.com",
        "password": "SecurePassword@2026",
        "full_name": "Acme Security Lead",
        "organization": "Acme Global Industries"
    })
    assert status == 200 and "access_token" in reg_res
    tenant_token = reg_res["access_token"]
    
    # Acme user checks brands: should only see Acme's brand, NOT Apex's brands!
    status, tenant_brands = request("/api/brands/", token=tenant_token)
    assert status == 200
    brand_names = [b["name"] for b in tenant_brands]
    assert "Apex Global Bank" not in brand_names, "Tenant isolation violation! Saw Apex brands."
    print("  -> PASS: Multi-tenancy isolation confirmed: Acme user cannot see Apex Financial brands.")

    print("\n===================================================================")
    print("  ALL TESTS PASSED: AUTHENTICATION, THREAT ANALYSIS, ACCESS CONTROL")
    print("  NETWORKX TOPOLOGY, EARLY WARNINGS, AND WHAT-IF SIMULATOR VERIFIED")
    print("===================================================================")

if __name__ == "__main__":
    test_full_system()
