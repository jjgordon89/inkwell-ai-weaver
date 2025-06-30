use sqlx::{migrate::MigrateDatabase, sqlite::{SqlitePool, SqlitePoolOptions}, Sqlite};
use tauri::AppHandle;
use crate::core::error::Error;

// Database setup function
pub async fn setup_database(app_handle: &AppHandle) -> Result<SqlitePool, Error> {
    let app_dir = app_handle.path_resolver().app_data_dir()
        .expect("App data directory not found");
    
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    }
    
    let db_path = app_dir.join("inkwell-app.sqlite");
    let db_url = format!("sqlite:{}", db_path.to_str().unwrap());
    
    // Create database if it doesn't exist
    if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
        Sqlite::create_database(&db_url).await?;
    }

    // Connect to the database
    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Run migrations
    let migrations_path = app_handle
        .path_resolver()
        .resolve_resource("migrations")
        .expect("Failed to resolve migrations path");
    
    log::info!("Running migrations from: {:?}", migrations_path);
    
    match sqlx::migrate::Migrator::new(migrations_path)
        .await
        .map_err(|e| {
            log::error!("Failed to create migrator: {:?}", e);
            e
        }) {
            Ok(migrator) => {
                migrator.run(&pool).await.map_err(|e| {
                    log::error!("Failed to run migrations: {:?}", e);
                    Error::DatabaseError(e.to_string())
                })?;
                log::info!("Migrations completed successfully");
            },
            Err(e) => {
                log::error!("Migration error: {:?}", e);
                // Fall back to manual table creation if migrations fail
                log::warn!("Falling back to manual table creation");
                create_tables(&pool).await?;
            }
        }

    Ok(pool)
}

// Function to create database tables (fallback if migrations fail)
async fn create_tables(pool: &SqlitePool) -> Result<(), Error> {
    // Projects table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            structure TEXT NOT NULL DEFAULT 'novel',
            word_count_target INTEGER,
            created_at TEXT NOT NULL,
            last_modified TEXT NOT NULL
        )"
    )
    .execute(pool)
    .await?;
    
    // Documents table with all fields from DocumentNode
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS documents (
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
        )"
    )
    .execute(pool)
    .await?;

    // Document labels junction table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS document_labels (
            document_id TEXT NOT NULL,
            label TEXT NOT NULL,
            PRIMARY KEY (document_id, label),
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Document metadata table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS document_metadata (
            document_id TEXT PRIMARY KEY NOT NULL,
            pov TEXT,
            setting TEXT,
            event_date TEXT,
            importance TEXT,
            content_format TEXT DEFAULT 'rich_text',
            visibility TEXT DEFAULT 'private',
            ai_assisted INTEGER DEFAULT 0,
            version INTEGER DEFAULT 1,
            custom_fields TEXT,
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Document metadata characters junction table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS document_characters (
            document_id TEXT NOT NULL,
            character_name TEXT NOT NULL,
            PRIMARY KEY (document_id, character_name),
            FOREIGN KEY (document_id) REFERENCES document_metadata (document_id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Document metadata keywords junction table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS document_keywords (
            document_id TEXT NOT NULL,
            keyword TEXT NOT NULL,
            PRIMARY KEY (document_id, keyword),
            FOREIGN KEY (document_id) REFERENCES document_metadata (document_id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Analytics table for project analytics
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS project_analytics (
            project_id TEXT PRIMARY KEY NOT NULL,
            data TEXT NOT NULL,
            last_updated TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Writing sessions table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS writing_sessions (
            id TEXT PRIMARY KEY NOT NULL,
            project_id TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            duration INTEGER NOT NULL,
            word_count INTEGER NOT NULL DEFAULT 0,
            words_per_minute REAL NOT NULL DEFAULT 0,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Writing session documents junction table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS session_documents (
            session_id TEXT NOT NULL,
            document_id TEXT NOT NULL,
            PRIMARY KEY (session_id, document_id),
            FOREIGN KEY (session_id) REFERENCES writing_sessions (id) ON DELETE CASCADE,
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Daily word counts table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS daily_word_counts (
            project_id TEXT NOT NULL,
            date TEXT NOT NULL,
            word_count INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (project_id, date),
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Writing time table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS writing_time (
            project_id TEXT NOT NULL,
            date TEXT NOT NULL,
            seconds INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (project_id, date),
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Settings table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY NOT NULL,
            value TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'general'
        )"
    )
    .execute(pool)
    .await?;

    // AI Providers table
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS ai_providers (
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            api_key TEXT,
            endpoint TEXT,
            model TEXT,
            is_active INTEGER NOT NULL DEFAULT 0,
            is_local INTEGER NOT NULL DEFAULT 0,
            configuration TEXT,
            created_at TEXT NOT NULL,
            last_modified TEXT NOT NULL
        )"
    )
    .execute(pool)
    .await?;

    // Document revision history
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS document_revisions (
            id TEXT PRIMARY KEY NOT NULL,
            document_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            user_id TEXT,
            user_name TEXT,
            change_description TEXT,
            word_count_delta INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // AI contributions to documents
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS ai_contributions (
            id TEXT PRIMARY KEY NOT NULL,
            document_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            type TEXT NOT NULL,
            prompt TEXT NOT NULL,
            content TEXT NOT NULL,
            accepted INTEGER NOT NULL DEFAULT 0,
            model_id TEXT,
            FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
        )"
    )
    .execute(pool)
    .await?;

    // Create indexes for performance
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_document_labels_document_id ON document_labels(document_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_writing_sessions_project_id ON writing_sessions(project_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_daily_word_counts_project_id ON daily_word_counts(project_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_document_revisions_document_id ON document_revisions(document_id)")
        .execute(pool)
        .await?;
    
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_ai_contributions_document_id ON ai_contributions(document_id)")
        .execute(pool)
        .await?;

    Ok(())
}

// Function to set up LanceDB (will be fully implemented later)
pub async fn setup_lancedb(_app_handle: &AppHandle) -> Result<(), Error> {
    // Placeholder for LanceDB setup
    // Will be implemented with actual LanceDB integration
    Ok(())
}
