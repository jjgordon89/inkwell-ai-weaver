import * as sqlWasm from 'sql.js';
import type { Database } from 'sql.js';

// Database schema definitions with additional constraints
export const DB_SCHEMA = {
  SETTINGS: `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      CHECK (category IN ('general', 'appearance', 'editor', 'ai', 'privacy'))
    );
  `,
  USER_PREFERENCES: `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      preference_key TEXT UNIQUE NOT NULL,
      preference_value TEXT NOT NULL,
      data_type TEXT NOT NULL DEFAULT 'string',
      description TEXT,
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  AI_PROVIDERS: `
    CREATE TABLE IF NOT EXISTS ai_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      api_key TEXT,
      endpoint TEXT,
      model TEXT,
      is_active BOOLEAN DEFAULT 0,
      is_local BOOLEAN DEFAULT 0,
      configuration TEXT, -- JSON string for additional config
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  PROJECTS: `
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      settings TEXT, -- JSON string for project-specific settings
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_opened DATETIME
    );
  `,
  PROJECT_FILES: `
    CREATE TABLE IF NOT EXISTS project_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      content TEXT,
      file_type TEXT DEFAULT 'text',
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `,
  APP_STATE: `
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_key TEXT UNIQUE NOT NULL,
      state_value TEXT NOT NULL,
      expires_at DATETIME,
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  PROJECT_TEMPLATES: `
    CREATE TABLE IF NOT EXISTS project_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      genre TEXT,
      tone TEXT,
      structure TEXT,
      template_json TEXT NOT NULL, -- JSON string for template content
      user_id TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `
};

// Database indexes for better performance
export const DB_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);',
  'CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);',
  'CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);',
  'CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);',
  'CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);',
  'CREATE INDEX IF NOT EXISTS idx_ai_providers_user_id ON ai_providers(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);',
  'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);',
  'CREATE INDEX IF NOT EXISTS idx_project_files_user_id ON project_files(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_app_state_key ON app_state(state_key);',
  'CREATE INDEX IF NOT EXISTS idx_app_state_user_id ON app_state(user_id);',
  'CREATE INDEX IF NOT EXISTS idx_project_templates_name ON project_templates(name);',
  'CREATE INDEX IF NOT EXISTS idx_project_templates_user_id ON project_templates(user_id);'
];

// --- Web Worker Setup ---
const DB_WORKER_PATH = new URL('./database.worker.ts', import.meta.url);

// Define the allowed actions for the worker
export type WorkerAction =
  | 'init'
  | 'run'
  | 'exec'
  | 'export'
  | 'close';

// Define the argument types for each action
export interface WorkerRequestInitArgs {
  data?: Uint8Array;
}
export interface WorkerRequestRunArgs {
  sql: string;
  params?: (string | number | null)[];
}
export interface WorkerRequestExecArgs {
  sql: string;
  params?: (string | number | null)[];
}
export type WorkerRequestArgs = WorkerRequestInitArgs | WorkerRequestRunArgs | WorkerRequestExecArgs | undefined;

export interface WorkerRequest {
  id: number;
  action: WorkerAction;
  args?: WorkerRequestArgs;
}

// SQL.js result type
export interface SQLJsExecResult {
  columns: string[];
  values: (string | number | null)[][];
}

export interface WorkerResponse {
  id: number;
  result?: SQLJsExecResult[] | Uint8Array | void;
  error?: string;
}

// Define a union type for all possible worker results
export type WorkerResult = SQLJsExecResult[] | Uint8Array | void;

function isValidJSON(obj: unknown): boolean {
  try {
    JSON.stringify(obj);
    return true;
  } catch {
    return false;
  }
}

// Utility functions
function sanitizeInput(input: string): string {
  return input.replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/[<>"'`]/g, c => ({
      '<': '<',
      '>': '>',
      '"': '"',
      "'": "\\'",
      '`': '&#96;'
    }[c] || c));
}

