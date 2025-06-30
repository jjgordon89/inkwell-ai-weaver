use serde::{Serialize, Deserialize};
use tauri::State;
use uuid::Uuid;
use sqlx::FromRow;
use crate::core::{error::Error, state::DbPool};
use std::time::{SystemTime, UNIX_EPOCH};

// Project template model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct ProjectTemplate {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub structure: String,
    pub author_name: Option<String>,
    pub author_email: Option<String>,
    pub preview_image: Option<String>,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub estimated_time: Option<String>,
    pub created_at: String,
    pub last_modified: String,
}

// Template document model
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TemplateDocument {
    pub id: String,
    pub template_id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: String,
    pub status: String,
    pub position: i32,
}

// Template document with metadata for frontend
#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateDocumentWithMetadata {
    pub id: String,
    pub template_id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: String,
    pub status: String,
    pub position: i32,
    pub labels: Vec<String>,
    pub metadata: Option<TemplateDocumentMetadata>,
}

// Template document metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateDocumentMetadata {
    pub pov: Option<String>,
    pub setting: Option<String>,
    pub characters: Vec<String>,
    pub keywords: Vec<String>,
    pub event_date: Option<String>,
    pub importance: Option<String>,
    pub content_format: Option<String>,
    pub visibility: Option<String>,
    pub ai_assisted: bool,
    pub custom_fields: Option<String>,
}

// Struct for creating a new project template
#[derive(Debug, Serialize, Deserialize)]
pub struct NewProjectTemplate {
    pub name: String,
    pub description: Option<String>,
    pub structure: String,
    pub author_name: Option<String>,
    pub author_email: Option<String>,
    pub preview_image: Option<String>,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub estimated_time: Option<String>,
    pub tags: Option<Vec<String>>,
    pub documents: Option<Vec<NewTemplateDocument>>,
}

// Struct for creating a new template document
#[derive(Debug, Serialize, Deserialize)]
pub struct NewTemplateDocument {
    pub parent_id: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub synopsis: Option<String>,
    pub r#type: String,
    pub status: Option<String>,
    pub position: Option<i32>,
    pub labels: Option<Vec<String>>,
    pub metadata: Option<NewTemplateDocumentMetadata>,
}

