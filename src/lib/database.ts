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

class SQLiteDatabase {
  private db: Database | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initialize();
    return this.initPromise;
  }
  private async _initialize(): Promise<void> {
    try {
      console.log('Initializing SQLite database...');
      
      // Initialize sql.js with timeout to prevent blocking
      const initPromise = initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('SQL.js initialization timeout')), 10000)
      );
      
      const SQL = await Promise.race([initPromise, timeoutPromise]);

      // Try to load existing database from localStorage
      const savedDb = localStorage.getItem('inkwell-db');
      let data: Uint8Array | undefined = undefined;

      if (savedDb) {
        try {
          data = new Uint8Array(JSON.parse(savedDb));
        } catch (error) {
          console.warn('Failed to load saved database, creating new one:', error);
        }
      }

      // Create or load database
      this.db = new SQL.Database(data);

      // Create tables and indexes
      await this.createTables();
      await this.createIndexes();

      // Insert default settings if this is a new database
      if (!savedDb) {
        await this.insertDefaultSettings();
      }

      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    Object.values(DB_SCHEMA).forEach(schema => {
      this.db!.run(schema);
    });
  }

  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    DB_INDEXES.forEach(index => {
      this.db!.run(index);
    });
  }

  private async insertDefaultSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const defaultSettings = [
      // App settings
      { key: 'theme', value: 'system', category: 'appearance' },
      { key: 'auto_save', value: 'true', category: 'editor' },
      { key: 'auto_save_interval', value: '30000', category: 'editor' },
      { key: 'font_family', value: 'Inter', category: 'appearance' },
      { key: 'font_size', value: '14', category: 'appearance' },
      { key: 'editor_theme', value: 'default', category: 'editor' },
      
      // AI settings
      { key: 'default_ai_provider', value: 'OpenAI', category: 'ai' },
      { key: 'ai_cache_enabled', value: 'true', category: 'ai' },
      { key: 'ai_cache_expiry', value: '3600000', category: 'ai' },
      
      // Privacy settings
      { key: 'analytics_enabled', value: 'false', category: 'privacy' },
      { key: 'crash_reporting', value: 'false', category: 'privacy' }
    ];

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO settings (key, value, category) 
      VALUES (?, ?, ?)
    `);

    defaultSettings.forEach(setting => {
      stmt.run([setting.key, setting.value, setting.category]);
    });

    stmt.free();
  }

  async saveToStorage(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const data = this.db.export();
      localStorage.setItem('inkwell-db', JSON.stringify(Array.from(data)));
    } catch (error) {
      console.error('Failed to save database to localStorage:', error);
    }
  }

  async getSetting(key: string): Promise<string | null> {
    await this.initialize();
    if (!this.db) return null;

    try {
      const stmt = this.db.prepare('SELECT value FROM settings WHERE key = ?');
      const result = stmt.getAsObject([key]);
      stmt.free();
      
      return result.value as string || null;
    } catch (error) {
      console.error(`Failed to get setting ${key}:`, error);
      return null;
    }
  }

  async setSetting(key: string, value: string, category: string = 'general'): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, category, updated_at) 
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run([key, value, category]);
      stmt.free();
      
      await this.saveToStorage();
    } catch (error) {
      console.error(`Failed to set setting ${key}:`, error);
      throw error;
    }
  }  async getSettingsByCategory(category: string): Promise<Array<{key: string, value: string}>> {
    await this.initialize();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare('SELECT key, value FROM settings WHERE category = ? ORDER BY key');
      stmt.bind([category]);
      const results: Array<{key: string, value: string}> = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          key: row.key as string,
          value: row.value as string
        });
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error(`Failed to get settings for category ${category}:`, error);
      return [];
    }
  }
  async getAllSettings(): Promise<Array<{key: string, value: string, category: string}>> {
    await this.initialize();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare('SELECT key, value, category FROM settings ORDER BY category, key');
      const results: Array<{key: string, value: string, category: string}> = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          key: row.key as string,
          value: row.value as string,
          category: row.category as string
        });
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Failed to get all settings:', error);
      return [];
    }
  }

  async deleteSetting(key: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare('DELETE FROM settings WHERE key = ?');
      stmt.run([key]);
      stmt.free();
      
      await this.saveToStorage();
    } catch (error) {
      console.error(`Failed to delete setting ${key}:`, error);
      throw error;
    }
  }

  // AI Provider methods
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
    if (!this.db) throw new Error('Database not initialized');

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ai_providers 
        (name, api_key, endpoint, model, is_active, is_local, configuration, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      
      stmt.run([
        provider.name,
        provider.api_key || null,
        provider.endpoint || null,
        provider.model || null,
        provider.is_active ? 1 : 0,
        provider.is_local ? 1 : 0,
        provider.configuration ? JSON.stringify(provider.configuration) : null
      ]);
      
      stmt.free();
      await this.saveToStorage();
    } catch (error) {
      console.error('Failed to save AI provider:', error);
      throw error;
    }
  }
  async getAIProviders(): Promise<Array<any>> {
    await this.initialize();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare(`
        SELECT name, api_key, endpoint, model, is_active, is_local, configuration 
        FROM ai_providers ORDER BY name
      `);
      const results: Array<any> = [];
      
      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push({
          name: row.name as string,
          api_key: row.api_key as string || undefined,
          endpoint: row.endpoint as string || undefined,
          model: row.model as string || undefined,
          is_active: Boolean(row.is_active),
          is_local: Boolean(row.is_local),
          configuration: row.configuration ? JSON.parse(row.configuration as string) : undefined
        });
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Failed to get AI providers:', error);
      return [];
    }
  }
  // Generic query method for advanced usage
  async query(sql: string, params: any[] = []): Promise<any[]> {
    await this.initialize();
    if (!this.db) return [];

    try {
      const stmt = this.db.prepare(sql);
      const results: any[] = [];
      
      // Bind parameters if provided
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const database = new SQLiteDatabase();
export default database;