function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  return input.replace(/[<>"'`\\]/g, '').trim().slice(0, 256);
}

// --- Debounced/Batched Save Logic ---
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 1500;
let pendingSave = false;

function debouncedSaveToStorage(db: SQLiteDatabase) {
  if (saveTimeout) clearTimeout(saveTimeout);
  pendingSave = true;
  saveTimeout = setTimeout(async () => {
    pendingSave = false;
    await db.saveToStorage();
    console.log('[DB] Debounced saveToStorage executed');
  }, SAVE_DEBOUNCE_MS);
}

// --- Schema Migration Placeholder ---
async function migrateSchema(db: SQLiteDatabase) {
  // Check for existing tables and migrate if needed
  const tables = await db.callWorker<SQLJsExecResult[]>('exec', {
    sql: "SELECT name FROM sqlite_master WHERE type='table'"
  });

  const expectedTables = Object.keys(DB_SCHEMA);
  for (const table of expectedTables) {
    if (!tables[0]?.values.some(row => row[0] === table)) {
      console.log(`[DB] Creating missing table: ${table}`);
      await db.callWorker<void>('run', { sql: DB_SCHEMA[table as keyof typeof DB_SCHEMA] });
    }
  }

  // Check for missing indexes
  const indexes = await db.callWorker<SQLJsExecResult[]>('exec', {
    sql: "SELECT name FROM sqlite_master WHERE type='index'"
  });

  for (const index of DB_INDEXES) {
    const indexName = index.split(' ')[3];
    if (!indexes[0]?.values.some(row => row[0] === indexName)) {
      console.log(`[DB] Creating missing index: ${indexName}`);
      await db.callWorker<void>('run', { sql: index });
    }
  }

  // Add user_id column to tables if missing
  const tablesWithUserId = ['settings', 'user_preferences', 'ai_providers', 'projects', 'project_files', 'app_state', 'project_templates'];
  for (const table of tablesWithUserId) {
    const columns = await db.callWorker<SQLJsExecResult[]>('exec', {
      sql: `PRAGMA table_info(${table})`
    });

    if (!columns[0]?.values.some(row => row[1] === 'user_id')) {
      console.log(`[DB] Adding user_id column to ${table}`);
      await db.callWorker<void>('run', {
        sql: `ALTER TABLE ${table} ADD COLUMN user_id TEXT DEFAULT 'default'`
      });
    }
  }

  console.log('[DB] Schema migration completed');
}

export class SQLiteDatabase {
  private worker: Worker | null = null;
  private requestId = 0;
  private pending: Map<number, { resolve: (v: WorkerResult) => void; reject: (e: Error) => void }> = new Map();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;
  private maxRetries = 3;
  private retryCount = 0;
  private queryCache = new Map<string, { result: SQLJsExecResult[]; expiresAt: number }>();

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      this.worker = new Worker(DB_WORKER_PATH, { type: 'module' });

      this.worker.onmessage = (event: MessageEvent) => {
        const { id, result, error } = event.data as WorkerResponse;
        const pending = this.pending.get(id);
        if (!pending) return;

        if (error) {
          console.error('[DB] Worker error for request', id, ':', error);
          pending.reject(new Error(error));
        } else {
          pending.resolve(result as WorkerResult);
        }
        this.pending.delete(id);
      };

      this.worker.onerror = (error) => {
        console.error('[DB] Worker error:', error);
        // Try to recreate worker on error
        this.recreateWorker();
      };

      console.log('[DB] Worker initialized');
    } catch (error) {
      console.error('[DB] Failed to initialize worker:', error);
      this.worker = null;
    }
  }

  private recreateWorker() {
    console.log('[DB] Recreating worker due to error...');
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Clear pending requests with error
    this.pending.forEach(({ reject }) => {
      reject(new Error('Worker terminated and recreated'));
    });
    this.pending.clear();

    // Reinitialize
    this.initializeWorker();
    this.isInitialized = false;
    this.initPromise = null;
  }

  // Improved worker communication with better timeout and retry logic
  public async callWorker<T extends WorkerResult>(action: WorkerAction, args?: WorkerRequestArgs): Promise<T> {
    if (!this.worker) {
      return Promise.reject(new Error('[DB] Worker not available'));
    }

    const id = ++this.requestId;
    return new Promise<T>((resolve, reject) => {
      // Shorter timeout for initialization, longer for other operations
      const timeoutMs = action === 'init' ? 20000 : 10000;

      const timeout = setTimeout(() => {
        this.pending.delete(id);
        console.error(`[DB] Worker timeout for action: ${action} (${timeoutMs}ms)`);

        // If it's an init timeout, try to recreate the worker
        if (action === 'init') {
          this.recreateWorker();
        }

        reject(new Error(`[DB] Worker response timeout for action: ${action}`));
      }, timeoutMs);

      this.pending.set(id, {
        resolve: (v: WorkerResult) => {
          clearTimeout(timeout);
          resolve(v as T);
        },
        reject: (e: Error) => {
          clearTimeout(timeout);
          reject(e);
        }
      });

      try {
        this.worker!.postMessage({ id, action, args });
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(id);
        reject(new Error(`[DB] Failed to send message to worker: ${error}`));
      }
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      while (this.retryCount < this.maxRetries) {
        try {
          console.log(`[DB] Starting database initialization (attempt ${this.retryCount + 1}/${this.maxRetries})...`);

          // Load DB from localStorage if present
          const savedDb = localStorage.getItem('inkwell-db');
          let data: Uint8Array | undefined = undefined;

          if (savedDb) {
            try {
              data = new Uint8Array(JSON.parse(savedDb));
              console.log('[DB] Loaded existing database from localStorage');
            } catch (error) {
              console.warn('[DB] Failed to load saved database, creating new one:', error);
            }
          }

          // Initialize the worker database
          await this.callWorker<void>('init', { data });
          console.log('[DB] Worker database initialized');

          // Create tables and indexes
          for (const [name, schema] of Object.entries(DB_SCHEMA)) {
            try {
              await this.callWorker<void>('run', { sql: schema });
              console.log(`[DB] Created table: ${name}`);
            } catch (error) {
              console.error(`[DB] Failed to create table ${name}:`, error);
              throw error;
            }
          }

          for (const index of DB_INDEXES) {
            try {
              await this.callWorker<void>('run', { sql: index });
            } catch (error) {
              console.error('[DB] Failed to create index:', error);
              // Don't throw for index creation failures
            }
          }

          // Schema migration
          await migrateSchema(this);

          // Insert default settings if new DB
          if (!savedDb) {
            console.log('[DB] Inserting default settings...');
            const defaultSettings = [
              { key: 'theme', value: 'system', category: 'appearance' },
              { key: 'auto_save', value: 'true', category: 'editor' },
              { key: 'auto_save_interval', value: '30000', category: 'editor' },
              { key: 'font_family', value: 'Inter', category: 'appearance' },
              { key: 'font_size', value: '14', category: 'appearance' },
              { key: 'editor_theme', value: 'default', category: 'editor' },
              { key: 'default_ai_provider', value: 'OpenAI', category: 'ai' },
              { key: 'ai_cache_enabled', value: 'true', category: 'ai' },
              { key: 'ai_cache_expiry', value: '3600000', category: 'ai' },
              { key: 'analytics_enabled', value: 'false', category: 'privacy' },
              { key: 'crash_reporting', value: 'false', category: 'privacy' }
            ];

            for (const setting of defaultSettings) {
              await this.callWorker<void>('run', {
                sql: `INSERT OR REPLACE INTO settings (key, value, category) VALUES (?, ?, ?)`,
                params: [setting.key, setting.value, setting.category]
              });
            }
            console.log('[DB] Default settings inserted');
          }

          this.isInitialized = true;
          this.retryCount = 0; // Reset retry count on success
          console.log('[DB] Database initialization completed successfully');
          return;

        } catch (error) {
          this.retryCount++;
          console.error(`[DB] Database initialization failed (attempt ${this.retryCount}/${this.maxRetries}):`, error);

          if (this.retryCount >= this.maxRetries) {
            this.isInitialized = false;
            this.initPromise = null;
            throw new Error(`Database initialization failed after ${this.maxRetries} attempts: ${(error as Error)?.message}`);
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        }
      }
    })();

    return this.initPromise;
  }

  async saveToStorage(): Promise<void> {
    try {
      const data = await this.callWorker<Uint8Array>('export');
      localStorage.setItem('inkwell-db', JSON.stringify(Array.from(data)));
      console.log('[DB] saveToStorage completed');
    } catch (error) {
      console.error('[DB] saveToStorage failed:', error);
    }
  }

  // --- Debounced Save Wrapper ---
  debouncedSave() {
    debouncedSaveToStorage(this);
  }

  // --- Query Caching ---
  private logQuery(sql: string, params?: (string | number | null)[]): void {
    console.log('[DB Query]', sql, params);
  }

  async cachedExec(sql: string, params?: (string | number | null)[]): Promise<SQLJsExecResult[]> {
    const cacheKey = `${sql}-${params?.join(',')}`;
    const cached = this.queryCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const result = await this.callWorker<SQLJsExecResult[]>('exec', { sql, params });
    this.queryCache.set(cacheKey, { result, expiresAt: Date.now() + 30000 }); // 30s cache
    return result;
  }

  // --- Batch Operations ---
  async batchExec(queries: Array<{ sql: string; params?: (string | number | null)[] }>): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: queries.map(q => q.sql).join(';'),
      params: queries.flatMap(q => q.params || [])
    });
    this.debouncedSave();
  }

  // --- Database Health Checks ---
  async checkDatabaseHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check table existence
    const tables = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: "SELECT name FROM sqlite_master WHERE type='table'"
    });

    const expectedTables = Object.keys(DB_SCHEMA);
    for (const table of expectedTables) {
      if (!tables[0]?.values.some(row => row[0] === table)) {
        issues.push(`Missing table: ${table}`);
      }
    }

    // Check index existence
    const indexes = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: "SELECT name FROM sqlite_master WHERE type='index'"
    });

    for (const index of DB_INDEXES) {
      const indexName = index.split(' ')[3];
      if (!indexes[0]?.values.some(row => row[0] === indexName)) {
        issues.push(`Missing index: ${indexName}`);
      }
    }

    // Check foreign key constraints
    const foreignKeys = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: "PRAGMA foreign_key_list('project_files')"
    });

    if (!foreignKeys[0]?.values.some(row => row[1] === 'projects' && row[2] === 'id')) {
      issues.push('Missing foreign key constraint on project_files.project_id');
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // --- Database Statistics ---
  async getDatabaseStats(): Promise<{
    size: number;
    tableCounts: Record<string, number>;
    indexCounts: Record<string, number>;
  }> {
    const size = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: "SELECT page_count * page_size AS size FROM pragma_page_count(), pragma_page_size()"
    });

    const tables = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: "SELECT name, (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=t.name) AS count FROM sqlite_master t WHERE type='table'"
    });

    const indexes = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: "SELECT name, (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name=i.name) AS count FROM sqlite_master i WHERE type='index'"
    });

    return {
      size: size[0]?.values[0]?.[0] as number || 0,
      tableCounts: tables[0]?.values.reduce((acc, row) => {
        acc[row[0] as string] = row[1] as number;
        return acc;
      }, {} as Record<string, number>) || {},
      indexCounts: indexes[0]?.values.reduce((acc, row) => {
        acc[row[0] as string] = row[1] as number;
        return acc;
      }, {} as Record<string, number>) || {}
    };
  }

  // --- Security Enhancements ---
  private encrypt(value: string): string {
    // Implement encryption logic
    return value; // Placeholder
  }

  private decrypt(value: string): string {
    // Implement decryption logic
    return value; // Placeholder
  }

  async setEncryptedSetting(key: string, value: string, category: string = 'general', userId: string = 'default'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO settings (key, value, category, user_id, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [key, this.encrypt(value), category, userId]
    });
    await this.saveToStorage();
  }

  async getEncryptedSetting(key: string, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: 'SELECT value FROM settings WHERE key = ? AND user_id = ?',
      params: [key, userId]
    });
    return rows[0]?.values[0]?.[0] ? this.decrypt(rows[0].values[0][0] as string) : null;
  }

  // --- Settings Methods ---
  async getSetting(key: string, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const rows = await this.cachedExec('SELECT value FROM settings WHERE key = ? AND user_id = ?', [key, userId]);
    if (rows[0] && rows[0].values[0]) return rows[0].values[0][0] as string;
    return null;
  }

  async setSetting(key: string, value: string, category: string = 'general', userId: string = 'default'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO settings (key, value, category, user_id, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [key, value, category, userId]
    });
    this.debouncedSave();
  }

  async getSettingsByCategory(category: string, userId: string = 'default'): Promise<Array<{ key: string; value: string }>> {
    await this.initialize();
    const rows = await this.cachedExec('SELECT key, value FROM settings WHERE category = ? AND user_id = ? ORDER BY key', [category, userId]);
    const results: Array<{ key: string; value: string }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        results.push({ key: row[0] as string, value: row[1] as string });
      }
    }
    return results;
  }

  async getAllSettings(userId: string = 'default'): Promise<Array<{ key: string; value: string; category: string }>> {
    await this.initialize();
    const rows = await this.cachedExec('SELECT key, value, category FROM settings WHERE user_id = ? ORDER BY category, key', [userId]);
    const results: Array<{ key: string; value: string; category: string }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        results.push({ key: row[0] as string, value: row[1] as string, category: row[2] as string });
      }
    }
    return results;
  }

  async deleteSetting(key: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: 'DELETE FROM settings WHERE key = ? AND user_id = ?',
      params: [key, userId]
    });
    this.debouncedSave();
  }

  // --- App State Methods ---
  async setAppState(key: string, value: string, expiresAt?: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO app_state (state_key, state_value, expires_at, user_id, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [key, value, expiresAt || null, userId]
    });
    this.debouncedSave();
  }

  async getAppState(key: string, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const rows = await this.cachedExec('SELECT state_value FROM app_state WHERE state_key = ? AND user_id = ?', [key, userId]);
    if (rows[0] && rows[0].values[0]) return rows[0].values[0][0] as string;
    return null;
  }

  async deleteAppState(key: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: 'DELETE FROM app_state WHERE state_key = ? AND user_id = ?',
      params: [key, userId]
    });
    this.debouncedSave();
  }

  // --- AI Provider JSON validation ---
  async saveAIProvider(provider: {
    name: string;
    api_key?: string;
    endpoint?: string;
    model?: string;
    is_active?: boolean;
    is_local?: boolean;
    configuration?: object;
    userId?: string;
  }): Promise<void> {
    await this.initialize();
    if (provider.configuration && !isValidJSON(provider.configuration)) {
      throw new Error('Invalid JSON for AI provider configuration');
    }
    // Sanitize user input
    const name = sanitizeInput(provider.name);
    const endpoint = sanitizeInput(provider.endpoint ?? '');
    const model = sanitizeInput(provider.model ?? '');
    const api_key = provider.api_key ? this.encrypt(provider.api_key) : null;
    const userId = provider.userId || 'default';
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO ai_providers (name, api_key, endpoint, model, is_active, is_local, configuration, user_id, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [
        name,
        api_key,
        endpoint,
        model,
        provider.is_active ? 1 : 0,
        provider.is_local ? 1 : 0,
        provider.configuration ? JSON.stringify(provider.configuration) : null,
        userId
      ]
    });
    this.debouncedSave();
  }

  /** Get the raw (deobfuscated) API key for a provider by ID. */
  async getAIProviderApiKey(id: number, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const rows = await this.cachedExec("SELECT api_key FROM ai_providers WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows[0] && rows[0].values[0]) {
      const obf = rows[0].values[0][0] as string;
      return obf ? this.decrypt(obf) : null;
    }
    return null;
  }

  /** Add a new project to the database. */
  async addProject(project: {
    name: string;
    description?: string;
    settings?: object;
    userId?: string;
  }): Promise<number> {
    await this.initialize();
    const name = sanitizeString(project.name);
    const description = sanitizeString(project.description);
    const userId = project.userId || 'default';
    if (!name) throw new Error('Project name is required');
    if (project.settings && !isValidJSON(project.settings)) {
      throw new Error('Invalid JSON for project settings');
    }
    await this.callWorker<void>('run', {
      sql: `INSERT INTO projects (name, description, settings, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      params: [
        name,
        description,
        project.settings ? JSON.stringify(project.settings) : null,
        userId
      ]
    });
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', { sql: 'SELECT last_insert_rowid() as id' });
    const id = rows[0]?.values[0]?.[0] as number;
    this.debouncedSave();
    return id;
  }

  /** Add a new project template to the database. */
  async addProjectTemplate(template: {
    name: string;
    description?: string;
    genre?: string;
    tone?: string;
    structure?: string;
    template_json: object;
    userId?: string;
  }): Promise<number> {
    await this.initialize();
    const name = sanitizeString(template.name);
    const description = sanitizeString(template.description);
    const genre = sanitizeString(template.genre);
    const tone = sanitizeString(template.tone);
    const structure = sanitizeString(template.structure);
    const userId = template.userId || 'default';
    if (!name) throw new Error('Template name is required');
    if (!isValidJSON(template.template_json)) {
      throw new Error('Invalid JSON for project template');
    }
    await this.callWorker<void>('run', {
      sql: `INSERT INTO project_templates (name, description, genre, tone, structure, template_json, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      params: [
        name,
        description,
        genre,
        tone,
        structure,
        JSON.stringify(template.template_json),
        userId
      ]
    });
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', { sql: 'SELECT last_insert_rowid() as id' });
    const id = rows[0]?.values[0]?.[0] as number;
    this.debouncedSave();
    return id;
  }

  /** Update a project template by ID. */
  async updateProjectTemplate(id: number, updates: {
    name?: string;
    description?: string;
    genre?: string;
    tone?: string;
    structure?: string;
    template_json?: object;
    userId?: string;
  }): Promise<void> {
    await this.initialize();
    let templateJsonStr: string | null = null;
    if (updates.template_json !== undefined) {
      if (!isValidJSON(updates.template_json)) throw new Error('Invalid JSON for project template');
      templateJsonStr = JSON.stringify(updates.template_json);
    }
    const userId = updates.userId || 'default';
    await this.callWorker<void>('run', {
      sql: [
        'UPDATE project_templates SET',
        'name = COALESCE(?, name),',
        'description = COALESCE(?, description),',
        'genre = COALESCE(?, genre),',
        'tone = COALESCE(?, tone),',
        'structure = COALESCE(?, structure),',
        'template_json = COALESCE(?, template_json),',
        'updated_at = CURRENT_TIMESTAMP',
        'WHERE id = ? AND user_id = ?'
      ].join(' '),
      params: [
        updates.name !== undefined ? sanitizeString(updates.name) : null,
        updates.description !== undefined ? sanitizeString(updates.description) : null,
        updates.genre !== undefined ? sanitizeString(updates.genre) : null,
        updates.tone !== undefined ? sanitizeString(updates.tone) : null,
        updates.structure !== undefined ? sanitizeString(updates.structure) : null,
        templateJsonStr,
        id,
        userId
      ]
    });
    this.debouncedSave();
  }

  /** List all AI providers, masking API keys and parsing configuration as JSON. */
  async listAIProviders(userId: string = 'default'): Promise<Array<{
    id: number;
    name: string;
    api_key: string; // masked
    endpoint: string;
    model: string;
    is_active: boolean;
    is_local: boolean;
    configuration: object | null;
  }>> {
    await this.initialize();
    const rows = await this.cachedExec("SELECT * FROM ai_providers WHERE user_id = ? ORDER BY is_active DESC, name ASC", [userId]);
    const results: Array<{
      id: number;
      name: string;
      api_key: string;
      endpoint: string;
      model: string;
      is_active: boolean;
      is_local: boolean;
      configuration: object | null;
    }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        const apiKey = row[2] as string;
        let maskedKey = '';
        if (apiKey && apiKey.length > 4) {
          maskedKey = apiKey.slice(0, 2) + '*'.repeat(apiKey.length - 4) + apiKey.slice(-2);
        } else if (apiKey) {
          maskedKey = '*'.repeat(apiKey.length);
        }
        let configObj: object | null = null;
        try {
          configObj = row[7] ? JSON.parse(row[7] as string) : null;
        } catch {
          configObj = null;
        }
        results.push({
          id: row[0] as number,
          name: row[1] as string,
          api_key: maskedKey,
          endpoint: row[3] as string,
          model: row[4] as string,
          is_active: !!row[5],
          is_local: !!row[6],
          configuration: configObj,
        });
      }
    }
    return results;
  }

  /** Get all project templates from the database. */
  async getProjectTemplates(userId: string = 'default'): Promise<Array<{
    id: number;
    name: string;
    description: string;
    genre: string;
    tone: string;
    structure: string;
    template_json: object;
    createdAt: string;
    updatedAt: string;
  }>> {
    await this.initialize();
    const rows = await this.cachedExec("SELECT id, name, description, genre, tone, structure, template_json, created_at, updated_at FROM project_templates WHERE user_id = ? ORDER BY name ASC", [userId]);
    const results: Array<{
      id: number;
      name: string;
      description: string;
      genre: string;
      tone: string;
      structure: string;
      template_json: object;
      createdAt: string;
      updatedAt: string;
    }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        let templateJson: object = {};
        try {
          templateJson = row[6] ? JSON.parse(row[6] as string) : {};
        } catch {
          templateJson = {};
        }
        results.push({
          id: row[0] as number,
          name: row[1] as string,
          description: row[2] as string,
          genre: row[3] as string,
          tone: row[4] as string,
          structure: row[5] as string,
          template_json: templateJson,
          createdAt: row[7] as string,
          updatedAt: row[8] as string,
        });
      }
    }
    return results;
  }

  /** Delete an AI provider by ID. */
  async deleteAIProvider(id: number, userId: string = 'default'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: 'DELETE FROM ai_providers WHERE id = ? AND user_id = ?',
      params: [id, userId]
    });
    this.debouncedSave();
  }

  /** Set the active AI provider by ID (sets is_active=1 for the given ID, 0 for all others). */
  async setActiveAIProvider(id: number, userId: string = 'default'): Promise<void> {
    await this.initialize();
    // Set all to inactive, then set the chosen one to active
    await this.callWorker<void>('run', {
      sql: 'UPDATE ai_providers SET is_active = 0 WHERE user_id = ?',
      params: [userId]
    });
    await this.callWorker<void>('run', {
      sql: 'UPDATE ai_providers SET is_active = 1 WHERE id = ? AND user_id = ?',
      params: [id, userId]
    });
    this.debouncedSave();
  }

  /** Get all projects from the database. */
  async getProjects(userId: string = 'default'): Promise<Array<{
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    lastOpened: string | null;
  }>> {
    await this.initialize();
    const rows = await this.cachedExec('SELECT id, name, description, created_at, updated_at, last_opened FROM projects WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    const results: Array<{
      id: number;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      lastOpened: string | null;
    }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        results.push({
          id: row[0] as number,
          name: row[1] as string,
          description: row[2] as string,
          createdAt: row[3] as string,
          updatedAt: row[4] as string,
          lastOpened: row[5] as string | null,
        });
      }
    }
    return results;
  }

  // --- Web Worker Setup ---
  close(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isInitialized = false;
    this.initPromise = null;
    this.retryCount = 0;
    console.log('[DB] Database connection closed');
  }
}

export const database = new SQLiteDatabase();
export default database;
