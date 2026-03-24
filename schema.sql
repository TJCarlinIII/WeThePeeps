-- 1. Create SECTORS
CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create ENTITIES
CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sector_id INTEGER REFERENCES sectors(id),
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create STATUTES
CREATE TABLE IF NOT EXISTS statutes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    citation TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT CHECK(category IN ('constitutional', 'federal', 'state', 'regulation')),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create ACTORS
CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    entity_id INTEGER REFERENCES entities(id),
    job_title TEXT,
    status TEXT DEFAULT 'active',
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create INCIDENTS
CREATE TABLE IF NOT EXISTS incidents (
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

-- 6. Create MEDIA
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL,
    alt_text TEXT,
    incident_id INTEGER REFERENCES incidents(id),
    is_redacted TEXT DEFAULT 'No',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
