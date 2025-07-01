/**
 * Web Worker for SQLite operations
 * This worker handles SQLite operations in a separate thread
 */

// This will be set by the 'init' action
let SQL;
let db = null;

// Handle messages from the main thread
self.onmessage = async (event) => {
  const { id, action, data } = event.data;
  
  try {
    let results;
    
    switch (action) {
      case 'init':
        results = await initSqlJs(data);
        break;
      case 'createDatabase':
        results = createDatabase();
        break;
      case 'loadDatabase':
        results = loadDatabase(data.buffer);
        break;
      case 'exec':
        results = exec(data.sql);
        break;
      case 'run':
        results = run(data.sql, data.params);
        break;
      case 'all':
        results = all(data.sql, data.params);
        break;
      case 'get':
        results = get(data.sql, data.params);
        break;
      case 'exportDatabase':
        results = exportDatabase();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    self.postMessage({
      id,
      results
    });
  } catch (error) {
    console.error(`Error in SQL worker (${action}):`, error);
    self.postMessage({
      id,
      error: error.message || 'Unknown error'
    });
  }
};

/**
 * Initialize SQL.js
 */
async function initSqlJs({ scriptUrl, wasmUrl }) {
  try {
    // Fetch and eval the SQL.js script
    const response = await fetch(scriptUrl);
    const scriptText = await response.text();
    
    // Instead of using importScripts which can be blocked by CORS,
    // we manually load and eval the script
    eval(scriptText);
    
    // Check for initSqlJs function in various locations
    if (typeof initSqlJs === 'function') {
      SQL = await initSqlJs({ 
        locateFile: () => wasmUrl 
      });
    } else if (self.Module && typeof self.Module.initSqlJs === 'function') {
      SQL = await self.Module.initSqlJs({ 
        locateFile: () => wasmUrl 
      });
    } else if (self.exports && typeof self.exports.initSqlJs === 'function') {
      SQL = await self.exports.initSqlJs({ 
        locateFile: () => wasmUrl 
      });
    } else if (self.sqlJs && typeof self.sqlJs.initSqlJs === 'function') {
      SQL = await self.sqlJs.initSqlJs({ 
        locateFile: () => wasmUrl 
      });
    } else {
      // Log available globals for debugging
      console.error('initSqlJs not found. Available globals:', Object.keys(self).filter(key => typeof self[key] === 'object' || typeof self[key] === 'function'));
      throw new Error('Could not find initSqlJs function');
    }
    
    return { initialized: true };
  } catch (error) {
    console.error('Error initializing SQL.js:', error);
    throw error;
  }
}

/**
 * Create a new in-memory database
 */
function createDatabase() {
  if (db) {
    db.close();
  }
  
  db = new SQL.Database();
  return { created: true };
}

/**
 * Load a database from an array buffer
 */
function loadDatabase(buffer) {
  if (db) {
    db.close();
  }
  
  const uint8Array = new Uint8Array(buffer);
  db = new SQL.Database(uint8Array);
  return { loaded: true };
}

/**
 * Execute a SQL query without parameters
 */
function exec(sql) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  return db.exec(sql);
}

/**
 * Execute a SQL query with parameters
 */
function run(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const stmt = db.prepare(sql);
  try {
    stmt.run(params);
    return { changes: db.getRowsModified() };
  } finally {
    stmt.free();
  }
}

/**
 * Get all rows from a SQL query
 */
function all(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const stmt = db.prepare(sql);
  try {
    const rows = [];
    stmt.bind(params);
    
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    
    return rows;
  } finally {
    stmt.free();
  }
}

/**
 * Get a single row from a SQL query
 */
function get(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    
    if (stmt.step()) {
      return stmt.getAsObject();
    } else {
      return null;
    }
  } finally {
    stmt.free();
  }
}

/**
 * Export the database to an array buffer
 */
function exportDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  
  const data = db.export();
  return data.buffer;
}
