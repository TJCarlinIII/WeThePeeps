CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER,
    title TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT UNIQUE NOT NULL,
    content_json TEXT NOT NULL, -- BlockNote Data
    status TEXT DEFAULT 'draft',
    featured_image_url TEXT,
    meta_description TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taxonomy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'category' -- 'category' or 'tag'
);

CREATE TABLE IF NOT EXISTS post_taxonomy (
    post_id INTEGER NOT NULL,
    taxonomy_id INTEGER NOT NULL,
    PRIMARY KEY (post_id, taxonomy_id)
);