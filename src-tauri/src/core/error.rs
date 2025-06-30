use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    Serde(#[from] serde_json::Error),
    
    #[error("Migration failed: {0}")]
    Migration(#[from] sqlx::migrate::MigrateError),
    
    #[error("Vector DB error: {0}")]
    Lance(String),
    
    #[error("An unknown error occurred: {0}")]
    Generic(String),
}

// Implement Serialize for Error to return errors to frontend
impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
