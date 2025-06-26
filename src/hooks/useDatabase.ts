
import { useEffect, useState } from 'react';
import database from '@/lib/database';

export interface DatabaseSetting {
  key: string;
  value: string;
  category: string;
}

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<DatabaseSetting[]>([]);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('[useDatabase] Starting database initialization...');
        await database.initialize();
        console.log('[useDatabase] Database initialized successfully');
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('[useDatabase] Database initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  const getSetting = async (key: string): Promise<string | null> => {
    try {
      return await database.getSetting(key);
    } catch (err) {
      console.error('Failed to get setting:', err);
      return null;
    }
  };

  const setSetting = async (key: string, value: string, category: string = 'general'): Promise<void> => {
    try {
      await database.setSetting(key, value, category);
      // Refresh settings list
      await loadSettings();
    } catch (err) {
      console.error('Failed to set setting:', err);
      throw err;
    }
  };

  const getSettingsByCategory = async (category: string): Promise<DatabaseSetting[]> => {
    try {
      const results = await database.getSettingsByCategory(category);
      return results.map(setting => ({
        key: setting.key,
        value: setting.value,
        category: category // Use the category parameter since the database method filters by category
      }));
    } catch (err) {
      console.error('Failed to get settings by category:', err);
      return [];
    }
  };

  const deleteSetting = async (key: string): Promise<void> => {
    try {
      await database.deleteSetting(key);
      await loadSettings();
    } catch (err) {
      console.error('Failed to delete setting:', err);
      throw err;
    }
  };

  const updateMultipleSettings = async (settingsToUpdate: Array<{key: string; value: string; category: string}>): Promise<void> => {
    try {
      for (const setting of settingsToUpdate) {
        await database.setSetting(setting.key, setting.value, setting.category);
      }
      await loadSettings();
    } catch (err) {
      console.error('Failed to update multiple settings:', err);
      throw err;
    }
  };

  const exportSettings = async (): Promise<string> => {
    try {
      const allSettings = await database.getAllSettings();
      return JSON.stringify(allSettings, null, 2);
    } catch (err) {
      console.error('Failed to export settings:', err);
      throw err;
    }
  };

  const importSettings = async (jsonData: string): Promise<void> => {
    try {
      const parsedSettings = JSON.parse(jsonData);
      if (!Array.isArray(parsedSettings)) {
        throw new Error('Invalid settings format');
      }
      
      for (const setting of parsedSettings) {
        if (setting.key && setting.value && setting.category) {
          await database.setSetting(setting.key, setting.value, setting.category);
        }
      }
      await loadSettings();
    } catch (err) {
      console.error('Failed to import settings:', err);
      throw err;
    }
  };

  const loadSettings = async () => {
    try {
      const allSettings = await database.getAllSettings();
      setSettings(allSettings.map(setting => ({
        key: setting.key,
        value: setting.value,
        category: setting.category || 'general' // Provide fallback for category
      })));
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    isInitialized,
    isLoading: isLoading,
    loading: isLoading, // Alias for compatibility
    error,
    settings,
    database,
    getSetting,
    setSetting,
    getSettingsByCategory,
    deleteSetting,
    updateMultipleSettings,
    exportSettings,
    importSettings,
    clearError
  };
};
