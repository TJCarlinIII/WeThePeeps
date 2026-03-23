DROP TABLE IF EXISTS evidence_items;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS organizations;

CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    org_type TEXT,
    jurisdiction TEXT
);

CREATE TABLE subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    role TEXT,
    organization_id INTEGER,
    bio TEXT,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

INSERT INTO organizations (id, name, org_type, jurisdiction) VALUES 
(1, 'Redford Township Administration', 'Government', 'Redford Township'),
(2, 'Redford Township Police Department', 'Law Enforcement', 'Redford Township');

INSERT INTO subjects (name, slug, role, organization_id) VALUES 
('Jennifer Mansfield', 'jennifer-mansfield', 'Police Chief', 2),
('Pat McRae', 'pat-mcrae', 'Township Supervisor', 1),
('Karla M. Sanders', 'karla-sanders', 'FOIA Coordinator', 1);
