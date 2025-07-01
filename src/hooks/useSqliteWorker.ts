import { useEffect, useState, useCallback } from 'react';

interface SqlJsConfig {
  locateFile: (file: string) => string;
}

interface Database {
  exec: (sql: string) => Array<{ columns: string[]; values: unknown[][] }>;
  prepare: (sql: string) => Statement;
  close: () => void;
}

interface Statement {
  bind: (params: unknown[]) => void;
  step: () => boolean;
  get: (params?: unknown[]) => unknown;
  getAsObject: (params?: unknown[]) => Record<string, unknown>;
  getColumnNames: () => string[];
  free: () => void;
  run: (params?: unknown[]) => void;
}

interface SqlJsStatic {
  Database: new (data?: Uint8Array) => Database;
}

type SqlWorkerMessage = {
  id: number;
  action: string;
  data?: Record<string, unknown>;
};

type SqlWorkerResponse = {
  id: number;
  results?: unknown;
  error?: string;
};

/**
 * Hook for interacting with SQLite through a Web Worker
 */
export function useSqliteWorker() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messageId, setMessageId] = useState(0);
  const [callbacks, setCallbacks] = useState<Map<number, (result: unknown, error?: string) => void>>(new Map());

  // Initialize the SQLite worker
  useEffect(() => {
    const sqlWorker = new Worker(new URL('./sqlWorker.js', import.meta.url), { type: 'module' });

    sqlWorker.onmessage = (event: MessageEvent<SqlWorkerResponse>) => {
      const { id, results, error } = event.data;
      const callback = callbacks.get(id);

      if (callback) {
        callback(results, error);
        const newCallbacks = new Map(callbacks);
        newCallbacks.delete(id);
        setCallbacks(newCallbacks);
      }
    };

    sqlWorker.onerror = (error) => {
      setError(new Error(`Worker error: ${error.message}`));
      console.error('SQL worker error:', error);
    };

    setWorker(sqlWorker);

    // Initialize SQL.js in the worker
    const newId = messageId + 1;
    setMessageId(newId);

    const initCallback = (result: unknown, error?: string) => {
      if (error) {
        setError(new Error(`Failed to initialize SQLite: ${error}`));
        return;
      }
      setIsInitialized(true);
    };

    const newCallbacks = new Map(callbacks);
    newCallbacks.set(newId, initCallback);
    setCallbacks(newCallbacks);

    sqlWorker.postMessage({
      id: newId,
      action: 'init',
      data: {
        // Use the official UMD build of SQL.js
        scriptUrl: 'https://github.com/sql-js/sql.js/releases/download/1.8.0/sql-wasm.js',
        wasmUrl: 'https://github.com/sql-js/sql.js/releases/download/1.8.0/sql-wasm.wasm',
      },
    });

    return () => {
      sqlWorker.terminate();
    };
  }, [messageId, callbacks]);

  // Helper to send a message to the worker and wait for a response
  const sendMessage = useCallback(
    <T>(action: string, data?: Record<string, unknown>): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!worker) {
          reject(new Error('Worker not initialized'));
          return;
        }

        if (!isInitialized && action !== 'init') {
          reject(new Error('SQLite not initialized'));
          return;
        }

        const id = messageId + 1;
        setMessageId(id);

        const callback = (result: unknown, error?: string) => {
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result as T);
          }
        };

        const newCallbacks = new Map(callbacks);
        newCallbacks.set(id, callback);
        setCallbacks(newCallbacks);

        worker.postMessage({
          id,
          action,
          data,
        });
      });
    },
    [worker, isInitialized, messageId, callbacks]
  );

  // Create a new in-memory database
  const createDatabase = useCallback(async () => {
    return sendMessage<void>('createDatabase');
  }, [sendMessage]);

  // Load database from an array buffer
  const loadDatabase = useCallback(
    async (buffer: ArrayBuffer) => {
      return sendMessage<void>('loadDatabase', { buffer });
    },
    [sendMessage]
  );

  // Execute a SQL query without parameters
  const exec = useCallback(
    async (sql: string) => {
      return sendMessage<Array<{ columns: string[]; values: unknown[][] }>>('exec', { sql });
    },
    [sendMessage]
  );

  // Execute a SQL query with parameters
  const run = useCallback(
    async (sql: string, params?: unknown[]) => {
      return sendMessage<void>('run', { sql, params });
    },
    [sendMessage]
  );

  // Get all rows from a SQL query
  const all = useCallback(
    async <T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]> => {
      return sendMessage<T[]>('all', { sql, params });
    },
    [sendMessage]
  );

  // Get a single row from a SQL query
  const get = useCallback(
    async <T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null> => {
      return sendMessage<T | null>('get', { sql, params });
    },
    [sendMessage]
  );

  // Export the database to an array buffer
  const exportDatabase = useCallback(async () => {
    return sendMessage<ArrayBuffer>('exportDatabase');
  }, [sendMessage]);

  // Check if a table exists
  const tableExists = useCallback(
    async (tableName: string): Promise<boolean> => {
      const result = await get<{ count: number }>(
        `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName]
      );
      return result ? result.count > 0 : false;
    },
    [get]
  );

  return {
    isInitialized,
    error,
    createDatabase,
    loadDatabase,
    exec,
    run,
    all,
    get,
    exportDatabase,
    tableExists,
  };
}

// Export types for use in other files
export type { SqlJsConfig, Database, Statement, SqlJsStatic };
