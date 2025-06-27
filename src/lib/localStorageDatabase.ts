import { sanitizeString } from '../utils/stringUtils';

// Type definitions for IndexedDB
interface IDBOpenDBEventTarget extends EventTarget {
  result: IDBDatabase;
}

export interface LocalStorageSchema {
  version: number;
  settings: Record<string, { value: string; category: string; user_id: string }>;
  userPreferences: Record<string, { value: string; dataType: string; description?: string; user_id: string }>;
  aiProviders: Record<string, {
    api_key?: string;
    endpoint?: string;
    model?: string;
    is_active: boolean;
    is_local: boolean;
    configuration?: object;
    user_id: string;
  }>;
  projects: Record<string, {
    name: string;
    description?: string;
    settings?: object;
    user_id: string;
    created_at: string;
    updated_at: string;
    last_opened?: string;
  }>;
  projectFiles: Record<string, {
    project_id: string;
    filename: string;
    content?: string;
    file_type: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  }>;
  appState: Record<string, {
    value: string;
    expires_at?: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  }>;
  projectTemplates: Record<string, {
    name: string;
    description?: string;
    genre?: string;
    tone?: string;
    structure?: string;
    template_json: object;
    user_id: string;
    created_at: string;
    updated_at: string;
  }>;
}

export interface ConflictResolutionOptions {
  strategy: 'last-write-wins' | 'client-wins' | 'server-wins' | 'merge';
  timestamp?: string;
}

export interface DataValidationSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  items?: DataValidationSchema;
  properties?: Record<string, DataValidationSchema>;
}

export const STORAGE_KEY = 'inkwell-local-storage-db';
export const CURRENT_VERSION = 1;
export const INDEXED_DB_NAME = 'inkwell-indexed-db';
export const INDEXED_DB_VERSION = 1;

export class LocalStorageDatabase {
  private data: LocalStorageSchema;
  private isInitialized = false;
  private indexedDB: IDBDatabase | null = null;

  constructor() {
    this.data = {
      version: CURRENT_VERSION,
      settings: {},
      userPreferences: {},
      aiProviders: {},
      projects: {},
      projectFiles: {},
      appState: {},
      projectTemplates: {}
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize IndexedDB
      await this.initializeIndexedDB();

      // Load from localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.version === CURRENT_VERSION) {
          this.data = parsedData;
        } else {
          // Handle schema migration
          this.data = await this.migrateSchema(parsedData);
        }
      } else {
        // Insert default settings
        await this.setSetting('theme', 'system', 'appearance', 'default');
        await this.setSetting('auto_save', 'true', 'editor', 'default');
        await this.setSetting('auto_save_interval', '30000', 'editor', 'default');
        await this.setSetting('font_family', 'Inter', 'appearance', 'default');
        await this.setSetting('font_size', '14', 'appearance', 'default');
        await this.setSetting('editor_theme', 'default', 'editor', 'default');
        await this.setSetting('default_ai_provider', 'OpenAI', 'ai', 'default');
        await this.setSetting('ai_cache_enabled', 'true', 'ai', 'default');
        await this.setSetting('ai_cache_expiry', '3600000', 'ai', 'default');
        await this.setSetting('analytics_enabled', 'false', 'privacy', 'default');
        await this.setSetting('crash_reporting', 'false', 'privacy', 'default');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[LocalStorageDB] Initialization failed:', error);
      throw error;
    }
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

      request.onupgradeneeded = (event: Event) => {
        const db = (event.target as IDBOpenDBEventTarget).result;
        // Create object stores
        db.createObjectStore('largeFiles', { keyPath: 'id' });
      };

