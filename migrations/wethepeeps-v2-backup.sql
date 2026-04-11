PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    event_date TEXT, -- ISO 8601 date string
    description TEXT, -- Main narrative
    status TEXT CHECK(status IN ('pending', 'completed', 'stonewalled', 'verified')) DEFAULT 'pending',
    is_critical INTEGER DEFAULT 0, -- 0 = false, 1 = true
    moral_violation_type TEXT CHECK(moral_violation_type IN (
        'not-kill', 'false-witness', 'not-steal', 'not-covet', 'honor-parents', 'denial-of-due-process'
    )),
    forensic_analysis TEXT, -- Retrospective context / "Right Mind" notes
    tactic_category TEXT CHECK(tactic_category IN (
        'coordinated-withdrawal', 'forced-proxying', 'document-falsification', 
        'gaslighting', 'information-siloing', 'proxy-takeover', 'stonewall'
    )),
    correlation_id TEXT, -- Link related incidents (e.g., 'JULY-7-8-LOCKOUT')
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    entity_id INTEGER REFERENCES entities(id), -- Primary affiliation (optional)
    job_title TEXT,
    status TEXT CHECK(status IN ('active', 'under_review', 'former', 'deceased')),
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    seo_keywords TEXT,
    cdn_image_url TEXT,
    official_website_url TEXT,
    map_icon TEXT CHECK(map_icon IN ('badge', 'justice', 'pharmacia', 'suit', 'money')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sector_id INTEGER REFERENCES sectors(id),
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    entity_type TEXT,
    address TEXT,
    city TEXT,
    state TEXT DEFAULT 'MI',
    zip_code TEXT,
    phone TEXT,
    parent_entity_id INTEGER REFERENCES entities(id),
    official_website_url TEXT,
    is_foia_target BOOLEAN DEFAULT FALSE,
    is_medical_target BOOLEAN DEFAULT FALSE,
    history_of_falsification BOOLEAN DEFAULT FALSE,
    history_of_withholding BOOLEAN DEFAULT FALSE,
    statutory_delayer BOOLEAN DEFAULT FALSE,
    geographic_cluster TEXT CHECK(geographic_cluster IN (
        'Metro Detroit', 'Lansing (State)', 'Grand Rapids (Hub)', 'Ann Arbor (Mobile)'
    )),
    latitude REAL,
    longitude REAL,
    seo_keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    seo_description TEXT,
    seo_keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE statutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation TEXT NOT NULL, -- e.g., "MCL 15.231"
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    legal_text TEXT,
    jurisdiction TEXT CHECK(jurisdiction IN ('Federal', 'State', 'Local')),
    jurisdiction_body TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    official_url TEXT,
    status TEXT DEFAULT 'active',
    effective_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'FOIA', 'Medical', 'Email', 'Video', etc.
    file_url TEXT, -- R2 key or external URL
    file_type TEXT, -- 'pdf', 'avif', 'mp4', etc.
    is_critical INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    alt_text TEXT,
    incident_id INTEGER, -- Legacy: direct link (deprecated for new incidents)
    is_redacted TEXT CHECK(is_redacted IN ('Yes', 'No')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE incident_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES actors(id) ON DELETE SET NULL,
    entity_id INTEGER REFERENCES entities(id) ON DELETE SET NULL,
    role_description TEXT, -- e.g., "Denied FOIA fee waiver", "Closed APS case"
    forensic_note TEXT, -- Specific contribution to the incident
    is_primary INTEGER DEFAULT 0, -- Flag the main actor if needed for UI
    UNIQUE(incident_id, actor_id), -- Prevent duplicate actor links
    UNIQUE(incident_id, entity_id) -- Prevent duplicate entity links
);
CREATE TABLE incident_evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    evidence_id INTEGER NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    is_rebuttal INTEGER DEFAULT 0, -- 1 = this evidence refutes a claim in the incident
    rebuttal_target_actor_id INTEGER REFERENCES actors(id), -- Who made the claim being rebutted
    rebuttal_text TEXT, -- Optional: "U of M records prove clinical diagnosis, not self-diagnosis"
    display_order INTEGER DEFAULT 0, -- For UI sequencing
    UNIQUE(incident_id, evidence_id)
);
CREATE TABLE incident_statutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    statute_id INTEGER NOT NULL REFERENCES statutes(id) ON DELETE CASCADE,
    violation_context TEXT, -- How this statute was violated in this incident
    UNIQUE(incident_id, statute_id)
);
CREATE TABLE records_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE SET NULL,
    actor_id INTEGER REFERENCES actors(id), -- Who made the request
    entity_id INTEGER REFERENCES entities(id), -- Who was asked
    request_type TEXT CHECK(request_type IN ('FOIA', 'HIPAA', 'Medical Records', 'Internal Memo')),
    request_date TEXT, -- ISO date
    compliance_deadline TEXT,
    status TEXT CHECK(status IN ('pending', 'fulfilled', 'denied', 'stonewalled', 'appealed')),
    fee_quoted REAL,
    fee_waiver_requested INTEGER DEFAULT 0,
    days_overdue INTEGER DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE rebuttals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER REFERENCES actors(id),
    incident_id INTEGER REFERENCES incidents(id),
    falsified_claim TEXT NOT NULL,
    clinical_fact TEXT NOT NULL,
    evidence_id INTEGER REFERENCES evidence(id),
    evidence_url TEXT, -- Fallback external link
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT,
    summary TEXT,
    content TEXT,
    is_featured INTEGER DEFAULT 0,
    seo_keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE taxonomy_definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('category', 'tag', 'statute')) NOT NULL,
    seo_description TEXT,
    seo_keywords TEXT
);
CREATE TABLE record_taxonomy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    parent_type TEXT CHECK(parent_type IN ('incident', 'actor', 'entity', 'statute')),
    taxonomy_type TEXT CHECK(taxonomy_type IN ('topic', 'statute', 'official')),
    taxonomy_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL, -- actors.id
    target_id INTEGER NOT NULL, -- entities.id
    connection_type TEXT CHECK(connection_type IN (
        'employment', 'board_member', 'funding', 'legal_representation', 'contracted_vendor'
    )),
    description TEXT,
    strength INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM sqlite_sequence;
CREATE INDEX idx_incidents_event_date ON incidents(event_date);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incident_participants_actor ON incident_participants(actor_id);
CREATE INDEX idx_incident_participants_entity ON incident_participants(entity_id);
CREATE INDEX idx_incident_evidence_rebuttal ON incident_evidence(is_rebuttal);
CREATE INDEX idx_records_requests_status ON records_requests(status);
CREATE INDEX idx_actors_slug ON actors(slug);
CREATE INDEX idx_entities_slug ON entities(slug);
CREATE INDEX idx_statutes_citation ON statutes(citation);
