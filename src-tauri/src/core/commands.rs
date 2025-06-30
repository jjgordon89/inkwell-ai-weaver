use serde::{Serialize, Deserialize};
use tauri::State;
use uuid::Uuid;
use sqlx::FromRow;
use crate::core::{error::Error, state::DbPool};
use std::time::{SystemTime, UNIX_EPOCH};
use std::collections::HashMap;

// Project model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub status: String,
    pub created_at: String,
    pub last_modified: String,
}

// Struct for creating a new project
#[derive(Debug, Serialize, Deserialize)]
pub struct NewProject {
    pub name: String,
    pub description: Option<String>,
}

// Struct for updating a project
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProject {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
}

// Document model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Document {
    pub id: String,
    pub project_id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: String,
    pub status: String,
    pub word_count: i32,
    pub target_word_count: Option<i32>,
    pub position: i32,
    pub created_at: String,
    pub last_modified: String,
}

// Document with labels and metadata for frontend
#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentWithMetadata {
    pub id: String,
    pub project_id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: String,
    pub status: String,
    pub word_count: i32,
    pub target_word_count: Option<i32>,
    pub position: i32,
    pub created_at: String,
    pub last_modified: String,
    pub labels: Vec<String>,
    pub metadata: Option<DocumentMetadata>,
}

// Document metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub pov: Option<String>,
    pub setting: Option<String>,
    pub characters: Vec<String>,
    pub keywords: Vec<String>,
    pub event_date: Option<String>,
    pub importance: Option<String>,
    pub content_format: Option<String>,
    pub visibility: Option<String>,
    pub ai_assisted: bool,
    pub version: i32,
    pub custom_fields: Option<String>,
}

// Struct for creating a new document
#[derive(Debug, Serialize, Deserialize)]
pub struct NewDocument {
    pub project_id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: String,
    pub status: Option<String>,
    pub word_count: Option<i32>,
    pub target_word_count: Option<i32>,
    pub position: Option<i32>,
    pub labels: Option<Vec<String>>,
    pub metadata: Option<NewDocumentMetadata>,
}

// Struct for new document metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct NewDocumentMetadata {
    pub pov: Option<String>,
    pub setting: Option<String>,
    pub characters: Option<Vec<String>>,
    pub keywords: Option<Vec<String>>,
    pub event_date: Option<String>,
    pub importance: Option<String>,
    pub content_format: Option<String>,
    pub visibility: Option<String>,
    pub ai_assisted: Option<bool>,
    pub custom_fields: Option<String>,
}

// Struct for updating a document
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocument {
    pub id: String,
    pub project_id: Option<String>,
    pub parent_id: Option<String>,
    pub title: Option<String>,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: Option<String>,
    pub status: Option<String>,
    pub word_count: Option<i32>,
    pub target_word_count: Option<i32>,
    pub position: Option<i32>,
    pub labels: Option<Vec<String>>,
    pub metadata: Option<UpdateDocumentMetadata>,
}

// Struct for updating document metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateDocumentMetadata {
    pub pov: Option<String>,
    pub setting: Option<String>,
    pub characters: Option<Vec<String>>,
    pub keywords: Option<Vec<String>>,
    pub event_date: Option<String>,
    pub importance: Option<String>,
    pub content_format: Option<String>,
    pub visibility: Option<String>,
    pub ai_assisted: Option<bool>,
    pub version: Option<i32>,
    pub custom_fields: Option<String>,
}

// Document Tree Operation
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum DocumentTreeOperation {
    #[serde(rename = "add")]
    Add {
        document: NewDocument,
        parent_id: Option<String>,
    },
    #[serde(rename = "update")]
    Update {
        id: String,
        updates: UpdateDocument,
    },
    #[serde(rename = "delete")]
    Delete {
        id: String,
    },
    #[serde(rename = "move")]
    Move {
        id: String,
        new_parent_id: Option<String>,
        new_position: i32,
    },
}

// Writing Session model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct WritingSession {
    pub id: String,
    pub project_id: String,
    pub start_time: String,
    pub end_time: String,
    pub duration: i32,
    pub word_count: i32,
    pub words_per_minute: f32,
}

