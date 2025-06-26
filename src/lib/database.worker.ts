
// SQLite Web Worker for sql.js
// Use self instead of importScripts for better compatibility
self.importScripts = self.importScripts || function() {};

// Import sql.js
self.importScripts('https://sql.js.org/dist/sql-wasm.js');

import type { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

// Define worker context properly
const ctx: Worker = self as any;

// Message handler
ctx.onmessage = async (event: MessageEvent) => {
  const { id, action, args } = event.data;
  
  try {
    // Initialize SQL.js if not already done
    if (!SQL) {
      try {
        const initSqlJs = (self as any).initSqlJs;
        if (!initSqlJs) {
          throw new Error('initSqlJs not found - sql.js may not have loaded properly');
        }
        
        SQL = await initSqlJs({ 
          locateFile: (file: string) => `https://sql.js.org/dist/${file}` 
        });
        console.log('[DB Worker] SQL.js initialized successfully');
      } catch (error) {
        console.error('[DB Worker] Failed to initialize SQL.js:', error);
        throw error;
      }
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
