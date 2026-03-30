-- Migration number: 0001 	 2026-03-30T16:27:53.222Z
-- 1. Create the Connections Table (This is likely missing, so keep it)
CREATE TABLE IF NOT EXISTS connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL,
  target_id INTEGER NOT NULL,
  connection_type TEXT CHECK(connection_type IN ('employment', 'board_member', 'funding', 'legal_representation', 'contracted_vendor')),
  description TEXT,
  strength INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. These are already in the DB, so we comment them out to avoid the "duplicate" error
-- ALTER TABLE entities ADD COLUMN geographic_cluster TEXT...
-- ALTER TABLE actors ADD COLUMN map_icon TEXT...