// New Writing Session
#[derive(Debug, Serialize, Deserialize)]
pub struct NewWritingSession {
    pub project_id: String,
    pub document_ids: Vec<String>,
    pub start_time: String,
    pub end_time: String,
    pub duration: i32,
    pub word_count: i32,
    pub words_per_minute: f32,
}

// Helper function to get current timestamp as ISO string
fn get_current_timestamp() -> String {
    let start = SystemTime::now();
    let since_epoch = start
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");
    let timestamp = since_epoch.as_secs();
    
    // Convert to ISO 8601 format (simplified for this example)
    // In a real implementation, use a proper time library
    format!("{}", timestamp)
}

// Get all projects
#[tauri::command]
pub async fn get_all_projects(db_pool: State<'_, DbPool>) -> Result<Vec<Project>, Error> {
    let pool = db_pool.0.lock().await;
    
    let projects = sqlx::query_as!(
        Project,
        "SELECT id, name, description, status, created_at, last_modified FROM projects ORDER BY last_modified DESC"
    )
    .fetch_all(&*pool)
    .await?;
    
    Ok(projects)
}

// Create a new project
#[tauri::command]
pub async fn create_project(project: NewProject, db_pool: State<'_, DbPool>) -> Result<Project, Error> {
    let pool = db_pool.0.lock().await;
    
    let id = Uuid::new_v4().to_string();
    let timestamp = get_current_timestamp();
    
    let new_project = Project {
        id: id.clone(),
        name: project.name,
        description: project.description,
        status: "active".to_string(),
        created_at: timestamp.clone(),
        last_modified: timestamp,
    };
    
    sqlx::query!(
        "INSERT INTO projects (id, name, description, status, created_at, last_modified) 
         VALUES (?, ?, ?, ?, ?, ?)",
        new_project.id,
        new_project.name,
        new_project.description,
        new_project.status,
        new_project.created_at,
        new_project.last_modified
    )
    .execute(&*pool)
    .await?;
    
    Ok(new_project)
}

// Update a project
#[tauri::command]
pub async fn update_project(project: UpdateProject, db_pool: State<'_, DbPool>) -> Result<Project, Error> {
    let pool = db_pool.0.lock().await;
    
    // Get the existing project
    let existing = sqlx::query_as!(
        Project,
        "SELECT id, name, description, status, created_at, last_modified FROM projects WHERE id = ?",
        project.id
    )
    .fetch_one(&*pool)
    .await?;
    
    // Update fields if provided
    let name = project.name.unwrap_or(existing.name);
    let description = project.description.or(existing.description);
    let status = project.status.unwrap_or(existing.status);
    let last_modified = get_current_timestamp();
    
    // Update in the database
    sqlx::query!(
        "UPDATE projects SET name = ?, description = ?, status = ?, last_modified = ? WHERE id = ?",
        name,
        description,
        status,
        last_modified,
        project.id
    )
    .execute(&*pool)
    .await?;
    
    // Return the updated project
    let updated_project = Project {
        id: project.id,
        name,
        description,
        status,
        created_at: existing.created_at,
        last_modified,
    };
    
    Ok(updated_project)
}

// Delete a project
#[tauri::command]
pub async fn delete_project(id: String, db_pool: State<'_, DbPool>) -> Result<(), Error> {
    let pool = db_pool.0.lock().await;
    
    sqlx::query!("DELETE FROM projects WHERE id = ?", id)
        .execute(&*pool)
        .await?;
    
    Ok(())
}

// Migrate data from localStorage (in-memory) to SQLite
#[tauri::command]
pub async fn migrate_from_localstorage(projects_json: String, db_pool: State<'_, DbPool>) -> Result<(), Error> {
    let pool = db_pool.0.lock().await;
    
    // Parse the JSON string into Vec<Project>
    let projects: Vec<Project> = serde_json::from_str(&projects_json)?;
    
    // Begin a transaction
    let mut tx = pool.begin().await?;
    
    // Insert each project
    for project in projects {
        sqlx::query!(
            "INSERT OR IGNORE INTO projects (id, name, description, status, created_at, last_modified) 
             VALUES (?, ?, ?, ?, ?, ?)",
            project.id,
            project.name,
            project.description,
            project.status,
            project.created_at,
            project.last_modified
        )
        .execute(&mut *tx)
        .await?;
    }
    
    // Commit the transaction
    tx.commit().await?;
    
    Ok(())
}

