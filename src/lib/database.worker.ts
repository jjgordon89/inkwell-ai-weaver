// SQLite Web Worker for sql.js
importScripts('https://sql.js.org/dist/sql-wasm.js');

// importScripts is a web worker global, not in TypeScript DOM lib
declare function importScripts(...urls: string[]): void;
// postMessage is a web worker global, not in TypeScript DOM lib
declare function postMessage(message: Record<string, unknown>): void;

import type { Database, SqlJsStatic } from 'sql.js';

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

// 'self' is a web worker global, not typed as Worker
const ctx: Worker = self as unknown as Worker;

ctx.onmessage = async (event: MessageEvent) => {
  const { id, action, args } = event.data;
  try {
    if (!SQL) {
      // sql.js injects initSqlJs at runtime on the worker global; not typed in TypeScript
      const injected = (ctx as unknown as { initSqlJs?: (opts: { locateFile: (file: string) => string }) => Promise<SqlJsStatic> });
      if (!injected.initSqlJs) throw new Error('initSqlJs not found on worker context');
      SQL = await injected.initSqlJs({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` });
    }
    if (action === 'init') {
      db = SQL ? new SQL.Database(args && args.data ? new Uint8Array(args.data) : undefined) : null;
      postMessage({ id, result: true });
      return;
    }
    if (!db) throw new Error('Database not initialized');
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
    postMessage({ id, result });
  } catch (error) {
    postMessage({ id, error: (error as Error)?.message || String(error) });
  }
};
