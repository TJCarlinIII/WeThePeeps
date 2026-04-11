CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wtp_id TEXT UNIQUE NOT NULL, -- 'WTP-EV-1001'
    title TEXT NOT NULL,
    description TEXT,
    avif_url TEXT NOT NULL,
    source_date DATE,
    security_level TEXT DEFAULT 'public',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rebuttals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evidence_id INTEGER NOT NULL,
    claim_rebutted TEXT NOT NULL,
    rebuttal_summary TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT 0,
    FOREIGN KEY (evidence_id) REFERENCES evidence(id)
);