// Document CRUD operations

// Get all documents for a project
#[tauri::command]
pub async fn get_project_documents(project_id: String, db_pool: State<'_, DbPool>) -> Result<Vec<DocumentWithMetadata>, Error> {
    let pool = db_pool.0.lock().await;
    
    // Get all documents for the project
    let documents = sqlx::query_as!(
        Document,
        "SELECT id, project_id, parent_id, title, content, synopsis, type as 'r#type', status, 
         word_count, target_word_count, position, created_at, last_modified 
         FROM documents WHERE project_id = ? ORDER BY position ASC",
        project_id
    )
    .fetch_all(&*pool)
    .await?;
    
    // Get labels for all documents
    let mut document_labels: HashMap<String, Vec<String>> = HashMap::new();
    let labels = sqlx::query!(
        "SELECT document_id, label FROM document_labels WHERE document_id IN 
         (SELECT id FROM documents WHERE project_id = ?)",
        project_id
    )
    .fetch_all(&*pool)
    .await?;
    
    for label_row in labels {
        document_labels
            .entry(label_row.document_id)
            .or_insert_with(Vec::new)
            .push(label_row.label);
    }
    
    // Get metadata for all documents
    let mut document_metadata: HashMap<String, DocumentMetadata> = HashMap::new();
    let metadata_rows = sqlx::query!(
        "SELECT dm.document_id, dm.pov, dm.setting, dm.event_date, dm.importance, 
         dm.content_format, dm.visibility, dm.ai_assisted, dm.version, dm.custom_fields
         FROM document_metadata dm
         INNER JOIN documents d ON dm.document_id = d.id
         WHERE d.project_id = ?",
        project_id
    )
    .fetch_all(&*pool)
    .await?;
    
    for metadata_row in metadata_rows {
        // Get characters for this document
        let characters = sqlx::query!(
            "SELECT character_name FROM document_characters WHERE document_id = ?",
            metadata_row.document_id
        )
        .fetch_all(&*pool)
        .await?
        .into_iter()
        .map(|row| row.character_name)
        .collect();
        
        // Get keywords for this document
        let keywords = sqlx::query!(
            "SELECT keyword FROM document_keywords WHERE document_id = ?",
            metadata_row.document_id
        )
        .fetch_all(&*pool)
        .await?
        .into_iter()
        .map(|row| row.keyword)
        .collect();
        
        document_metadata.insert(
            metadata_row.document_id.clone(),
            DocumentMetadata {
                pov: metadata_row.pov,
                setting: metadata_row.setting,
                characters,
                keywords,
                event_date: metadata_row.event_date,
                importance: metadata_row.importance,
                content_format: metadata_row.content_format,
                visibility: metadata_row.visibility,
                ai_assisted: metadata_row.ai_assisted != 0,
                version: metadata_row.version,
                custom_fields: metadata_row.custom_fields,
            }
        );
    }
    
    // Combine documents with their labels and metadata
    let documents_with_metadata = documents
        .into_iter()
        .map(|doc| {
            DocumentWithMetadata {
                id: doc.id.clone(),
                project_id: doc.project_id,
                parent_id: doc.parent_id,
                title: doc.title,
                content: doc.content,
                synopsis: doc.synopsis,
                r#type: doc.r#type,
                status: doc.status,
                word_count: doc.word_count,
                target_word_count: doc.target_word_count,
                position: doc.position,
                created_at: doc.created_at,
                last_modified: doc.last_modified,
                labels: document_labels.get(&doc.id).cloned().unwrap_or_default(),
                metadata: document_metadata.get(&doc.id).cloned(),
            }
        })
        .collect();
    
    Ok(documents_with_metadata)
}

