-- Initial schema for the Inkwell AI-Weaver application
-- Migration 0001

-- Projects table with enhanced fields
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    structure TEXT NOT NULL DEFAULT 'novel',
    word_count_target INTEGER,
    created_at TEXT NOT NULL,
    last_modified TEXT NOT NULL
);

-- Documents table with all fields from DocumentNode
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    parent_id TEXT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    synopsis TEXT,
    status TEXT NOT NULL DEFAULT 'not-started',
    word_count INTEGER NOT NULL DEFAULT 0,
    target_word_count INTEGER,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_modified TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES documents (id) ON DELETE SET NULL
);

-- Document labels junction table (for many-to-many relationship)
CREATE TABLE IF NOT EXISTS document_labels (
    document_id TEXT NOT NULL,
    label TEXT NOT NULL,
    PRIMARY KEY (document_id, label),
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Document metadata table
CREATE TABLE IF NOT EXISTS document_metadata (
    document_id TEXT PRIMARY KEY NOT NULL,
    pov TEXT,
    setting TEXT,
    event_date TEXT,
    importance TEXT,
    content_format TEXT DEFAULT 'rich_text',
    visibility TEXT DEFAULT 'private',
    ai_assisted INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    custom_fields TEXT, -- JSON string for custom fields
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Document metadata characters junction table
CREATE TABLE IF NOT EXISTS document_characters (
    document_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    PRIMARY KEY (document_id, character_name),
    FOREIGN KEY (document_id) REFERENCES document_metadata (document_id) ON DELETE CASCADE
);

-- Document metadata keywords junction table
CREATE TABLE IF NOT EXISTS document_keywords (
    document_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    PRIMARY KEY (document_id, keyword),
    FOREIGN KEY (document_id) REFERENCES document_metadata (document_id) ON DELETE CASCADE
);

-- Analytics table for project analytics
CREATE TABLE IF NOT EXISTS project_analytics (
    project_id TEXT PRIMARY KEY NOT NULL,
    data TEXT NOT NULL, -- JSON string with analytics data
    last_updated TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Writing sessions table
CREATE TABLE IF NOT EXISTS writing_sessions (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    words_per_minute REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Writing session documents junction table
CREATE TABLE IF NOT EXISTS session_documents (
    session_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    PRIMARY KEY (session_id, document_id),
    FOREIGN KEY (session_id) REFERENCES writing_sessions (id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Daily word counts table
CREATE TABLE IF NOT EXISTS daily_word_counts (
    project_id TEXT NOT NULL,
    date TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, date),
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Writing time table
CREATE TABLE IF NOT EXISTS writing_time (
    project_id TEXT NOT NULL,
    date TEXT NOT NULL,
    seconds INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, date),
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

-- Project templates table
CREATE TABLE IF NOT EXISTS project_templates (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    structure TEXT NOT NULL DEFAULT 'novel',
    author_name TEXT,
    author_email TEXT,
    preview_image TEXT,
    category TEXT,
    difficulty TEXT,
    estimated_time TEXT,
    created_at TEXT NOT NULL,
    last_modified TEXT NOT NULL
);

-- Template tags junction table
CREATE TABLE IF NOT EXISTS template_tags (
    template_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (template_id, tag),
    FOREIGN KEY (template_id) REFERENCES project_templates (id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general'
);

-- AI Providers table
CREATE TABLE IF NOT EXISTS ai_providers (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    api_key TEXT,
    endpoint TEXT,
    model TEXT,
    is_active INTEGER NOT NULL DEFAULT 0,
    is_local INTEGER NOT NULL DEFAULT 0,
    configuration TEXT, -- JSON string for provider configuration
    created_at TEXT NOT NULL,
    last_modified TEXT NOT NULL
);

-- Document revision history
CREATE TABLE IF NOT EXISTS document_revisions (
    id TEXT PRIMARY KEY NOT NULL,
    document_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    change_description TEXT,
    word_count_delta INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- AI contributions to documents
CREATE TABLE IF NOT EXISTS ai_contributions (
    id TEXT PRIMARY KEY NOT NULL,
    document_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    content TEXT NOT NULL,
    accepted INTEGER NOT NULL DEFAULT 0,
    model_id TEXT,
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_parent_id ON documents(parent_id);
CREATE INDEX idx_document_labels_document_id ON document_labels(document_id);
CREATE INDEX idx_writing_sessions_project_id ON writing_sessions(project_id);
CREATE INDEX idx_daily_word_counts_project_id ON daily_word_counts(project_id);
CREATE INDEX idx_document_revisions_document_id ON document_revisions(document_id);
CREATE INDEX idx_ai_contributions_document_id ON ai_contributions(document_id);
