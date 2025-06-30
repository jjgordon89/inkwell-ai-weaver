-- Add project templates functionality
-- Migration 0002

-- Project templates tags should be stored in a junction table
CREATE TABLE IF NOT EXISTS template_tags (
    template_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY (template_id, tag),
    FOREIGN KEY (template_id) REFERENCES project_templates (id) ON DELETE CASCADE
);

-- Add template document tree table to store document structure for templates
CREATE TABLE IF NOT EXISTS template_documents (
    id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL,
    parent_id TEXT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT,
    synopsis TEXT,
    status TEXT NOT NULL DEFAULT 'not-started',
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (template_id) REFERENCES project_templates (id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES template_documents (id) ON DELETE SET NULL
);

-- Add template document metadata table
CREATE TABLE IF NOT EXISTS template_document_metadata (
    document_id TEXT PRIMARY KEY NOT NULL,
    pov TEXT,
    setting TEXT,
    event_date TEXT,
    importance TEXT,
    content_format TEXT DEFAULT 'rich_text',
    visibility TEXT DEFAULT 'private',
    ai_assisted INTEGER DEFAULT 0,
    custom_fields TEXT,
    FOREIGN KEY (document_id) REFERENCES template_documents (id) ON DELETE CASCADE
);

-- Add template document labels
CREATE TABLE IF NOT EXISTS template_document_labels (
    document_id TEXT NOT NULL,
    label TEXT NOT NULL,
    PRIMARY KEY (document_id, label),
    FOREIGN KEY (document_id) REFERENCES template_documents (id) ON DELETE CASCADE
);

-- Add template document characters
CREATE TABLE IF NOT EXISTS template_document_characters (
    document_id TEXT NOT NULL,
    character_name TEXT NOT NULL,
    PRIMARY KEY (document_id, character_name),
    FOREIGN KEY (document_id) REFERENCES template_document_metadata (document_id) ON DELETE CASCADE
);

-- Add template document keywords
CREATE TABLE IF NOT EXISTS template_document_keywords (
    document_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    PRIMARY KEY (document_id, keyword),
    FOREIGN KEY (document_id) REFERENCES template_document_metadata (document_id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_template_documents_template_id ON template_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_template_documents_parent_id ON template_documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_template_document_labels_document_id ON template_document_labels(document_id);
