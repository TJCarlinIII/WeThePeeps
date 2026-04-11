CREATE TABLE IF NOT EXISTS sectors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    seo_description TEXT
);

CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'Federal Agency', 'Hospital', etc.
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    FOREIGN KEY (sector_id) REFERENCES sectors(id)
);

CREATE TABLE IF NOT EXISTS actors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    job_title TEXT,
    status TEXT DEFAULT 'active',
    slug TEXT UNIQUE NOT NULL,
    bio TEXT,
    FOREIGN KEY (entity_id) REFERENCES entities(id)
);