// Get a single document by ID
#[tauri::command]
pub async fn get_document(id: String, db_pool: State<'_, DbPool>) -> Result<DocumentWithMetadata, Error> {
    let pool = db_pool.0.lock().await;
    
    // Get the document
    let doc = sqlx::query_as!(
        Document,
        "SELECT id, project_id, parent_id, title, content, synopsis, type as 'r#type', status, 
         word_count, target_word_count, position, created_at, last_modified 
         FROM documents WHERE id = ?",
        id
    )
    .fetch_one(&*pool)
    .await?;
    
    // Get labels for the document
    let labels = sqlx::query!(
        "SELECT label FROM document_labels WHERE document_id = ?",
        id
    )
    .fetch_all(&*pool)
    .await?
    .into_iter()
    .map(|row| row.label)
    .collect();
    
    // Get document metadata
    let metadata_row = sqlx::query!(
        "SELECT pov, setting, event_date, importance, content_format, visibility, 
         ai_assisted, version, custom_fields
         FROM document_metadata WHERE document_id = ?",
        id
    )
    .fetch_optional(&*pool)
    .await?;
    
    let metadata = if let Some(meta) = metadata_row {
        // Get characters for this document
        let characters = sqlx::query!(
            "SELECT character_name FROM document_characters WHERE document_id = ?",
            id
        )
        .fetch_all(&*pool)
        .await?
        .into_iter()
        .map(|row| row.character_name)
        .collect();
        
        // Get keywords for this document
        let keywords = sqlx::query!(
            "SELECT keyword FROM document_keywords WHERE document_id = ?",
            id
        )
        .fetch_all(&*pool)
        .await?
        .into_iter()
        .map(|row| row.keyword)
        .collect();
        
        Some(DocumentMetadata {
            pov: meta.pov,
            setting: meta.setting,
            characters,
            keywords,
            event_date: meta.event_date,
            importance: meta.importance,
            content_format: meta.content_format,
            visibility: meta.visibility,
            ai_assisted: meta.ai_assisted != 0,
            version: meta.version,
            custom_fields: meta.custom_fields,
        })
    } else {
        None
    };
    
    Ok(DocumentWithMetadata {
        id: doc.id,
        project_id: doc.project_id,
        parent_id: doc.parent_id,
        title: doc.title,
        content: doc.content,
        synopsis: doc.synopsis,
        r#type: doc.r#type,
        status: doc.status,
        word_count: doc.word_count,
        target_word_count: doc.target_word_count,
        position: doc.position,
        created_at: doc.created_at,
        last_modified: doc.last_modified,
        labels,
        metadata,
    })
}

