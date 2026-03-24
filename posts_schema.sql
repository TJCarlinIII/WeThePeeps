-- Create POSTS table for your story/how-to content
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT, -- For the "card" view
    content TEXT NOT NULL, -- The full story / Markdown
    category TEXT DEFAULT 'Personal Story', -- 'How-To', 'Legal Analysis', etc.
    published_at DATETIME,
    is_featured INTEGER DEFAULT 0, -- To highlight on the landing page
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Link posts to specific entities if the story is about them
CREATE TABLE IF NOT EXISTS post_entities (
    post_id INTEGER REFERENCES posts(id),
    entity_id INTEGER REFERENCES entities(id),
    PRIMARY KEY (post_id, entity_id)
);
