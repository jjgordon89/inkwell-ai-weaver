
// SQLite Web Worker for sql.js
// Proper Web Worker implementation without importScripts

// Define worker context properly
const ctx: Worker = self as any;

let db: any = null;
let SQL: any = null;

// Initialize SQL.js function
async function initializeSQLJS() {
  try {
    // Load sql.js dynamically using fetch instead of importScripts
    const response = await fetch('https://sql.js.org/dist/sql-wasm.js');
    const scriptText = await response.text();
    
    // Execute the script in worker context
    eval(scriptText);
    
    // Initialize SQL.js
    const initSqlJs = (self as any).initSqlJs;
    if (!initSqlJs) {
      throw new Error('initSqlJs not found - sql.js may not have loaded properly');
    }
    
    SQL = await initSqlJs({ 
      locateFile: (file: string) => `https://sql.js.org/dist/${file}` 
    });
    
    console.log('[DB Worker] SQL.js initialized successfully');
    return true;
  } catch (error) {
    console.error('[DB Worker] Failed to initialize SQL.js:', error);
    throw error;
  }
}

// Message handler
ctx.onmessage = async (event: MessageEvent) => {
  const { id, action, args } = event.data;
  
  try {
    // Initialize SQL.js if not already done
    if (!SQL) {
      await initializeSQLJS();
    }

    // Handle different actions
    if (action === 'init') {
      try {
        if (!SQL) throw new Error('SQL.js not initialized');
        
        db = new SQL.Database(args && args.data ? new Uint8Array(args.data) : undefined);
        console.log('[DB Worker] Database initialized');
        ctx.postMessage({ id, result: true });
      } catch (error) {
        console.error('[DB Worker] Database initialization failed:', error);
        throw error;
      }
      return;
    }

    if (!db) {
      throw new Error('Database not initialized');
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
        db.close();
        db = null;
        result = true;
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    ctx.postMessage({ id, result });
  } catch (error) {
    console.error('[DB Worker] Operation failed:', error);
    ctx.postMessage({ 
      id, 
      error: (error as Error)?.message || String(error) 
    });
  }
};

// Handle worker errors
ctx.onerror = (error) => {
  console.error('[DB Worker] Worker error:', error);
};

console.log('[DB Worker] Worker script loaded');
