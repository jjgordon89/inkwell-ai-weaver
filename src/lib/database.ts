import localStorageDatabase from './localStorageDatabase';

// Export the local storage database as the default database
export { localStorageDatabase as database };
export default localStorageDatabase;

// Re-export types and constants from localStorageDatabase
export type { LocalStorageSchema, ConflictResolutionOptions, DataValidationSchema } from './localStorageDatabase';
export { STORAGE_KEY, CURRENT_VERSION, INDEXED_DB_NAME, INDEXED_DB_VERSION } from './localStorageDatabase';

// Cleaned up: No backend or SQL.js code remains. Only localStorageDatabase is exported.
