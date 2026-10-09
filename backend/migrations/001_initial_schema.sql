-- =========================================================================
-- RiskRadar: Digital Risk Protection Platform
-- Production PostgreSQL DDL Schema Migration (001_initial_schema.sql)
-- =========================================================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations (slug);

-- 2. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Analyst',
    organization VARCHAR(255) NOT NULL DEFAULT 'Apex Financial Group',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users (organization);

-- 3. Monitored Brands
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    organization VARCHAR(255) NOT NULL DEFAULT 'Apex Financial Group',
    name VARCHAR(255) NOT NULL,
    official_domain VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    official_handles TEXT DEFAULT '{}',
    target_keywords TEXT DEFAULT '[]',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_brands_org ON brands (organization);
CREATE INDEX IF NOT EXISTS idx_brands_domain ON brands (official_domain);

-- 4. Threat Indicators & Risk Assessments
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    org_id VARCHAR(255) NOT NULL DEFAULT 'Apex Financial Group',
    threat_type VARCHAR(100) NOT NULL,
    indicator_value VARCHAR(1000) NOT NULL,
    domain VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    registrar VARCHAR(255) DEFAULT 'Unknown Registrar',
    ip_address VARCHAR(100) DEFAULT 'Unknown IP',
    asn VARCHAR(100) DEFAULT 'Unknown ASN',
    ssl_issuer VARCHAR(255) DEFAULT 'Unknown SSL',
    risk_score INTEGER DEFAULT 0,
    severity VARCHAR(50) DEFAULT 'Low',
    confidence DOUBLE PRECISION DEFAULT 0.85,
    status VARCHAR(50) DEFAULT 'New',
    detection_reasons TEXT DEFAULT '[]',
    evidence_data TEXT DEFAULT '{}',
    campaign_cluster VARCHAR(100),
    is_sample BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_threats_org_id ON threats (org_id);
CREATE INDEX IF NOT EXISTS idx_threats_brand_id ON threats (brand_id);
CREATE INDEX IF NOT EXISTS idx_threats_domain ON threats (domain);
CREATE INDEX IF NOT EXISTS idx_threats_status ON threats (status);
CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats (severity);
CREATE INDEX IF NOT EXISTS idx_threats_created_at ON threats (created_at DESC);

-- 5. Threat Relationships (NetworkX Infrastructure Pivots)
CREATE TABLE IF NOT EXISTS threat_relationships (
    id SERIAL PRIMARY KEY,
    source_threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    target_threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    evidence TEXT NOT NULL,
    confidence DOUBLE PRECISION DEFAULT 0.85,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_rel_source ON threat_relationships (source_threat_id);
CREATE INDEX IF NOT EXISTS idx_rel_target ON threat_relationships (target_threat_id);

-- 6. Early-Warning Records
CREATE TABLE IF NOT EXISTS early_warnings (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    org_id VARCHAR(255) NOT NULL DEFAULT 'Apex Financial Group',
    title VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    surge_count INTEGER DEFAULT 1,
    severity VARCHAR(50) DEFAULT 'Medium',
    confidence DOUBLE PRECISION DEFAULT 0.80,
    evidence_summary TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    detected_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    acknowledged_at TIMESTAMP WITHOUT TIME ZONE,
    dismissed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_warnings_org ON early_warnings (org_id);
CREATE INDEX IF NOT EXISTS idx_warnings_status ON early_warnings (status);

-- 7. Investigations, Evidence & Case Audit History
CREATE TABLE IF NOT EXISTS case_notes (
    id SERIAL PRIMARY KEY,
    threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    user_name VARCHAR(255) DEFAULT 'Security Analyst',
    action VARCHAR(100) DEFAULT 'Note Added',
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX IF NOT EXISTS idx_case_notes_threat ON case_notes (threat_id);
