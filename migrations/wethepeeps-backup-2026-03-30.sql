PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sector_id INTEGER REFERENCES sectors(id),
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, address TEXT, city TEXT, state TEXT DEFAULT 'MI', zip_code TEXT, phone TEXT, website_url TEXT, entity_type TEXT, parent_entity_id INTEGER, parent_id INTEGER, is_foia_target BOOLEAN DEFAULT FALSE, is_medical_target BOOLEAN DEFAULT FALSE, history_of_falsification BOOLEAN DEFAULT FALSE, history_of_withholding BOOLEAN DEFAULT FALSE, statutory_delayer BOOLEAN DEFAULT FALSE);
CREATE TABLE statutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK(category IN ('constitutional', 'federal', 'state', 'regulation')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, slug TEXT, jurisdiction TEXT DEFAULT 'State', jurisdiction_body TEXT);
CREATE TABLE actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    entity_id INTEGER REFERENCES entities(id),
    job_title TEXT,
    status TEXT DEFAULT 'active',
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    entity_id INTEGER REFERENCES entities(id),
    actor_id INTEGER REFERENCES actors(id),
    statute_id INTEGER REFERENCES statutes(id),
    event_date DATE,
    description TEXT,
    status TEXT DEFAULT 'pending',
    is_critical INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    alt_text TEXT,
    incident_id INTEGER REFERENCES incidents(id),
    is_redacted TEXT DEFAULT 'No',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT, 
    content TEXT NOT NULL, 
    category TEXT DEFAULT 'Personal Story', 
    published_at DATETIME,
    is_featured INTEGER DEFAULT 0, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE post_entities (
    post_id INTEGER REFERENCES posts(id),
    entity_id INTEGER REFERENCES entities(id),
    PRIMARY KEY (post_id, entity_id)
);
CREATE TABLE evidence (id INTEGER PRIMARY KEY, title TEXT, description TEXT);
CREATE TABLE evidence_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    display_name TEXT,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id) ON DELETE CASCADE
);
CREATE TABLE evidence_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    relation_type TEXT DEFAULT 'REFUTES',
    notes TEXT,
    FOREIGN KEY (source_id) REFERENCES evidence(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES evidence(id) ON DELETE CASCADE
);
CREATE TABLE taxonomy_definitions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, type TEXT NOT NULL, seo_description TEXT, seo_keywords TEXT);
CREATE TABLE record_taxonomy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM sqlite_sequence;