// Create a new document
#[tauri::command]
pub async fn create_document(document: NewDocument, db_pool: State<'_, DbPool>) -> Result<DocumentWithMetadata, Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    let id = Uuid::new_v4().to_string();
    let timestamp = get_current_timestamp();
    
    // Determine position (if not specified, put at the end)
    let position = if let Some(pos) = document.position {
        pos
    } else {
        // Get max position for siblings
        let max_position = sqlx::query!(
            "SELECT COALESCE(MAX(position), -1) as max_pos FROM documents 
             WHERE project_id = ? AND parent_id IS NOT DISTINCT FROM ?",
            document.project_id,
            document.parent_id
        )
        .fetch_one(&mut *tx)
        .await?
        .max_pos + 1;
        
        max_position
    };
    
    // Insert the document
    sqlx::query!(
        "INSERT INTO documents (id, project_id, parent_id, title, content, synopsis, type, status, 
         word_count, target_word_count, position, created_at, last_modified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id,
        document.project_id,
        document.parent_id,
        document.title,
        document.content,
        document.synopsis,
        document.r#type,
        document.status.unwrap_or("not-started".to_string()),
        document.word_count.unwrap_or(0),
        document.target_word_count,
        position,
        timestamp.clone(),
        timestamp.clone()
    )
    .execute(&mut *tx)
    .await?;
    
    // Insert labels if provided
    if let Some(labels) = &document.labels {
        for label in labels {
            sqlx::query!(
                "INSERT INTO document_labels (document_id, label) VALUES (?, ?)",
                id,
                label
            )
            .execute(&mut *tx)
            .await?;
        }
    }
    
    // Insert metadata if provided
    if let Some(meta) = &document.metadata {
        // Insert basic metadata
        sqlx::query!(
            "INSERT INTO document_metadata (
                document_id, pov, setting, event_date, importance, content_format,
                visibility, ai_assisted, version, custom_fields
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            id,
            meta.pov,
            meta.setting,
            meta.event_date,
            meta.importance,
            meta.content_format.clone().unwrap_or("rich_text".to_string()),
            meta.visibility.clone().unwrap_or("private".to_string()),
            meta.ai_assisted.unwrap_or(false) as i32,
            1, // initial version
            meta.custom_fields
        )
        .execute(&mut *tx)
        .await?;
        
        // Insert characters if provided
        if let Some(characters) = &meta.characters {
            for character in characters {
                sqlx::query!(
                    "INSERT INTO document_characters (document_id, character_name) VALUES (?, ?)",
                    id,
                    character
                )
                .execute(&mut *tx)
                .await?;
            }
        }
        
        // Insert keywords if provided
        if let Some(keywords) = &meta.keywords {
            for keyword in keywords {
                sqlx::query!(
                    "INSERT INTO document_keywords (document_id, keyword) VALUES (?, ?)",
                    id,
                    keyword
                )
                .execute(&mut *tx)
                .await?;
            }
        }
    }
    
    // Update project last_modified timestamp
    sqlx::query!(
        "UPDATE projects SET last_modified = ? WHERE id = ?",
        timestamp,
        document.project_id
    )
    .execute(&mut *tx)
    .await?;
    
    // Commit the transaction
    tx.commit().await?;
    
    // Return the created document with metadata
    let created_doc = DocumentWithMetadata {
        id,
        project_id: document.project_id,
        parent_id: document.parent_id,
        title: document.title,
        content: document.content,
        synopsis: document.synopsis,
        r#type: document.r#type,
        status: document.status.unwrap_or("not-started".to_string()),
        word_count: document.word_count.unwrap_or(0),
        target_word_count: document.target_word_count,
        position,
        created_at: timestamp.clone(),
        last_modified: timestamp,
        labels: document.labels.unwrap_or_default(),
        metadata: document.metadata.map(|meta| DocumentMetadata {
            pov: meta.pov,
            setting: meta.setting,
            characters: meta.characters.unwrap_or_default(),
            keywords: meta.keywords.unwrap_or_default(),
            event_date: meta.event_date,
            importance: meta.importance,
            content_format: Some(meta.content_format.unwrap_or("rich_text".to_string())),
            visibility: Some(meta.visibility.unwrap_or("private".to_string())),
            ai_assisted: meta.ai_assisted.unwrap_or(false),
            version: 1,
            custom_fields: meta.custom_fields,
        }),
    };
    
    Ok(created_doc)
}

