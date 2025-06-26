import * as sqlWasm from 'sql.js';
import type { Database } from 'sql.js';

const initSqlJs = sqlWasm.default || sqlWasm;

// Database schema definitions
export const DB_SCHEMA = {
  SETTINGS: `
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
  USER_PREFERENCES: `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      preference_key TEXT UNIQUE NOT NULL,
      preference_value TEXT NOT NULL,
      data_type TEXT NOT NULL DEFAULT 'string',
      description TEXT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );
  `,
  APP_STATE: `
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_key TEXT UNIQUE NOT NULL,
      state_value TEXT NOT NULL,
      expires_at DATETIME,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `
};

// Database indexes for better performance
export const DB_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);',
  'CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);',
  'CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);',
  'CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);',
  'CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);',
  'CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);',
  'CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);',
  'CREATE INDEX IF NOT EXISTS idx_app_state_key ON app_state(state_key);'
];

// --- Web Worker Setup ---
const DB_WORKER_PATH = new URL('./database.worker.ts', import.meta.url);

// Define the allowed actions for the worker
export type WorkerAction =
  | 'init'
  | 'run'
  | 'exec'
  | 'export';

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
  // Placeholder: implement schema migrations here if needed in the future
  // Example: ALTER TABLE, add columns, etc.
  // Log migration steps
  console.log('[DB] Schema migration check (no migrations applied)');
}

// Utility to sanitize user input (basic XSS/injection protection)
function sanitizeInput(input: string): string {
  // Remove script tags and encode special characters
  return input.replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/[<>"'`]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c] || c));
}

