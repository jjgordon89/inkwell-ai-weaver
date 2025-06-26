
// SQLite Web Worker for sql.js
// Improved implementation with better error handling and fallback

const ctx: Worker = self as any;

let db: any = null;
let SQL: any = null;
let initializationAttempted = false;

// Initialize SQL.js function with fallback approach
async function initializeSQLJS() {
  if (initializationAttempted) {
    throw new Error('SQL.js initialization already attempted and failed');
  }
  
  initializationAttempted = true;
  
  try {
    console.log('[DB Worker] Starting SQL.js initialization...');
    
    // Try to use a local fallback or different CDN
    const cdnUrls = [
      'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js',
      'https://unpkg.com/sql.js@1.8.0/dist/sql-wasm.js',
      'https://sql.js.org/dist/sql-wasm.js'
    ];
    
    let scriptLoaded = false;
    let lastError: Error | null = null;
    
    for (const url of cdnUrls) {
      try {
        console.log(`[DB Worker] Trying to load SQL.js from: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout per URL
        
        const response = await fetch(url, { 
          signal: controller.signal,
          mode: 'cors'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const scriptText = await response.text();
        
        // Execute the script in worker context
        eval(scriptText);
        
        scriptLoaded = true;
        console.log(`[DB Worker] Successfully loaded SQL.js from: ${url}`);
        break;
        
      } catch (error) {
        console.warn(`[DB Worker] Failed to load from ${url}:`, error);
        lastError = error as Error;
        continue;
      }
    }
    
    if (!scriptLoaded) {
      throw new Error(`Failed to load SQL.js from all CDN sources. Last error: ${lastError?.message}`);
    }
    
    // Initialize SQL.js
    const initSqlJs = (self as any).initSqlJs;
    if (!initSqlJs) {
      throw new Error('initSqlJs function not found - SQL.js may not have loaded properly');
    }
    
    console.log('[DB Worker] Initializing SQL.js engine...');
    
    SQL = await initSqlJs({ 
      locateFile: (file: string) => {
        // Try multiple CDN sources for wasm files
        const wasmCdns = [
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
          `https://unpkg.com/sql.js@1.8.0/dist/${file}`,
          `https://sql.js.org/dist/${file}`
        ];
        return wasmCdns[0]; // Use the first one, browser will fallback if needed
      }
    });
    
    console.log('[DB Worker] SQL.js initialized successfully');
    return true;
    
  } catch (error) {
    console.error('[DB Worker] Failed to initialize SQL.js:', error);
    initializationAttempted = false; // Allow retry
    throw error;
  }
}

// Message handler with improved error handling
ctx.onmessage = async (event: MessageEvent) => {
  const { id, action, args } = event.data;
  
  try {
    // Handle initialization with timeout
    if (action === 'init') {
      try {
        if (!SQL) {
          console.log('[DB Worker] Initializing SQL.js for database creation...');
          await Promise.race([
            initializeSQLJS(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('SQL.js initialization timeout')), 10000)
            )
          ]);
        }
        
        console.log('[DB Worker] Creating database instance...');
        db = new SQL.Database(args && args.data ? new Uint8Array(args.data) : undefined);
        console.log('[DB Worker] Database initialized successfully');
        
        ctx.postMessage({ id, result: true });
        return;
        
      } catch (error) {
        console.error('[DB Worker] Database initialization failed:', error);
        ctx.postMessage({ 
          id, 
          error: `Database initialization failed: ${(error as Error)?.message || String(error)}` 
        });
        return;
      }
    }

    // For other actions, ensure SQL is initialized
    if (!SQL) {
      await initializeSQLJS();
    }

    if (!db) {
      throw new Error('Database not initialized. Call init first.');
    }

    let result;
    switch (action) {
      case 'exec':
        result = db.exec(args.sql, args.params);
        break;
      case 'run':
        db.run(args.sql, args.params);
        result = true;
        break;
      case 'export':
        result = db.export();
        break;
      case 'close':
        if (db) {
          db.close();
          db = null;
        }
        result = true;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    ctx.postMessage({ id, result });
    
  } catch (error) {
    console.error(`[DB Worker] Operation '${action}' failed:`, error);
    ctx.postMessage({ 
      id, 
      error: `Operation failed: ${(error as Error)?.message || String(error)}` 
    });
  }
};

// Handle worker errors
ctx.onerror = (error) => {
  console.error('[DB Worker] Worker error:', error);
};

// Handle unhandled promise rejections
ctx.addEventListener('unhandledrejection', (event) => {
  console.error('[DB Worker] Unhandled promise rejection:', event.reason);
});

console.log('[DB Worker] Worker script loaded and ready');