// Update a document
#[tauri::command]
pub async fn update_document(document: UpdateDocument, db_pool: State<'_, DbPool>) -> Result<DocumentWithMetadata, Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    // Get the existing document
    let existing = sqlx::query_as!(
        Document,
        "SELECT id, project_id, parent_id, title, content, synopsis, type as 'r#type', status, 
         word_count, target_word_count, position, created_at, last_modified 
         FROM documents WHERE id = ?",
        document.id
    )
    .fetch_one(&mut *tx)
    .await?;
    
    // Update timestamp
    let timestamp = get_current_timestamp();
    
    // Update document fields (only if provided)
    let updates = sqlx::query!(
        "UPDATE documents SET 
            title = COALESCE(?, title),
            content = CASE WHEN ? IS NOT NULL THEN ? ELSE content END,
            synopsis = CASE WHEN ? IS NOT NULL THEN ? ELSE synopsis END,
            type = COALESCE(?, type),
            status = COALESCE(?, status),
            word_count = COALESCE(?, word_count),
            target_word_count = CASE WHEN ? IS NOT NULL THEN ? ELSE target_word_count END,
            position = COALESCE(?, position),
            parent_id = CASE WHEN ? IS NOT NULL THEN ? ELSE parent_id END,
            last_modified = ?
         WHERE id = ?",
        document.title,
        document.content.is_some() as i32,
        document.content,
        document.synopsis.is_some() as i32,
        document.synopsis,
        document.r#type,
        document.status,
        document.word_count,
        document.target_word_count.is_some() as i32,
        document.target_word_count,
        document.position,
        document.parent_id.is_some() as i32,
        document.parent_id,
        timestamp,
        document.id
    )
    .execute(&mut *tx)
    .await?;
    
    // Update labels if provided
    if let Some(labels) = &document.labels {
        // Delete existing labels
        sqlx::query!("DELETE FROM document_labels WHERE document_id = ?", document.id)
            .execute(&mut *tx)
            .await?;
        
        // Insert new labels
        for label in labels {
            sqlx::query!(
                "INSERT INTO document_labels (document_id, label) VALUES (?, ?)",
                document.id,
                label
            )
            .execute(&mut *tx)
            .await?;
        }
    }
    
    // Update metadata if provided
    if let Some(meta) = &document.metadata {
        // Check if metadata already exists
        let meta_exists = sqlx::query!(
            "SELECT 1 FROM document_metadata WHERE document_id = ?", 
            document.id
        )
        .fetch_optional(&mut *tx)
        .await?
        .is_some();
        
        if meta_exists {
            // Update existing metadata
            sqlx::query!(
                "UPDATE document_metadata SET
                    pov = CASE WHEN ? IS NOT NULL THEN ? ELSE pov END,
                    setting = CASE WHEN ? IS NOT NULL THEN ? ELSE setting END,
                    event_date = CASE WHEN ? IS NOT NULL THEN ? ELSE event_date END,
                    importance = CASE WHEN ? IS NOT NULL THEN ? ELSE importance END,
                    content_format = CASE WHEN ? IS NOT NULL THEN ? ELSE content_format END,
                    visibility = CASE WHEN ? IS NOT NULL THEN ? ELSE visibility END,
                    ai_assisted = CASE WHEN ? IS NOT NULL THEN ? ELSE ai_assisted END,
                    version = COALESCE(?, version + 1),
                    custom_fields = CASE WHEN ? IS NOT NULL THEN ? ELSE custom_fields END
                WHERE document_id = ?",
                meta.pov.is_some() as i32,
                meta.pov,
                meta.setting.is_some() as i32,
                meta.setting,
                meta.event_date.is_some() as i32,
                meta.event_date,
                meta.importance.is_some() as i32,
                meta.importance,
                meta.content_format.is_some() as i32,
                meta.content_format,
                meta.visibility.is_some() as i32,
                meta.visibility,
                meta.ai_assisted.is_some() as i32,
                meta.ai_assisted.unwrap_or(false) as i32,
                meta.version,
                meta.custom_fields.is_some() as i32,
                meta.custom_fields,
                document.id
            )
            .execute(&mut *tx)
            .await?;
        } else {
            // Insert new metadata
            sqlx::query!(
                "INSERT INTO document_metadata (
                    document_id, pov, setting, event_date, importance, content_format,
                    visibility, ai_assisted, version, custom_fields
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                document.id,
                meta.pov,
                meta.setting,
                meta.event_date,
                meta.importance,
                meta.content_format,
                meta.visibility,
                meta.ai_assisted.unwrap_or(false) as i32,
                meta.version.unwrap_or(1),
                meta.custom_fields
            )
            .execute(&mut *tx)
            .await?;
        }
        
        // Update characters if provided
        if let Some(characters) = &meta.characters {
            // Delete existing characters
            sqlx::query!("DELETE FROM document_characters WHERE document_id = ?", document.id)
                .execute(&mut *tx)
                .await?;
            
            // Insert new characters
            for character in characters {
                sqlx::query!(
                    "INSERT INTO document_characters (document_id, character_name) VALUES (?, ?)",
                    document.id,
                    character
                )
                .execute(&mut *tx)
                .await?;
            }
        }
        
        // Update keywords if provided
        if let Some(keywords) = &meta.keywords {
            // Delete existing keywords
            sqlx::query!("DELETE FROM document_keywords WHERE document_id = ?", document.id)
                .execute(&mut *tx)
                .await?;
            
            // Insert new keywords
            for keyword in keywords {
                sqlx::query!(
                    "INSERT INTO document_keywords (document_id, keyword) VALUES (?, ?)",
                    document.id,
                    keyword
                )
                .execute(&mut *tx)
                .await?;
            }
        }
    }
    
    // Update project last_modified timestamp
    sqlx::query!(
        "UPDATE projects SET last_modified = ? WHERE id = ?",
        timestamp,
        existing.project_id
    )
    .execute(&mut *tx)
    .await?;
    
    // Commit the transaction
    tx.commit().await?;
    
    // Return the updated document
    get_document(document.id, db_pool).await
}

