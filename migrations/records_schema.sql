CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    incident_date DATE,
    status TEXT DEFAULT 'pending', -- Uses your shared_dbtypes values
    moral_violation TEXT,
    tactic_category TEXT
);

CREATE TABLE IF NOT EXISTS demands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL, -- 'FOIA', 'HIPAA'
    status TEXT DEFAULT 'sent',
    date_sent DATE,
    deadline_date DATE,
    tracking_number TEXT
);

-- THE JOIN TABLES
CREATE TABLE IF NOT EXISTS incident_participants (
    incident_id INTEGER NOT NULL,
    actor_id INTEGER NOT NULL,
    role_description TEXT,
    PRIMARY KEY (incident_id, actor_id)
);

CREATE TABLE IF NOT EXISTS incident_evidence (
    incident_id INTEGER NOT NULL,
    evidence_id INTEGER NOT NULL,
    is_rebuttal BOOLEAN DEFAULT 0,
    PRIMARY KEY (incident_id, evidence_id)
);