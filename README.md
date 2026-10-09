# RiskRadar: AI-Powered Digital Risk Protection Platform (DRP)

![RiskRadar Platform](https://img.shields.io/badge/Status-Operational-10b981?style=for-the-badge)
![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI%20Python-0284c7?style=for-the-badge)
![React Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TailwindCSS-06b6d4?style=for-the-badge)
![NetworkX Graph](https://img.shields.io/badge/NetworkX-Threat%20Topology-8b5cf6?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-3b82f6?style=for-the-badge)

**RiskRadar** is an enterprise-grade Digital Risk Protection (DRP) platform engineered to detect, analyze, investigate, and mitigate external cyber threats targeting corporate brands. It safeguards organizations against fake social profiles, phishing lookalike portals, credential harvesters, rogue mobile APKs, and executive impersonation attacks.

Beyond isolated threat detection, RiskRadar features **five innovative extensions** powered by **NetworkX graph algorithms**, **predictive surge detection**, **countermeasure simulation modeling**, and **explainable SOC investigation assistants**.

---

## 1. System Architecture & Tech Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js 18**, **Tailwind CSS**, **Lucide Icons** | High-density Cyber Command Center with glassmorphism, responsive navigation, and real-time telemetry filters. |
| **Data Visualization** | **Recharts** (Area, Donut, Bar Charts) | Interactive threat trend graphs, risk severity breakdowns, and targeted brand distributions. |
| **Threat Relationship Graph** | **NetworkX** + SVG Force Topology | Backend graph clustering and interactive visual canvas mapping connected threats, shared IPs, and bulletproof hosts. |
| **Backend Services** | **Python 3**, **FastAPI**, **Pydantic v2** | High-performance asynchronous REST API with OpenAPI documentation, CORS middleware, and input sanitization. |
| **Machine Learning & NLP** | **Pure Python / Scikit-Learn Ensemble** | Shannon entropy calculation, Cyrillic/Greek homoglyph detection, Levenshtein distance, Jaro-Winkler brand similarity, and combosquatting classifiers. |
| **Database** | **PostgreSQL** & **SQLite** (SQLAlchemy 2.0) | Zero-configuration portable SQLite default with production PostgreSQL connection string support via environment variables. |
| **Security & SSRF** | **PBKDF2-HMAC-SHA256**, **JWT (HS256)**, **SSRF Filter** | Private IP blocklist (RFC 1918 & loopbacks), safe URL resolution, and password hashing. |

---

## 2. Core Modules Implemented

### Module 1: User Authentication & Role-Based Access Control
* Secure registration and authentication with PBKDF2-HMAC-SHA256 password hashing.
* Signed JWT Bearer token generation.
* Role-based access control (`Admin`, `Analyst`, `Viewer`) and organizational tenancy isolation.
* Default demo accounts:
  * **Admin:** `admin@riskradar.io` / `RiskRadar@2026`
  * **Analyst:** `analyst@riskradar.io` / `Analyst@2026`

### Module 2: Brand Asset Management
* Multi-brand asset registration with official company name, primary domain, official social media handles (Twitter/X, LinkedIn, Instagram), and trademark keywords.
* Pre-seeded with realistic protected enterprise brands:
  * **Apex Global Bank** (`apexbank.com`)
  * **SafePay Technologies** (`safepay.io`)
  * **CloudScale Networks** (`cloudscale.net`)

### Module 3: Threat Telemetry & Data Collection
* Ingests suspicious URLs, lookalike domains, unverified social profiles, and third-party mobile app APK links.
* **Server-Side Request Forgery (SSRF) Protection:** Rejects any input resolving to internal private subnets (`127.0.0.1`, `10.0.0.0/8`, `192.168.0.0/16`, `169.254.0.0/16`, `localhost`, etc.).
* Pre-loaded sample dataset with explicit visual demarcation: **`[SAMPLE DATA]`** vs **`[LIVE TELEMETRY]`**.

### Module 4: Explainable Threat Detection Engine
* **Shannon Domain Entropy:** Flags pseudo-random character distributions characteristic of Domain Generation Algorithms (DGA).
* **Homoglyph & Punycode Deception:** Detects non-Latin lookalike characters (Cyrillic `а`, `о`, `е`, `р`, `с`) and Internationalized Domain Names (`xn--`).
* **Typosquatting & Combosquatting:** Combines Levenshtein edit distance and Jaro-Winkler prefix matching against monitored brands.
* **Suspicious Lexical Traps:** Flags deceptive keywords (`login`, `verify`, `kyc`, `support`, `2fa`, `wallet`, `recover`).
* **High-Risk TLD Reputation Scoring:** Assigns risk weights to high-abuse TLDs (`.xyz`, `.top`, `.tk`, `.buzz`, `.work`, `.click`).

### Module 5: Risk Assessment Algorithm
* Transparent 0 to 100 risk score calculated via documented factor weights.
* Tri-tier severity bands:
  * **Low Risk:** 0 – 39
  * **Medium Risk:** 40 – 69
  * **High Risk:** 70 – 100
* Output includes individual evidence contributions (e.g. `Brand Impersonation: +35 pts`, `Credential Harvesting Traps: +20 pts`, `High-Risk TLD: +20 pts`), confidence percentage, and non-defamatory disclaimers.

### Module 6: Monitoring, Watchlists & Alerts
* Continuous tracking of detected threat indicators.
* Priority highlights for High-Risk items (Score ≥ 70).
* Real-time SOC alert banners and automated telemetry refresh.

### Module 7: Executive Dashboard & Reporting
* KPI summary cards: Total Threats, Active High-Risk, Protected Brands, Resolved Cases, Average Severity Index.
* **Recharts Data Visualizations:**
  * Threat Ingestion & Detection Volume Trends (Area Chart)
  * Risk Severity Breakdown (Donut Chart)
  * Impersonation Threat Vectors (Bar Chart)
  * Top Targeted Brands Distribution
* **Downloadable Security Reports:**
  * One-Click Printable HTML Security Dossiers with executive summary, IOC tables, and evidence logs.
  * Complete Threat Inventory CSV Export for EDR/SIEM ingestion.

### Module 8: Investigation & Case Management
* Full incident lifecycle workflow: `New` ➔ `Under Review` ➔ `Reported (Takedown)` ➔ `Resolved`.
* Audit logging tracking every analyst note, status transition, and timestamped action.

---

## 3. Five Advanced Extensions

### Extension 1: Hidden Threat Connection Finder (NetworkX)
* **Purpose:** Uncovers concealed infrastructure relationships linking disparate phishing domains and profiles.
* **NetworkX Engine:** Constructs a topological graph connecting threats via shared IP hosts, bulletproof Autonomous Systems (ASNs), registrars, and TLS certificates.
* **Campaign Clustering:** Executes `networkx.connected_components()` and community detection to syndicate related threats into named campaigns (e.g., `CAMPAIGN-SYNDICATE-01`).
* **Interactive Visualization:** Drag, pan, zoom, and inspect nodes to review graph centrality metrics (Betweenness & Degree Centrality) and connection evidence.

### Extension 2: Early Warning Radar for Emerging Attacks
* **Purpose:** Proactively alerts security teams to emerging attack campaigns before active phishing lures are weaponized.
* **Surge Velocity Tracking:** Analyzes temporal patterns across 72-hour sliding windows to detect sudden spikes in combosquatting domain registrations.
* **Infrastructure Reuse Signals:** Flags shared bulletproof hosting clusters and omnichannel cross-platform social media spoofing.
* **Confidence & Disclaimers:** Accompanied by confidence scores and methodology limitations.

### Extension 3: Digital Risk What-If Simulator
* **Purpose:** Proactive planning sandbox modeling the blast radius of hypothetical digital threats.
* **Scenarios:** Lookalike banking login portals, rogue customer-care handles on X/Telegram, trojanized mobile APKs, and executive VIP spoofing.
* **Impact Calculations:** Estimates customer blast radius, financial fraud exposure ($), and brand reputation impact.
* **Countermeasure Toggles:** Toggle defensive controls (DMARC reject policy, proactive typo domain blocking, verified badges, automated DNS takedown APIs) to view real-time **Before vs. After Comparative Risk Dials**.

### Extension 4: Explainable Threat Investigation Assistant
* **Purpose:** Streamlines manual tier-1/tier-2 SOC analyst workflows with structured AI guidance.
* **Features:**
  * Executive Threat Narrative.
  * Factor-by-factor risk score justification.
  * **Missing Evidence Checklist:** Flags corroboration gaps (e.g., historical WHOIS privacy masks, passive DNS transitions, live crawler DOM hashes).
  * **Actionable 4-Step Playbook:** Guidance from perimeter firewall blocking to registrar abuse submissions.

### Extension 5: Threat Campaign Evolution Timeline
* **Purpose:** Visualizes how an attack campaign unfolded over time.
* **Reconstructed Phases:**
  1. Domain Acquisition (Day -12)
  2. DNS & Mail Server (MX) Configuration (Day -9)
  3. TLS/SSL Weaponization (Day -6)
  4. Phishing Credential Harvester Staged (Day -3)
  5. Detection by RiskRadar AI Telemetry (Day -1)
  6. SOC Action & Case Assignment (Current)

---

## 4. Quick Start & Execution Guide (Windows & VS Code)

### Prerequisites
* **Python 3.10+** (Tested on Python 3.14)
* **Node.js v18+** & **npm**

### Quick Launch (Option 1: Using Included Windows Launchers)

Double-click `start_platform.bat` or run in PowerShell:
```powershell
.\start_platform.bat
```
This automatically launches both the FastAPI backend on `http://127.0.0.1:8000` and the Vite React frontend on `http://127.0.0.1:5173`.

---

### Manual Launch (Option 2: Terminal by Terminal)

#### Step 1: Start Backend (FastAPI)
Open a terminal in the project root:
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* The backend automatically initializes tables and loads the demonstration threat dataset.
* Access interactive API documentation at: `http://127.0.0.1:8000/docs`

#### Step 2: Start Frontend (React + Vite)
Open a second terminal:
```powershell
cd frontend
npm run dev
```
* Access the RiskRadar Web Application at: `http://127.0.0.1:5173`

---

## 5. Demonstration & Evaluation Workflow

To evaluate all features during a presentation or review:

1. **Executive Dashboard (`Tab: Executive Dashboard`):**
   * Review the 5 KPI metric cards (Total Threats, Active High Risk, Campaign Clusters, Protected Brands, Avg Severity).
   * Inspect the Recharts **Threat Ingestion Trends** Area Chart, **Severity Distribution** Donut Chart, and **Threat Vectors** Bar Chart.
2. **Threats & Case Management (`Tab: Threats & Investigations`):**
   * Filter threats by Severity (`High`, `Medium`, `Low`), Case Status, or Data Source (`[SAMPLE DATA]` vs `[LIVE TELEMETRY]`).
   * Click **AI Assistant** on any threat to view the Explainable Evidence Brief and SOC playbook.
   * Click **Timeline** to view the chronological lifecycle evolution.
   * Update a threat case status (e.g. from `New` to `Reported`) to record an audit trail.
   * Click **Report** to open the printable formal Security Dossier in HTML format.
   * Click **Export CSV** to download the complete threat inventory.
3. **Hidden Threat Connection Finder (`Tab: Hidden Connection Finder`):**
   * Pan, zoom, and inspect the NetworkX interactive topology graph.
   * Click on an IP node (e.g. `185.220.101.45`) to see how 4 distinct lookalike domains are connected to the same bulletproof infrastructure.
   * Review the **Identified Campaign Clusters** sidebar to see auto-grouped syndicates.
4. **Early Warning Radar (`Tab: Early Warning Radar`):**
   * Review detected surge signals within the 72-hour sliding window.
   * Inspect the cluster density, algorithm confidence metrics, and methodological limitations.
5. **Digital Risk What-If Simulator (`Tab: What-If Risk Simulator`):**
   * Choose a threat scenario (e.g., *Punycode Lookalike Banking Login Portal*).
   * Toggle defensive countermeasures (DMARC, Automated Takedown API, Proactive Typo Domain Blocking).
   * Observe the real-time **Before vs. After Comparative Risk Dials**, blast radius reduction, and financial exposure ROI.
6. **Live Threat Scanner (`Navbar Button: Scan Indicator`):**
   * Submit a new suspicious indicator: `https://apex-banking-token-verify.xyz/login.php`
   * Observe the instant SSRF-validated detection analysis, risk score breakdown, and automatic addition to live telemetry!

---

## 6. Running Integration Tests

To run the complete automated test suite verifying all 8 core modules and all 5 extensions:

```powershell
cd backend
python tests/verify_all.py
```

Expected output:
```
=======================================================
ALL CORE MODULES AND 5 EXTENSIONS VERIFIED SUCCESSFULLY!
=======================================================
```

---

## 7. Database Migration (PostgreSQL Configuration)

RiskRadar uses SQLAlchemy 2.0 with portable SQLite by default. To connect to an enterprise **PostgreSQL** instance:

1. Set the `DATABASE_URL` environment variable:
   ```powershell
   $env:DATABASE_URL="postgresql+psycopg2://postgres:your_password@localhost:5432/riskradar"
   ```
2. Run the application:
   ```powershell
   python -m uvicorn app.main:app --port 8000
   ```
All tables, schemas, relations, and sample threat seed data will automatically be created in your PostgreSQL database.