// Delete a document
#[tauri::command]
pub async fn delete_document(id: String, db_pool: State<'_, DbPool>) -> Result<(), Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    // Get the document's project_id before deleting
    let project_id = sqlx::query!(
        "SELECT project_id FROM documents WHERE id = ?", 
        id
    )
    .fetch_one(&mut *tx)
    .await?
    .project_id;
    
    // Update timestamps
    let timestamp = get_current_timestamp();
    
    // Delete document (will cascade to metadata, labels, etc.)
    sqlx::query!("DELETE FROM documents WHERE id = ?", id)
        .execute(&mut *tx)
        .await?;
    
    // Update project last_modified timestamp
    sqlx::query!(
        "UPDATE projects SET last_modified = ? WHERE id = ?",
        timestamp,
        project_id
    )
    .execute(&mut *tx)
    .await?;
    
    // Commit the transaction
    tx.commit().await?;
    
    Ok(())
}

// Perform a tree operation
#[tauri::command]
pub async fn document_tree_operation(operation: DocumentTreeOperation, db_pool: State<'_, DbPool>) -> Result<(), Error> {
    match operation {
        DocumentTreeOperation::Add { document, parent_id } => {
            let mut doc = document;
            doc.parent_id = parent_id;
            create_document(doc, db_pool).await?;
        },
        DocumentTreeOperation::Update { id, updates } => {
            let mut doc = updates;
            doc.id = id;
            update_document(doc, db_pool).await?;
        },
        DocumentTreeOperation::Delete { id } => {
            delete_document(id, db_pool).await?;
        },
        DocumentTreeOperation::Move { id, new_parent_id, new_position } => {
            // Special case for moving documents
            let pool = db_pool.0.lock().await;
            let mut tx = pool.begin().await?;
            
            // Get the document's project_id
            let doc = sqlx::query!(
                "SELECT project_id, parent_id FROM documents WHERE id = ?", 
                id
            )
            .fetch_one(&mut *tx)
            .await?;
            
            // Only reorder if the parent is changing or position is changing
            if doc.parent_id != new_parent_id || true {
                // Update timestamps
                let timestamp = get_current_timestamp();
                
                // Update the document's parent and position
                sqlx::query!(
                    "UPDATE documents SET parent_id = ?, position = ?, last_modified = ? WHERE id = ?",
                    new_parent_id,
                    new_position,
                    timestamp,
                    id
                )
                .execute(&mut *tx)
                .await?;
                
                // Reorder siblings if needed
                sqlx::query!(
                    "UPDATE documents 
                     SET position = position + 1 
                     WHERE project_id = ? 
                       AND parent_id IS NOT DISTINCT FROM ? 
                       AND id != ? 
                       AND position >= ?",
                    doc.project_id,
                    new_parent_id,
                    id,
                    new_position
                )
                .execute(&mut *tx)
                .await?;
                
                // Update project last_modified timestamp
                sqlx::query!(
                    "UPDATE projects SET last_modified = ? WHERE id = ?",
                    timestamp,
                    doc.project_id
                )
                .execute(&mut *tx)
                .await?;
            }
            
            // Commit the transaction
            tx.commit().await?;
        }
    }
    
    Ok(())
}

// Analytics commands