// Struct for template document metadata
#[derive(Debug, Serialize, Deserialize)]
pub struct NewTemplateDocumentMetadata {
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

// Struct for updating a project template
#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProjectTemplate {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub structure: Option<String>,
    pub author_name: Option<String>,
    pub author_email: Option<String>,
    pub preview_image: Option<String>,
    pub category: Option<String>,
    pub difficulty: Option<String>,
    pub estimated_time: Option<String>,
    pub tags: Option<Vec<String>>,
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

// Get all project templates
#[tauri::command]
pub async fn get_all_templates(db_pool: State<'_, DbPool>) -> Result<Vec<ProjectTemplate>, Error> {
    let pool = db_pool.0.lock().await;
    
    let templates = sqlx::query_as!(
        ProjectTemplate,
        "SELECT id, name, description, structure, author_name, author_email, 
         preview_image, category, difficulty, estimated_time, created_at, last_modified 
         FROM project_templates ORDER BY name ASC"
    )
    .fetch_all(&*pool)
    .await?;
    
    Ok(templates)
}

// Get a project template by ID
#[tauri::command]
pub async fn get_template_by_id(id: String, db_pool: State<'_, DbPool>) -> Result<ProjectTemplate, Error> {
    let pool = db_pool.0.lock().await;
    
    let template = sqlx::query_as!(
        ProjectTemplate,
        "SELECT id, name, description, structure, author_name, author_email, 
         preview_image, category, difficulty, estimated_time, created_at, last_modified 
         FROM project_templates WHERE id = ?",
        id
    )
    .fetch_one(&*pool)
    .await?;
    
    Ok(template)
}

// Get tags for a template
#[tauri::command]
pub async fn get_template_tags(template_id: String, db_pool: State<'_, DbPool>) -> Result<Vec<String>, Error> {
    let pool = db_pool.0.lock().await;
    
    let tags = sqlx::query!(
        "SELECT tag FROM template_tags WHERE template_id = ?",
        template_id
    )
    .fetch_all(&*pool)
    .await?
    .into_iter()
    .map(|row| row.tag)
    .collect();
    
    Ok(tags)
}

// Get template documents
#[tauri::command]
pub async fn get_template_documents(template_id: String, db_pool: State<'_, DbPool>) -> Result<Vec<TemplateDocumentWithMetadata>, Error> {
    let pool = db_pool.0.lock().await;
    
    // Get all documents for the template
    let documents = sqlx::query_as!(
        TemplateDocument,
        "SELECT id, template_id, parent_id, title, content, synopsis, type as 'r#type', status, position
         FROM template_documents WHERE template_id = ? ORDER BY position ASC",
        template_id
    )
    .fetch_all(&*pool)
    .await?;
    
    // For each document, get its labels and metadata
    let mut documents_with_metadata = Vec::new();
    
    for doc in documents {
        // Get labels
        let labels = sqlx::query!(
            "SELECT label FROM template_document_labels WHERE document_id = ?",
            doc.id
        )
        .fetch_all(&*pool)
        .await?
        .into_iter()
        .map(|row| row.label)
        .collect::<Vec<String>>();
        
        // Get metadata
        let metadata_row = sqlx::query!(
            "SELECT pov, setting, event_date, importance, content_format, visibility, 
             ai_assisted, custom_fields
             FROM template_document_metadata WHERE document_id = ?",
            doc.id
        )
        .fetch_optional(&*pool)
        .await?;
        
        let metadata = if let Some(meta) = metadata_row {
            // Get characters
            let characters = sqlx::query!(
                "SELECT character_name FROM template_document_characters WHERE document_id = ?",
                doc.id
            )
            .fetch_all(&*pool)
            .await?
            .into_iter()
            .map(|row| row.character_name)
            .collect();
            
            // Get keywords
            let keywords = sqlx::query!(
                "SELECT keyword FROM template_document_keywords WHERE document_id = ?",
                doc.id
            )
            .fetch_all(&*pool)
            .await?
            .into_iter()
            .map(|row| row.keyword)
            .collect();
            
            Some(TemplateDocumentMetadata {
                pov: meta.pov,
                setting: meta.setting,
                characters,
                keywords,
                event_date: meta.event_date,
                importance: meta.importance,
                content_format: meta.content_format,
                visibility: meta.visibility,
                ai_assisted: meta.ai_assisted != 0,
                custom_fields: meta.custom_fields,
            })
        } else {
            None
        };
        
        documents_with_metadata.push(TemplateDocumentWithMetadata {
            id: doc.id,
            template_id: doc.template_id,
            parent_id: doc.parent_id,
            title: doc.title,
            content: doc.content,
            synopsis: doc.synopsis,
            r#type: doc.r#type,
            status: doc.status,
            position: doc.position,
            labels,
            metadata,
        });
    }
    
    Ok(documents_with_metadata)
}

// Create a new project template
#[tauri::command]
pub async fn create_template(template: NewProjectTemplate, db_pool: State<'_, DbPool>) -> Result<ProjectTemplate, Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    let id = Uuid::new_v4().to_string();
    let timestamp = get_current_timestamp();
    
    // Insert the template
    sqlx::query!(
        "INSERT INTO project_templates (
            id, name, description, structure, author_name, author_email,
            preview_image, category, difficulty, estimated_time, created_at, last_modified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id,
        template.name,
        template.description,
        template.structure,
        template.author_name,
        template.author_email,
        template.preview_image,
        template.category,
        template.difficulty,
        template.estimated_time,
        timestamp,
        timestamp
    )
    .execute(&mut *tx)
    .await?;
    
    // Insert tags if provided
    if let Some(tags) = template.tags {
        for tag in tags {
            sqlx::query!(
                "INSERT INTO template_tags (template_id, tag) VALUES (?, ?)",
                id,
                tag
            )
            .execute(&mut *tx)
            .await?;
        }
    }
    
    // Insert documents if provided
    if let Some(documents) = template.documents {
        // Create a mapping from temporary IDs to real IDs
        let mut id_mapping = std::collections::HashMap::new();
        
        // First pass: create all documents with generated IDs
        for doc in &documents {
            let doc_id = Uuid::new_v4().to_string();
            
            // Store the real ID for later parent ID mapping
            id_mapping.insert(doc_id.clone(), doc_id.clone());
            
            // Determine position
            let position = if let Some(pos) = doc.position {
                pos
            } else {
                // Get max position for siblings
                let parent_id_param = match &doc.parent_id {
                    Some(pid) => {
                        // If it's a temporary ID, we don't have the real ID yet, so default to NULL
                        if id_mapping.contains_key(pid) {
                            Some(id_mapping[pid].clone())
                        } else {
                            None
                        }
                    },
                    None => None,
                };
                
                let max_position = sqlx::query!(
                    "SELECT COALESCE(MAX(position), -1) as max_pos FROM template_documents 
                     WHERE template_id = ? AND parent_id IS NOT DISTINCT FROM ?",
                    id,
                    parent_id_param
                )
                .fetch_one(&mut *tx)
                .await?
                .max_pos + 1;
                
                max_position
            };
            
            // Insert the document
            sqlx::query!(
                "INSERT INTO template_documents (
                    id, template_id, parent_id, title, content, synopsis,
                    type, status, position
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                doc_id,
                id,
                doc.parent_id.as_ref().and_then(|pid| id_mapping.get(pid).cloned()),
                doc.title,
                doc.content,
                doc.synopsis,
                doc.r#type,
                doc.status.clone().unwrap_or("not-started".to_string()),
                position
            )
            .execute(&mut *tx)
            .await?;
            
            // Insert labels if provided
            if let Some(labels) = &doc.labels {
                for label in labels {
                    sqlx::query!(
                        "INSERT INTO template_document_labels (document_id, label) VALUES (?, ?)",
                        doc_id,
                        label
                    )
                    .execute(&mut *tx)
                    .await?;
                }
            }
            
            // Insert metadata if provided
            if let Some(meta) = &doc.metadata {
                // Insert basic metadata
                sqlx::query!(
                    "INSERT INTO template_document_metadata (
                        document_id, pov, setting, event_date, importance,
                        content_format, visibility, ai_assisted, custom_fields
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    doc_id,
                    meta.pov,
                    meta.setting,
                    meta.event_date,
                    meta.importance,
                    meta.content_format.clone().unwrap_or("rich_text".to_string()),
                    meta.visibility.clone().unwrap_or("private".to_string()),
                    meta.ai_assisted.unwrap_or(false) as i32,
                    meta.custom_fields
                )
                .execute(&mut *tx)
                .await?;
                
                // Insert characters if provided
                if let Some(characters) = &meta.characters {
                    for character in characters {
                        sqlx::query!(
                            "INSERT INTO template_document_characters (document_id, character_name) VALUES (?, ?)",
                            doc_id,
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
                            "INSERT INTO template_document_keywords (document_id, keyword) VALUES (?, ?)",
                            doc_id,
                            keyword
                        )
                        .execute(&mut *tx)
                        .await?;
                    }
                }
            }
        }
    }
    
    // Commit the transaction
    tx.commit().await?;
    
    // Return the created template
    let created_template = ProjectTemplate {
        id,
        name: template.name,
        description: template.description,
        structure: template.structure,
        author_name: template.author_name,
        author_email: template.author_email,
        preview_image: template.preview_image,
        category: template.category,
        difficulty: template.difficulty,
        estimated_time: template.estimated_time,
        created_at: timestamp.clone(),
        last_modified: timestamp,
    };
    
    Ok(created_template)
}

// Update a project template
#[tauri::command]
pub async fn update_template(template: UpdateProjectTemplate, db_pool: State<'_, DbPool>) -> Result<ProjectTemplate, Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    // Get the existing template
    let existing = sqlx::query_as!(
        ProjectTemplate,
        "SELECT id, name, description, structure, author_name, author_email, 
         preview_image, category, difficulty, estimated_time, created_at, last_modified 
         FROM project_templates WHERE id = ?",
        template.id
    )
    .fetch_one(&mut *tx)
    .await?;
    
    // Update timestamp
    let timestamp = get_current_timestamp();
    
    // Update the template
    sqlx::query!(
        "UPDATE project_templates SET
            name = COALESCE(?, name),
            description = CASE WHEN ? IS NOT NULL THEN ? ELSE description END,
            structure = COALESCE(?, structure),
            author_name = CASE WHEN ? IS NOT NULL THEN ? ELSE author_name END,
            author_email = CASE WHEN ? IS NOT NULL THEN ? ELSE author_email END,
            preview_image = CASE WHEN ? IS NOT NULL THEN ? ELSE preview_image END,
            category = CASE WHEN ? IS NOT NULL THEN ? ELSE category END,
            difficulty = CASE WHEN ? IS NOT NULL THEN ? ELSE difficulty END,
            estimated_time = CASE WHEN ? IS NOT NULL THEN ? ELSE estimated_time END,
            last_modified = ?
         WHERE id = ?",
        template.name,
        template.description.is_some() as i32,
        template.description,
        template.structure,
        template.author_name.is_some() as i32,
        template.author_name,
        template.author_email.is_some() as i32,
        template.author_email,
        template.preview_image.is_some() as i32,
        template.preview_image,
        template.category.is_some() as i32,
        template.category,
        template.difficulty.is_some() as i32,
        template.difficulty,
        template.estimated_time.is_some() as i32,
        template.estimated_time,
        timestamp,
        template.id
    )
    .execute(&mut *tx)
    .await?;
    
    // Update tags if provided
    if let Some(tags) = &template.tags {
        // Delete existing tags
        sqlx::query!("DELETE FROM template_tags WHERE template_id = ?", template.id)
            .execute(&mut *tx)
            .await?;
        
        // Insert new tags
        for tag in tags {
            sqlx::query!(
                "INSERT INTO template_tags (template_id, tag) VALUES (?, ?)",
                template.id,
                tag
            )
            .execute(&mut *tx)
            .await?;
        }
    }
    
    // Commit the transaction
    tx.commit().await?;
    
    // Return the updated template
    let updated_template = ProjectTemplate {
        id: template.id,
        name: template.name.unwrap_or(existing.name),
        description: template.description.or(existing.description),
        structure: template.structure.unwrap_or(existing.structure),
        author_name: template.author_name.or(existing.author_name),
        author_email: template.author_email.or(existing.author_email),
        preview_image: template.preview_image.or(existing.preview_image),
        category: template.category.or(existing.category),
        difficulty: template.difficulty.or(existing.difficulty),
        estimated_time: template.estimated_time.or(existing.estimated_time),
        created_at: existing.created_at,
        last_modified: timestamp,
    };
    
    Ok(updated_template)
}

// Delete a project template
#[tauri::command]
pub async fn delete_template(id: String, db_pool: State<'_, DbPool>) -> Result<(), Error> {
    let pool = db_pool.0.lock().await;
    
    // Delete the template (will cascade to documents, tags, etc.)
    sqlx::query!("DELETE FROM project_templates WHERE id = ?", id)
        .execute(&*pool)
        .await?;
    
    Ok(())
}

// Create a project from a template
#[tauri::command]
pub async fn create_project_from_template(
    template_id: String,
    name: String,
    description: Option<String>,
    db_pool: State<'_, DbPool>
) -> Result<String, Error> {
    let pool = db_pool.0.lock().await;
    let mut tx = pool.begin().await?;
    
    let timestamp = get_current_timestamp();
    let project_id = Uuid::new_v4().to_string();
    
    // Get template info
    let template = sqlx::query_as!(
        ProjectTemplate,
        "SELECT * FROM project_templates WHERE id = ?",
        template_id
    )
    .fetch_one(&mut *tx)
    .await?;
    
    // Create the project
    sqlx::query!(
        "INSERT INTO projects (id, name, description, status, structure, created_at, last_modified)
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        project_id,
        name,
        description,
        "active",
        template.structure,
        timestamp.clone(),
        timestamp.clone()
    )
    .execute(&mut *tx)
    .await?;
    
    // Get template documents
    let template_documents = sqlx::query_as!(
        TemplateDocument,
        "SELECT id, template_id, parent_id, title, content, synopsis, type as 'r#type', status, position
         FROM template_documents WHERE template_id = ? ORDER BY position ASC",
        template_id
    )
    .fetch_all(&mut *tx)
    .await?;
    
    // Create a mapping from template document IDs to new document IDs
    let mut id_mapping = std::collections::HashMap::new();
    
    // Create documents from template documents
    for template_doc in &template_documents {
        let doc_id = Uuid::new_v4().to_string();
        
        // Map the template document ID to the new document ID
        id_mapping.insert(template_doc.id.clone(), doc_id.clone());
        
        // Determine parent ID (if any)
        let parent_id = template_doc.parent_id.as_ref().and_then(|pid| id_mapping.get(pid).cloned());
        
        // Insert the document
        sqlx::query!(
            "INSERT INTO documents (
                id, project_id, parent_id, title, content, synopsis,
                type, status, position, created_at, last_modified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            doc_id,
            project_id,
            parent_id,
            template_doc.title,
            template_doc.content,
            template_doc.synopsis,
            template_doc.r#type,
            template_doc.status,
            template_doc.position,
            timestamp.clone(),
            timestamp.clone()
        )
        .execute(&mut *tx)
        .await?;
        
        // Get labels for the template document
        let labels = sqlx::query!(
            "SELECT label FROM template_document_labels WHERE document_id = ?",
            template_doc.id
        )
        .fetch_all(&mut *tx)
        .await?;
        
        // Add labels to the new document
        for label_row in labels {
            sqlx::query!(
                "INSERT INTO document_labels (document_id, label) VALUES (?, ?)",
                doc_id,
                label_row.label
            )
            .execute(&mut *tx)
            .await?;
        }
        
        // Get metadata for the template document
        let metadata = sqlx::query!(
            "SELECT * FROM template_document_metadata WHERE document_id = ?",
            template_doc.id
        )
        .fetch_optional(&mut *tx)
        .await?;
        
        // Add metadata to the new document (if any)
        if let Some(meta) = metadata {
            // Insert basic metadata
            sqlx::query!(
                "INSERT INTO document_metadata (
                    document_id, pov, setting, event_date, importance,
                    content_format, visibility, ai_assisted, version, custom_fields
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                doc_id,
                meta.pov,
                meta.setting,
                meta.event_date,
                meta.importance,
                meta.content_format,
                meta.visibility,
                meta.ai_assisted,
                1, // Initial version
                meta.custom_fields
            )
            .execute(&mut *tx)
            .await?;
            
            // Get characters for the template document
            let characters = sqlx::query!(
                "SELECT character_name FROM template_document_characters WHERE document_id = ?",
                template_doc.id
            )
            .fetch_all(&mut *tx)
            .await?;
            
            // Add characters to the new document
            for char_row in characters {
                sqlx::query!(
                    "INSERT INTO document_characters (document_id, character_name) VALUES (?, ?)",
                    doc_id,
                    char_row.character_name
                )
                .execute(&mut *tx)
                .await?;
            }
            
            // Get keywords for the template document
            let keywords = sqlx::query!(
                "SELECT keyword FROM template_document_keywords WHERE document_id = ?",
                template_doc.id
            )
            .fetch_all(&mut *tx)
            .await?;
            
            // Add keywords to the new document
            for keyword_row in keywords {
                sqlx::query!(
                    "INSERT INTO document_keywords (document_id, keyword) VALUES (?, ?)",
                    doc_id,
                    keyword_row.keyword
                )
                .execute(&mut *tx)
                .await?;
            }
        }
    }
    
    // Commit the transaction
    tx.commit().await?;
    
    // Return the new project ID
    Ok(project_id)
}