      request.onsuccess = () => {
        this.indexedDB = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to initialize IndexedDB'));
      };
    });
  }

  private async migrateSchema(oldData: LocalStorageSchema): Promise<LocalStorageSchema> {
    // Implement schema migration logic here
    // This would handle converting from older versions to the current version
    console.log('[LocalStorageDB] Migrating schema from version', oldData.version, 'to', CURRENT_VERSION);

    // For now, just return a new empty schema
    return {
      version: CURRENT_VERSION,
      settings: {},
      userPreferences: {},
      aiProviders: {},
      projects: {},
      projectFiles: {},
      appState: {},
      projectTemplates: {}
    };
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('[LocalStorageDB] Failed to save to localStorage:', error);
    }
  }

  // Encryption/Decryption methods
  private encrypt(value: string): string {
    // Implement encryption logic
    // For now, just return the value as-is
    return value;
  }

  private decrypt(value: string): string {
    // Implement decryption logic
    // For now, just return the value as-is
    return value;
  }

  // Settings Methods
  async getSetting(key: string, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const setting = this.data.settings[`${userId}:${key}`];
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string, category: string = 'general', userId: string = 'default'): Promise<void> {
    await this.initialize();
    this.data.settings[`${userId}:${key}`] = { value: sanitizeString(value), category: sanitizeString(category), user_id: userId };
    this.saveToStorage();
  }

  async getSettingsByCategory(category: string, userId: string = 'default'): Promise<Array<{ key: string; value: string }>> {
    await this.initialize();
    return Object.entries(this.data.settings)
      .filter(([k, v]) => k.startsWith(`${userId}:`) && v.category === category)
      .map(([k, v]) => ({ key: k.split(':')[1], value: v.value }));
  }

  async getAllSettings(userId: string = 'default'): Promise<Array<{ key: string; value: string; category: string }>> {
    await this.initialize();
    return Object.entries(this.data.settings)
      .filter(([k]) => k.startsWith(`${userId}:`))
      .map(([k, v]) => ({ key: k.split(':')[1], value: v.value, category: v.category }));
  }

  async deleteSetting(key: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    delete this.data.settings[`${userId}:${key}`];
    this.saveToStorage();
  }

  // App State Methods
  async setAppState(key: string, value: string, expiresAt?: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    this.data.appState[`${userId}:${key}`] = {
      value,
      expires_at: expiresAt,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.saveToStorage();
  }

  async getAppState(key: string, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const state = this.data.appState[`${userId}:${key}`];
    return state ? state.value : null;
  }

  async deleteAppState(key: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    delete this.data.appState[`${userId}:${key}`];
    this.saveToStorage();
  }

  // AI Provider Methods
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
    const userId = provider.userId || 'default';
    this.data.aiProviders[`${userId}:${sanitizeString(provider.name)}`] = {
      api_key: provider.api_key ? this.encrypt(sanitizeString(provider.api_key)) : undefined,
      endpoint: provider.endpoint ? sanitizeString(provider.endpoint) : undefined,
      model: provider.model ? sanitizeString(provider.model) : undefined,
      is_active: !!provider.is_active,
      is_local: !!provider.is_local,
      configuration: provider.configuration,
      user_id: userId
    };
    this.saveToStorage();
  }

  async getAIProviderApiKey(name: string, userId: string = 'default'): Promise<string | null> {
    await this.initialize();
    const provider = this.data.aiProviders[`${userId}:${name}`];
    return provider?.api_key ? this.decrypt(provider.api_key) : null;
  }

  async listAIProviders(userId: string = 'default'): Promise<Array<{
    name: string;
    api_key: string;
    endpoint: string;
    model: string;
    is_active: boolean;
    is_local: boolean;
    configuration: object | null;
  }>> {
    await this.initialize();
    return Object.entries(this.data.aiProviders)
      .filter(([k]) => k.startsWith(`${userId}:`))
      .map(([k, v]) => ({
        name: k.split(':')[1],
        api_key: v.api_key ? this.decrypt(v.api_key) : '',
        endpoint: v.endpoint || '',
        model: v.model || '',
        is_active: v.is_active,
        is_local: v.is_local,
        configuration: v.configuration || null
      }));
  }

  async deleteAIProvider(name: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    delete this.data.aiProviders[`${userId}:${name}`];
    this.saveToStorage();
  }

  async setActiveAIProvider(name: string, userId: string = 'default'): Promise<void> {
    await this.initialize();
    // Set all to inactive
    Object.keys(this.data.aiProviders)
      .filter(k => k.startsWith(`${userId}:`))
      .forEach(k => {
        this.data.aiProviders[k].is_active = false;
      });

    // Set the chosen one to active
    if (this.data.aiProviders[`${userId}:${name}`]) {
      this.data.aiProviders[`${userId}:${name}`].is_active = true;
    }

    this.saveToStorage();
  }

  // Project Methods
  async addProject(project: {
    name: string;
    description?: string;
    settings?: object;
    userId?: string;
  }): Promise<string> {
    await this.initialize();
    const id = Date.now().toString();
    const userId = project.userId || 'default';
    this.data.projects[id] = {
      name: sanitizeString(project.name),
      description: sanitizeString(project.description ?? ''),
      settings: project.settings,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.saveToStorage();
    return id;
  }

  async getProjects(userId: string = 'default'): Promise<Array<{
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    lastOpened: string | null;
  }>> {
    await this.initialize();
    return Object.entries(this.data.projects)
      .filter(([k, v]) => v.user_id === userId)
      .map(([k, v]) => ({
        id: k,
        name: v.name,
        description: v.description || '',
        createdAt: v.created_at,
        updatedAt: v.updated_at,
        lastOpened: v.last_opened || null
      }));
  }

  // Project Template Methods
  async addProjectTemplate(template: {
    name: string;
    description?: string;
    genre?: string;
    tone?: string;
    structure?: string;
    template_json: object;
    userId?: string;
  }): Promise<string> {
    await this.initialize();
    const id = Date.now().toString();
    const userId = template.userId || 'default';
    this.data.projectTemplates[id] = {
      name: sanitizeString(template.name),
      description: sanitizeString(template.description ?? ''),
      genre: sanitizeString(template.genre ?? ''),
      tone: sanitizeString(template.tone ?? ''),
      structure: sanitizeString(template.structure ?? ''),
      template_json: template.template_json,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.saveToStorage();
    return id;
  }

  async getProjectTemplates(userId: string = 'default'): Promise<Array<{
    id: string;
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
    return Object.entries(this.data.projectTemplates)
      .filter(([k, v]) => v.user_id === userId)
      .map(([k, v]) => ({
        id: k,
        name: v.name,
        description: v.description || '',
        genre: v.genre || '',
        tone: v.tone || '',
        structure: v.structure || '',
        template_json: v.template_json,
        createdAt: v.created_at,
        updatedAt: v.updated_at
      }));
  }

  // Data Validation
  private validateData(data: unknown, schema: DataValidationSchema): boolean {
    if (schema.type === 'string') {
      if (typeof data !== 'string') return false;
      if (schema.required && !data) return false;
      if (schema.minLength && data.length < schema.minLength) return false;
      if (schema.maxLength && data.length > schema.maxLength) return false;
      if (schema.pattern && !schema.pattern.test(data)) return false;
      return true;
    } else if (schema.type === 'number') {
      if (typeof data !== 'number') return false;
      if (schema.required && isNaN(data as number)) return false;
      if (schema.min && (data as number) < schema.min) return false;
      if (schema.max && (data as number) > schema.max) return false;
      return true;
    } else if (schema.type === 'boolean') {
      return typeof data === 'boolean';
    } else if (schema.type === 'object') {
      if (typeof data !== 'object' || data === null) return false;
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (!(key in data) && propSchema.required) return false;
          if (!this.validateData((data as Record<string, unknown>)[key], propSchema)) return false;
        }
      }
      return true;
    } else if (schema.type === 'array') {
      if (!Array.isArray(data)) return false;
      if (schema.items) {
        for (const item of data) {
          if (!this.validateData(item, schema.items)) return false;
        }
      }
      return true;
    }
    return false;
  }

  // Schema Migration
  async migrateData(fromVersion: number, toVersion: number): Promise<void> {
    // Implement schema migration logic
    // For now, just log the migration
    console.log(`[LocalStorageDB] Migrating data from version ${fromVersion} to ${toVersion}`);
  }

  // Conflict Resolution
  async resolveConflict<T>(
    key: string,
    userId: string,
    incomingValue: T,
    existingValue: T,
    options: ConflictResolutionOptions = { strategy: 'last-write-wins' }
  ): Promise<T> {
    switch (options.strategy) {
      case 'last-write-wins':
        // Compare timestamps if available
        return incomingValue;
      case 'client-wins':
        return incomingValue;
      case 'server-wins':
        return existingValue;
      case 'merge':
        // Implement merge logic
        if (typeof incomingValue === 'object' && typeof existingValue === 'object') {
          return { ...existingValue, ...incomingValue } as T;
        }
        return incomingValue;
      default:
        return incomingValue;
    }
  }

  // IndexedDB Methods for Large Files
  async storeLargeFile(id: string, content: string): Promise<void> {
    if (!this.indexedDB) {
      throw new Error('IndexedDB not initialized');
    }
    const db = this.indexedDB as IDBDatabase; // Type assertion to satisfy TS
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['largeFiles'], 'readwrite');
      const store = transaction.objectStore('largeFiles');
      const request = store.put({ id, content });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store large file'));
    });
  }

  async retrieveLargeFile(id: string): Promise<string | null> {
    if (!this.indexedDB) {
      throw new Error('IndexedDB not initialized');
    }
    const db = this.indexedDB as IDBDatabase; // Type assertion to satisfy TS
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['largeFiles'], 'readonly');
      const store = transaction.objectStore('largeFiles');
      const request = store.get(id);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.content : null);
      };
      request.onerror = () => reject(new Error('Failed to retrieve large file'));
    });
  }

  // Data Integrity Checks
  async checkDatabaseHealth(): Promise<{ healthy: boolean; issues: string[] }> {
    await this.initialize();
    const issues: string[] = [];

    // Check for required tables
    const requiredTables = ['settings', 'userPreferences', 'aiProviders', 'projects', 'projectFiles', 'appState', 'projectTemplates'];
    for (const table of requiredTables) {
      if (!this.data[table as keyof LocalStorageSchema]) {
        issues.push(`Missing table: ${table}`);
      }
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  // Backup/Restore Utilities
  async backupDatabase(): Promise<string> {
    await this.initialize();
    return JSON.stringify(this.data);
  }

  async restoreDatabase(backup: string): Promise<void> {
    try {
      const data = JSON.parse(backup);
      if (data.version === CURRENT_VERSION) {
        this.data = data;
        this.saveToStorage();
      } else {
        this.data = await this.migrateSchema(data);
        this.saveToStorage();
      }
    } catch (error) {
      console.error('[LocalStorageDB] Failed to restore database:', error);
      throw error;
    }
  }

  // Versioning
  async getDatabaseVersion(): Promise<number> {
    await this.initialize();
    return this.data.version;
  }

  async setDatabaseVersion(version: number): Promise<void> {
    await this.initialize();
    this.data.version = version;
    this.saveToStorage();
  }
}

export const localStorageDatabase = new LocalStorageDatabase();
export default localStorageDatabase;