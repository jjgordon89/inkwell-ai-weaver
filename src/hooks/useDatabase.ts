import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { database } from '@/lib/database';

export interface Setting {
  key: string;
  value: string;
  category: string;
}

export interface AIProviderData {
  name: string;
  api_key?: string;
  endpoint?: string;
  model?: string;
  is_active: boolean;
  is_local: boolean;
  configuration?: object;
}

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [aiProviders, setAIProviders] = useState<AIProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database on first load
  useEffect(() => {
    const initDatabase = async () => {
      try {
        setLoading(true);
        await database.initialize();
        setIsInitialized(true);
        await loadAllData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        console.error('Database initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initDatabase();
  }, []);

  // Load all settings and data
  const loadAllData = useCallback(async () => {
    try {
      const [allSettings, providers] = await Promise.all([
        database.getAllSettings(),
        database.listAIProviders() // Changed from getAIProviders to listAIProviders
      ]);
      
      setSettings(allSettings);
      setAIProviders(providers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Failed to load database data:', err);
    }
  }, []);

  // Setting management functions
  const getSetting = useCallback(async (key: string): Promise<string | null> => {
    if (!isInitialized) return null;
    try {
      return await database.getSetting(key);
    } catch (err) {
      console.error(`Failed to get setting ${key}:`, err);
      return null;
    }
  }, [isInitialized]);

  const setSetting = useCallback(async (key: string, value: string, category: string = 'general'): Promise<void> => {
    if (!isInitialized) throw new Error('Database not initialized');
    
    try {
      await database.setSetting(key, value, category);
      await loadAllData(); // Refresh settings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save setting');
      throw err;
    }
  }, [isInitialized, loadAllData]);

  const getSettingsByCategory = useCallback(async (category: string): Promise<Array<{key: string, value: string}>> => {
    if (!isInitialized) return [];
    
    try {
      return await database.getSettingsByCategory(category);
    } catch (err) {
      console.error(`Failed to get settings for category ${category}:`, err);
      return [];
    }
  }, [isInitialized]);

  const deleteSetting = useCallback(async (key: string): Promise<void> => {
    if (!isInitialized) throw new Error('Database not initialized');
    
    try {
      await database.deleteSetting(key);
      await loadAllData(); // Refresh settings
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete setting');
      throw err;
    }
  }, [isInitialized, loadAllData]);

  // AI Provider management functions
  const saveAIProvider = useCallback(async (provider: AIProviderData): Promise<void> => {
    if (!isInitialized) throw new Error('Database not initialized');
    
    try {
      await database.saveAIProvider(provider);
      await loadAllData(); // Refresh providers
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save AI provider');
      throw err;
    }
  }, [isInitialized, loadAllData]);

  // Utility functions for common settings
  const getTheme = useCallback(async (): Promise<string> => {
    const theme = await getSetting('theme');
    return theme || 'system';
  }, [getSetting]);

  const setTheme = useCallback(async (theme: string): Promise<void> => {
    await setSetting('theme', theme, 'appearance');
  }, [setSetting]);

  const getAutoSave = useCallback(async (): Promise<boolean> => {
    const autoSave = await getSetting('auto_save');
    return autoSave === 'true';
  }, [getSetting]);

  const setAutoSave = useCallback(async (enabled: boolean): Promise<void> => {
    await setSetting('auto_save', enabled.toString(), 'editor');
  }, [setSetting]);

  const getAutoSaveInterval = useCallback(async (): Promise<number> => {
    const interval = await getSetting('auto_save_interval');
    return parseInt(interval || '30000', 10);
  }, [getSetting]);

  const setAutoSaveInterval = useCallback(async (interval: number): Promise<void> => {
    await setSetting('auto_save_interval', interval.toString(), 'editor');
  }, [setSetting]);

  const getDefaultAIProvider = useCallback(async (): Promise<string> => {
    const provider = await getSetting('default_ai_provider');
    return provider || 'OpenAI';
  }, [getSetting]);

  const setDefaultAIProvider = useCallback(async (provider: string): Promise<void> => {
    await setSetting('default_ai_provider', provider, 'ai');
  }, [setSetting]);

  // Bulk settings operations
  const updateMultipleSettings = useCallback(async (settingsToUpdate: Array<{key: string, value: string, category?: string}>): Promise<void> => {
    if (!isInitialized) throw new Error('Database not initialized');
    
    try {
      // Use a transaction-like approach by updating all settings first, then refreshing
      await Promise.all(
        settingsToUpdate.map(setting => 
          database.setSetting(setting.key, setting.value, setting.category || 'general')
        )
      );
      await loadAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, [isInitialized, loadAllData]);

  // Export/Import functionality
  const exportSettings = useCallback(async (): Promise<string> => {
    if (!isInitialized) throw new Error('Database not initialized');
    
    try {
      const allSettings = await database.getAllSettings();
      const allProviders = await database.listAIProviders();
      
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        settings: allSettings,
        aiProviders: allProviders
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (err) {
      throw new Error('Failed to export settings');
    }
  }, [isInitialized]);

  const importSettings = useCallback(async (data: string): Promise<void> => {
    if (!isInitialized) throw new Error('Database not initialized');
    
    try {
      const importData = JSON.parse(data);
      
      if (!importData.settings || !Array.isArray(importData.settings)) {
        throw new Error('Invalid settings data format');
      }
      
      // Import settings
      for (const setting of importData.settings) {
        await database.setSetting(setting.key, setting.value, setting.category);
      }
      
      // Import AI providers if available
      if (importData.aiProviders && Array.isArray(importData.aiProviders)) {
        for (const provider of importData.aiProviders) {
          await database.saveAIProvider(provider);
        }
      }
      
      await loadAllData();
    } catch (err) {
      throw new Error('Failed to import settings: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [isInitialized, loadAllData]);

    // Get all provider configurations
    static async getProviderConfigs() {
      try {
        return await database.listAIProviders(); // Changed from getAIProviders to listAIProviders
      } catch (error) {
        console.error('Failed to get provider configurations:', error);
        return [];
      }
    }

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isInitialized,
    settings,
    aiProviders,
    loading,
    error,
    
    // Basic operations
    getSetting,
    setSetting,
    getSettingsByCategory,
    deleteSetting,
    saveAIProvider,
    
    // Utility functions for common settings
    getTheme,
    setTheme,
    getAutoSave,
    setAutoSave,
    getAutoSaveInterval,
    setAutoSaveInterval,
    getDefaultAIProvider,
    setDefaultAIProvider,
    
    // Bulk operations
    updateMultipleSettings,
    
    // Data management
    loadAllData,
    exportSettings,
    importSettings,
    clearError
  };
};

export default useDatabase;
