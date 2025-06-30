#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  mod core;
  use tauri::Manager;
  use core::{commands, state, db};

  tauri::Builder::default()
    .setup(|app| {
      // Set up logging for debug builds
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Initialize database in an async task
      let handle = app.handle().clone();
      tauri::async_runtime::spawn(async move {
        match db::setup_database(&handle).await {
          Ok(pool) => {
            // Store the database connection pool in Tauri's state
            handle.manage(state::DbPool(tokio::sync::Mutex::new(pool)));
            log::info!("Database initialized successfully");
          },
          Err(e) => {
            log::error!("Failed to initialize database: {:?}", e);
          }
        }

        // LanceDB setup will be implemented later
        // For now, just log a placeholder message
        log::info!("Vector database setup placeholder");
      });

      Ok(())
    })
    // Register Tauri commands
    .invoke_handler(tauri::generate_handler![
      // Project commands
      commands::get_all_projects,
      commands::create_project,
      commands::update_project,
      commands::delete_project,
      commands::migrate_from_localstorage,
      
      // Document commands
      commands::get_project_documents,
      commands::get_document,
      commands::create_document,
      commands::update_document,
      commands::delete_document,
      commands::document_tree_operation,
      
      // Analytics commands
      commands::record_writing_session,
      commands::get_project_analytics,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
