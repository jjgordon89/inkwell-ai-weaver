use sqlx::SqlitePool;
use tokio::sync::Mutex;
use std::sync::Arc;

// State holder for SQLite database connection pool
pub struct DbPool(pub Mutex<SqlitePool>);

// State holder for LanceDB connection (will be implemented in the future)
pub struct LanceConnection(pub Arc<()>); // Placeholder for LanceDB connection