// Record a writing session
#[tauri::command]
pub async fn record_writing_session(session: NewWritingSession, db_pool: State<'_, DbPool>) -> Result<WritingSession, Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    let id = Uuid::new_v4().to_string();
    
    // Insert writing session
    sqlx::query!(
        "INSERT INTO writing_sessions (id, project_id, start_time, end_time, duration, word_count, words_per_minute)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        id,
        session.project_id,
        session.start_time,
        session.end_time,
        session.duration,
        session.word_count,
        session.words_per_minute
    )
    .execute(&mut *tx)
    .await?;
    
    // Link session to documents
    for document_id in &session.document_ids {
        sqlx::query!(
            "INSERT INTO session_documents (session_id, document_id) VALUES (?, ?)",
            id,
            document_id
        )
        .execute(&mut *tx)
        .await?;
    }
    
    // Extract date from start_time (this is simplified - use a proper date library in production)
    let date = session.start_time.split('T').next().unwrap_or("").to_string();
    
    // Update daily word count
    sqlx::query!(
        "INSERT INTO daily_word_counts (project_id, date, word_count)
         VALUES (?, ?, ?)
         ON CONFLICT(project_id, date) DO UPDATE SET
         word_count = word_count + excluded.word_count",
        session.project_id,
        date,
        session.word_count
    )
    .execute(&mut *tx)
    .await?;
    
    // Update writing time
    sqlx::query!(
        "INSERT INTO writing_time (project_id, date, seconds)
         VALUES (?, ?, ?)
         ON CONFLICT(project_id, date) DO UPDATE SET
         seconds = seconds + excluded.seconds",
        session.project_id,
        date,
        session.duration
    )
    .execute(&mut *tx)
    .await?;
    
    // Commit the transaction
    tx.commit().await?;
    
    // Return the created session
    let created_session = WritingSession {
        id,
        project_id: session.project_id,
        start_time: session.start_time,
        end_time: session.end_time,
        duration: session.duration,
        word_count: session.word_count,
        words_per_minute: session.words_per_minute,
    };
    
    Ok(created_session)
}

// Get project analytics
#[tauri::command]
pub async fn get_project_analytics(project_id: String, db_pool: State<'_, DbPool>) -> Result<String, Error> {
    let pool = db_pool.0.lock().await;
    
    // Get daily word counts
    let daily_word_counts = sqlx::query!(
        "SELECT date, word_count FROM daily_word_counts WHERE project_id = ? ORDER BY date",
        project_id
    )
    .fetch_all(&*pool)
    .await?;
    
    // Get writing time
    let writing_time = sqlx::query!(
        "SELECT date, seconds FROM writing_time WHERE project_id = ? ORDER BY date",
        project_id
    )
    .fetch_all(&*pool)
    .await?;
    
    // Get writing sessions
    let sessions = sqlx::query_as!(
        WritingSession,
        "SELECT id, project_id, start_time, end_time, duration, word_count, words_per_minute 
         FROM writing_sessions WHERE project_id = ? ORDER BY start_time",
        project_id
    )
    .fetch_all(&*pool)
    .await?;
    
    // Calculate total word count
    let total_word_count: i32 = daily_word_counts.iter().map(|row| row.word_count).sum();
    
    // Calculate average words per day
    let avg_words_per_day = if daily_word_counts.is_empty() {
        0.0
    } else {
        total_word_count as f64 / daily_word_counts.len() as f64
    };
    
    // Calculate average words per session
    let avg_words_per_session = if sessions.is_empty() {
        0.0
    } else {
        sessions.iter().map(|s| s.word_count).sum::<i32>() as f64 / sessions.len() as f64
    };
    
    // Calculate average session duration
    let avg_session_duration = if sessions.is_empty() {
        0.0
    } else {
        sessions.iter().map(|s| s.duration).sum::<i32>() as f64 / sessions.len() as f64
    };
    
    // Build the analytics JSON structure
    let analytics = serde_json::json!({
        "dailyWordCounts": daily_word_counts.iter().map(|row| {
            (row.date.clone(), row.word_count)
        }).collect::<HashMap<String, i32>>(),
        
        "writingTime": writing_time.iter().map(|row| {
            (row.date.clone(), row.seconds)
        }).collect::<HashMap<String, i32>>(),
        
        "sessions": sessions,
        
        "stats": {
            "totalWordCount": total_word_count,
            "averageWordsPerDay": avg_words_per_day,
            "averageWordsPerSession": avg_words_per_session,
            "averageSessionDuration": avg_session_duration,
            "daysWritten": daily_word_counts.len(),
            "totalSessions": sessions.len(),
        }
    });
    
    Ok(analytics.to_string())
}

// Project Template commands

// TODO: Implement project template management commands
