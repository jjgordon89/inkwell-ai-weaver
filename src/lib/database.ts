import localStorageDatabase from './localStorageDatabase';

// Export the local storage database as the default database
export const database = localStorageDatabase;
export default database;

// Re-export types and interfaces from localStorageDatabase
export type { LocalStorageSchema, ConflictResolutionOptions, DataValidationSchema };
export { STORAGE_KEY, CURRENT_VERSION, INDEXED_DB_NAME, INDEXED_DB_VERSION };
