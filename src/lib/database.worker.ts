// SQLite Web Worker for sql.js
// Improved implementation with better error handling and fallback

const ctx = self as unknown as Worker;

import type { SqlJsStatic, Database, BindParams, QueryExecResult } from 'sql.js';

interface DatabaseLike {
  exec: (sql: string, params?: BindParams | undefined) => QueryExecResult[];
  run: (sql: string, params?: BindParams | undefined) => void;
  export: () => Uint8Array;
  close: () => void;
}

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;
let initializationAttempted = false;

// Extend the global self object to include optional initSqlJs
interface SQLWorkerSelf {
  initSqlJs?: (config?: Record<string, unknown>) => Promise<SqlJsStatic>;
  Module?: {
    initSqlJs?: (config?: Record<string, unknown>) => Promise<SqlJsStatic>;
    [key: string]: unknown;
  };
  exports?: Record<string, unknown>; // Added for compatibility with some builds
  sqlJs?: Record<string, unknown>;   // Added for compatibility with some builds
  [key: string]: unknown;
}

declare const self: SQLWorkerSelf;

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
      // Self-hosted UMD build (place sql-wasm.js in public/ for local dev and production)
      '/sql-wasm.js',
      // CDNJS and others may sometimes serve ESM builds, so keep as fallback
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
        // --- Fix: Ensure initSqlJs is available on self ---
        if (typeof self.initSqlJs !== 'function') {
          // Try to find it in global scope (sometimes sql.js attaches to Module, exports, or sqlJs)
          if (self.Module && typeof self.Module.initSqlJs === 'function') {
            self.initSqlJs = self.Module.initSqlJs;
            console.log('[DB Worker] Found initSqlJs on self.Module');
          } else if (self.exports && typeof (self.exports.initSqlJs as unknown) === 'function') {
            self.initSqlJs = self.exports.initSqlJs as (config?: Record<string, unknown>) => Promise<SqlJsStatic>;
            console.log('[DB Worker] Found initSqlJs on self.exports');
          } else if (self.sqlJs && typeof (self.sqlJs.initSqlJs as unknown) === 'function') {
            self.initSqlJs = self.sqlJs.initSqlJs as (config?: Record<string, unknown>) => Promise<SqlJsStatic>;
            console.log('[DB Worker] Found initSqlJs on self.sqlJs');
          } else {
            // Try to find any global key named initSqlJs
            for (const key of Object.keys(self)) {
              if (key.toLowerCase().includes('initsqljs') && typeof self[key] === 'function') {
                self.initSqlJs = self[key] as (config?: Record<string, unknown>) => Promise<SqlJsStatic>;
                console.log(`[DB Worker] Found initSqlJs as self.${key}`);
                break;
              }
            }
          }
        }
        // Log all global keys for debugging if still not found
        if (typeof self.initSqlJs !== 'function') {
          const globalKeys = Object.keys(self).map(k => `${k}: ${typeof self[k]}`);
          console.error('[DB Worker] Could not find initSqlJs after eval. Global keys/types:', globalKeys);
          throw new Error('initSqlJs function not found after eval. This may be due to an incompatible CDN build of SQL.js. Try a different CDN or use a UMD build.');
        }
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
    const initSqlJs = (self as typeof globalThis).initSqlJs;
    if (!initSqlJs) {
      throw new Error('initSqlJs function not found - SQL.js may not have loaded properly');
    }
    
    console.log('[DB Worker] Initializing SQL.js engine...');
    
    SQL = await initSqlJs({
      ...(initSqlJs as object),
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
        if (SQL) {
          db = new SQL.Database(args && args.data ? new Uint8Array(args.data) : undefined);
          // No change needed here as db is now directly assigned
        } else {
          throw new Error('SQL.js is not initialized');
        }
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
        if (db) {
          db.exec(args.sql, args.params);
        } else {
          throw new Error('Database not initialized');
        }
        break;
      case 'run':
        if (db) {
          db.run(args.sql, args.params);
          result = true;
        } else {
          throw new Error('Database not initialized');
        }
        break;
      case 'export':
        if (db) {
          db.export();
        } else {
          throw new Error('Database not initialized');
        }
        break;
      case 'close':
        if (db) {
          db.close();
          db = null;
        } else {
          throw new Error('Database not initialized');
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
      id: id,
      error: `Operation failed: ${(error as Error)?.message || String(error)}`
    });
  }
};