// Utility to sanitize strings for database/storage (remove dangerous characters, trim, limit length)
function sanitizeString(input: string | undefined | null): string {
  if (!input) return '';
  // Remove dangerous characters, trim, and limit length
  return input.replace(/[<>"'`\\]/g, '').trim().slice(0, 256);
}

// Optionally, simple obfuscation for API keys (not strong encryption, just for browser storage)
function obfuscate(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}
function deobfuscate(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

export class SQLiteDatabase {
  private worker: Worker;
  private requestId = 0;
  private pending: Map<number, { resolve: (v: WorkerResult) => void; reject: (e: Error) => void }> = new Map();
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.worker = new Worker(DB_WORKER_PATH, { type: 'classic' });
    this.worker.onmessage = (event: MessageEvent) => {
      const { id, result, error } = event.data as WorkerResponse;
      const pending = this.pending.get(id);
      if (!pending) return;
      if (error) pending.reject(new Error(error));
      else pending.resolve(result as WorkerResult);
      this.pending.delete(id);
    };
  }

  // --- Improved error handling for worker communication ---
  private callWorker<T extends WorkerResult>(action: WorkerAction, args?: WorkerRequestArgs): Promise<T> {
    const id = ++this.requestId;
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`[DB] Worker response timeout for action: ${action}`));
      }, 10000); // 10s timeout
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
      this.worker.postMessage({ id, action, args });
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = (async () => {
      // Load DB from localStorage if present
      const savedDb = localStorage.getItem('inkwell-db');
      let data: Uint8Array | undefined = undefined;
      if (savedDb) {
        try {
          data = new Uint8Array(JSON.parse(savedDb));
        } catch (error) {
          console.warn('Failed to load saved database, creating new one:', error);
        }
      }
      await this.callWorker<void>('init', { data });
      // Create tables and indexes
      for (const schema of Object.values(DB_SCHEMA)) {
        await this.callWorker<void>('run', { sql: schema });
      }
      for (const index of DB_INDEXES) {
        await this.callWorker<void>('run', { sql: index });
      }
      // --- Schema migration step ---
      await migrateSchema(this);
      // Insert default settings if new DB
      if (!savedDb) {
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
            sql: `INSERT OR REPLACE INTO settings (key, value, category) VALUES (?, ?, ?)` ,
            params: [setting.key, setting.value, setting.category]
          });
        }
      }
      this.isInitialized = true;
      console.log('[DB] Database initialized');
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

  async getSetting(key: string): Promise<string | null> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: 'SELECT value FROM settings WHERE key = ?',
      params: [key]
    });
    if (rows[0] && rows[0].values[0]) return rows[0].values[0][0] as string;
    return null;
  }

  async setSetting(key: string, value: string, category: string = 'general'): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO settings (key, value, category, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [key, value, category]
    });
    await this.saveToStorage();
  }

  async getSettingsByCategory(category: string): Promise<Array<{ key: string; value: string }>> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: 'SELECT key, value FROM settings WHERE category = ? ORDER BY key',
      params: [category]
    });
    const results: Array<{ key: string; value: string }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        results.push({ key: row[0] as string, value: row[1] as string });
      }
    }
    return results;
  }

  async getAllSettings(): Promise<Array<{ key: string; value: string; category: string }>> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: 'SELECT key, value, category FROM settings ORDER BY category, key'
    });
    const results: Array<{ key: string; value: string; category: string }> = [];
    if (rows[0]) {
      for (const row of rows[0].values) {
        results.push({ key: row[0] as string, value: row[1] as string, category: row[2] as string });
      }
    }
    return results;
  }

  async deleteSetting(key: string): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: 'DELETE FROM settings WHERE key = ?',
      params: [key]
    });
    await this.saveToStorage();
  }

  // --- App State Methods ---
  async setAppState(key: string, value: string, expiresAt?: string): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO app_state (state_key, state_value, expires_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [key, value, expiresAt || null]
    });
    this.debouncedSave();
  }

  async getAppState(key: string): Promise<string | null> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: 'SELECT state_value FROM app_state WHERE state_key = ?',
      params: [key]
    });
    if (rows[0] && rows[0].values[0]) return rows[0].values[0][0] as string;
    return null;
  }

  async deleteAppState(key: string): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: 'DELETE FROM app_state WHERE state_key = ?',
      params: [key]
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
  }): Promise<void> {
    await this.initialize();
    if (provider.configuration && !isValidJSON(provider.configuration)) {
      throw new Error('Invalid JSON for AI provider configuration');
    }
    // Sanitize user input
    const name = sanitizeInput(provider.name);
    const endpoint = sanitizeInput(provider.endpoint ?? '');
    const model = sanitizeInput(provider.model ?? '');
    const api_key = provider.api_key ? obfuscate(provider.api_key) : null;
    await this.callWorker<void>('run', {
      sql: `INSERT OR REPLACE INTO ai_providers (name, api_key, endpoint, model, is_active, is_local, configuration, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      params: [
        name,
        api_key,
        endpoint,
        model,
        provider.is_active ? 1 : 0,
        provider.is_local ? 1 : 0,
        provider.configuration ? JSON.stringify(provider.configuration) : null
      ]
    });
    this.debouncedSave();
  }

  /**
   * Get the raw (deobfuscated) API key for a provider by ID.
   */
  async getAIProviderApiKey(id: number): Promise<string | null> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>("exec", {
      sql: "SELECT api_key FROM ai_providers WHERE id = ?",
      params: [id],
    });
    if (rows[0] && rows[0].values[0]) {
      const obf = rows[0].values[0][0] as string;
      return obf ? deobfuscate(obf) : null;
    }
    return null;
  }

  /**
   * Add a new project to the database.
   * @param project - The project object with name, description, and optional settings.
   * @returns The new project ID.
   * @throws Error if settings is not valid JSON or input is invalid.
   */
  async addProject(project: {
    name: string;
    description?: string;
    settings?: object;
  }): Promise<number> {
    await this.initialize();
    const name = sanitizeString(project.name);
    const description = sanitizeString(project.description);
    if (!name) throw new Error('Project name is required');
    if (project.settings && !isValidJSON(project.settings)) {
      throw new Error('Invalid JSON for project settings');
    }
    await this.callWorker<void>('run', {
      sql: `INSERT INTO projects (name, description, settings, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      params: [
        name,
        description,
        project.settings ? JSON.stringify(project.settings) : null
      ]
    });
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', { sql: 'SELECT last_insert_rowid() as id' });
    const id = rows[0]?.values[0]?.[0] as number;
    this.debouncedSave();
    return id;
  }

  /**
   * Add a new project template to the database.
   * @param template - The template object with name, description, genre, tone, structure, and template_json.
   * @returns The new template ID.
   * @throws Error if template_json is not valid JSON or input is invalid.
   */
  async addProjectTemplate(template: {
    name: string;
    description?: string;
    genre?: string;
    tone?: string;
    structure?: string;
    template_json: object;
  }): Promise<number> {
    await this.initialize();
    const name = sanitizeString(template.name);
    const description = sanitizeString(template.description);
    const genre = sanitizeString(template.genre);
    const tone = sanitizeString(template.tone);
    const structure = sanitizeString(template.structure);
    if (!name) throw new Error('Template name is required');
    if (!isValidJSON(template.template_json)) {
      throw new Error('Invalid JSON for project template');
    }
    await this.callWorker<void>('run', {
      sql: `INSERT INTO project_templates (name, description, genre, tone, structure, template_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      params: [
        name,
        description,
        genre,
        tone,
        structure,
        JSON.stringify(template.template_json)
      ]
    });
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', { sql: 'SELECT last_insert_rowid() as id' });
    const id = rows[0]?.values[0]?.[0] as number;
    this.debouncedSave();
    return id;
  }

  /**
   * Update a project template by ID.
   * @param id - The template ID.
   * @param updates - The fields to update.
   * @throws Error if template_json is not valid JSON or input is invalid.
   */
  async updateProjectTemplate(id: number, updates: { name?: string; description?: string; genre?: string; tone?: string; structure?: string; template_json?: object }): Promise<void> {
    await this.initialize();
    let templateJsonStr: string | null = null;
    if (updates.template_json !== undefined) {
      if (!isValidJSON(updates.template_json)) throw new Error('Invalid JSON for project template');
      templateJsonStr = JSON.stringify(updates.template_json);
    }
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
        'WHERE id = ?'
      ].join(' '),
      params: [
        updates.name !== undefined ? sanitizeString(updates.name) : null,
        updates.description !== undefined ? sanitizeString(updates.description) : null,
        updates.genre !== undefined ? sanitizeString(updates.genre) : null,
        updates.tone !== undefined ? sanitizeString(updates.tone) : null,
        updates.structure !== undefined ? sanitizeString(updates.structure) : null,
        templateJsonStr,
        id
      ]
    });
    this.debouncedSave();
  }

  /**
   * List all AI providers, masking API keys and parsing configuration as JSON.
   * @returns Array of AI providers with masked api_key and parsed configuration.
   */
  async listAIProviders(): Promise<Array<{
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
    const rows = await this.callWorker<SQLJsExecResult[]>("exec", {
      sql: "SELECT * FROM ai_providers ORDER BY is_active DESC, name ASC",
    });
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

  /**
   * Get all project templates from the database.
   * @returns Array of project templates.
   */
  async getProjectTemplates(): Promise<Array<{
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
    const rows = await this.callWorker<SQLJsExecResult[]>("exec", {
      sql: "SELECT id, name, description, genre, tone, structure, template_json, created_at, updated_at FROM project_templates ORDER BY name ASC",
    });
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

  /**
   * Delete an AI provider by ID.
   * @param id - The provider ID.
   */
  async deleteAIProvider(id: number): Promise<void> {
    await this.initialize();
    await this.callWorker<void>('run', {
      sql: 'DELETE FROM ai_providers WHERE id = ?',
      params: [id]
    });
    this.debouncedSave();
  }

  /**
   * Set the active AI provider by ID (sets is_active=1 for the given ID, 0 for all others).
   * @param id - The provider ID to set as active.
   */
  async setActiveAIProvider(id: number): Promise<void> {
    await this.initialize();
    // Set all to inactive, then set the chosen one to active
    await this.callWorker<void>('run', {
      sql: 'UPDATE ai_providers SET is_active = 0',
    });
    await this.callWorker<void>('run', {
      sql: 'UPDATE ai_providers SET is_active = 1 WHERE id = ?',
      params: [id]
    });
    this.debouncedSave();
  }

  /**
   * Get all projects from the database.
   */
  async getProjects(): Promise<Array<{
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    lastOpened: string | null;
  }>> {
    await this.initialize();
    const rows = await this.callWorker<SQLJsExecResult[]>('exec', {
      sql: 'SELECT id, name, description, created_at, updated_at, last_opened FROM projects ORDER BY updated_at DESC'
    });
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
    this.worker.terminate();
    this.isInitialized = false;
    this.initPromise = null;
  }
}

export const database = new SQLiteDatabase();
export default database;
