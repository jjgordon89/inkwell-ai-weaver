import { database } from '@/lib/database';

// Legacy localStorage functions for backward compatibility
export const loadAISettings = () => {
  try {
    const savedKeys = localStorage.getItem('ai-api-keys');
    const savedProvider = localStorage.getItem('ai-selected-provider');
    const savedModel = localStorage.getItem('ai-selected-model');

    return {
      apiKeys: savedKeys ? JSON.parse(savedKeys) : {},
      selectedProvider: savedProvider || 'OpenAI',
      selectedModel: savedModel || 'gpt-4'
    };
  } catch (error) {
    console.error('Failed to load saved AI settings:', error);
    return {
      apiKeys: {},
      selectedProvider: 'OpenAI',
      selectedModel: 'gpt-4'
    };
  }
};

export const saveApiKeys = (apiKeys: Record<string, string>) => {
  localStorage.setItem('ai-api-keys', JSON.stringify(apiKeys));
};

export const saveSelectedProvider = (provider: string) => {
  localStorage.setItem('ai-selected-provider', provider);
};

export const saveSelectedModel = (model: string) => {
  localStorage.setItem('ai-selected-model', model);
};

// New database-powered AI settings functions
export class DatabaseAIStorage {  // Load AI settings from database with fallback to localStorage
  static async loadAISettings() {
    try {
      // First try to load from localStorage for immediate response
      const legacySettings = loadAISettings();
      
      // Then try to initialize database (with timeout to prevent blocking)
      const dbPromise = database.initialize();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
      );
      
      await Promise.race([dbPromise, timeoutPromise]);
      
      // Try to get settings from database
      const [savedProvider, savedModel, apiKeysJson] = await Promise.all([
        database.getSetting('ai_selected_provider'),
        database.getSetting('ai_selected_model'),
        database.getSetting('ai_api_keys')
      ]);

      let apiKeys = {};
      if (apiKeysJson) {
        try {
          apiKeys = JSON.parse(apiKeysJson);
        } catch (error) {
          console.warn('Failed to parse API keys from database:', error);
        }
      }      // Use database values if available, otherwise use legacy localStorage values
      return {
        apiKeys: Object.keys(apiKeys).length > 0 ? apiKeys : legacySettings.apiKeys,
        selectedProvider: savedProvider || legacySettings.selectedProvider,
        selectedModel: savedModel || legacySettings.selectedModel
      };
    } catch (error) {
      console.warn('Database not available, falling back to localStorage:', error);
      // Fallback to localStorage only
      return loadAISettings();
    }
  }

  // Save API keys to database
  static async saveApiKeys(apiKeys: Record<string, string>) {
    try {
      await database.setSetting('ai_api_keys', JSON.stringify(apiKeys), 'ai');
      
      // Also save individual API keys for easier querying
      for (const [provider, key] of Object.entries(apiKeys)) {
        await database.setSetting(`ai_api_key_${provider.toLowerCase()}`, key, 'ai');
      }
      
      // Keep localStorage in sync for backward compatibility
      saveApiKeys(apiKeys);
    } catch (error) {
      console.error('Failed to save API keys to database:', error);
      // Fallback to localStorage
      saveApiKeys(apiKeys);
    }
  }

  // Save selected provider to database
  static async saveSelectedProvider(provider: string) {
    try {
      await database.setSetting('ai_selected_provider', provider, 'ai');
      
      // Keep localStorage in sync
      saveSelectedProvider(provider);
    } catch (error) {
      console.error('Failed to save selected provider to database:', error);
      saveSelectedProvider(provider);
    }
  }

  // Save selected model to database
  static async saveSelectedModel(model: string) {
    try {
      await database.setSetting('ai_selected_model', model, 'ai');
      
      // Keep localStorage in sync
      saveSelectedModel(model);
    } catch (error) {
      console.error('Failed to save selected model to database:', error);
      saveSelectedModel(model);
    }
  }

  // Get API key for specific provider
  static async getApiKey(provider: string): Promise<string | null> {
    try {
      return await database.getSetting(`ai_api_key_${provider.toLowerCase()}`);
    } catch (error) {
      console.error(`Failed to get API key for ${provider}:`, error);
      return null;
    }
  }

  // Save AI provider configuration
  static async saveProviderConfig(provider: {
    name: string;
    api_key?: string;
    endpoint?: string;
    model?: string;
    is_active?: boolean;
    is_local?: boolean;
    configuration?: object;
  }) {
    try {
      await database.saveAIProvider(provider);
    } catch (error) {
      console.error('Failed to save provider configuration:', error);
      throw error;
    }
  }

  // Get all provider configurations
  static async getProviderConfigs() {
    try {
      return await database.listAIProviders(); // Changed from getAIProviders to listAIProviders
    } catch (error) {
      console.error('Failed to get provider configurations:', error);
      return [];
    }
  }

  // Save AI processing settings
  static async saveProcessingSettings(settings: {
    temperature?: number;
    max_tokens?: number;
    cache_enabled?: boolean;
    cache_expiry?: number;
    auto_suggest?: boolean;
    real_time_processing?: boolean;
  }) {
    try {
      const settingsToUpdate = [];

      if (settings.temperature !== undefined) {
        settingsToUpdate.push({ key: 'ai_temperature', value: settings.temperature.toString(), category: 'ai' });
      }
      if (settings.max_tokens !== undefined) {
        settingsToUpdate.push({ key: 'ai_max_tokens', value: settings.max_tokens.toString(), category: 'ai' });
      }
      if (settings.cache_enabled !== undefined) {
        settingsToUpdate.push({ key: 'ai_cache_enabled', value: settings.cache_enabled.toString(), category: 'ai' });
      }
      if (settings.cache_expiry !== undefined) {
        settingsToUpdate.push({ key: 'ai_cache_expiry', value: settings.cache_expiry.toString(), category: 'ai' });
      }
      if (settings.auto_suggest !== undefined) {
        settingsToUpdate.push({ key: 'ai_auto_suggest', value: settings.auto_suggest.toString(), category: 'ai' });
      }
      if (settings.real_time_processing !== undefined) {
        settingsToUpdate.push({ key: 'ai_real_time_processing', value: settings.real_time_processing.toString(), category: 'ai' });
      }

      // Save all settings
      for (const setting of settingsToUpdate) {
        await database.setSetting(setting.key, setting.value, setting.category);
      }
    } catch (error) {
      console.error('Failed to save processing settings:', error);
      throw error;
    }
  }

  // Load AI processing settings
  static async loadProcessingSettings() {
    try {
      const [temperature, maxTokens, cacheEnabled, cacheExpiry, autoSuggest, realTimeProcessing] = await Promise.all([
        database.getSetting('ai_temperature'),
        database.getSetting('ai_max_tokens'),
        database.getSetting('ai_cache_enabled'),
        database.getSetting('ai_cache_expiry'),
        database.getSetting('ai_auto_suggest'),
        database.getSetting('ai_real_time_processing')
      ]);

      return {
        temperature: temperature ? parseFloat(temperature) : 0.7,
        max_tokens: maxTokens ? parseInt(maxTokens, 10) : 1000,
        cache_enabled: cacheEnabled === 'true',
        cache_expiry: cacheExpiry ? parseInt(cacheExpiry, 10) : 3600000,
        auto_suggest: autoSuggest !== 'false', // default to true
        real_time_processing: realTimeProcessing === 'true'
      };
    } catch (error) {
      console.error('Failed to load processing settings:', error);
      return {
        temperature: 0.7,
        max_tokens: 1000,
        cache_enabled: true,
        cache_expiry: 3600000,
        auto_suggest: true,
        real_time_processing: false
      };
    }
  }

  // Clear all AI settings (for reset functionality)
  static async clearAllSettings() {
    try {
      const aiSettings = await database.getSettingsByCategory('ai');
      for (const setting of aiSettings) {
        await database.deleteSetting(setting.key);
      }
      
      // Also clear localStorage
      localStorage.removeItem('ai-api-keys');
      localStorage.removeItem('ai-selected-provider');
      localStorage.removeItem('ai-selected-model');
    } catch (error) {
      console.error('Failed to clear AI settings:', error);
      throw error;
    }
  }
}

export default DatabaseAIStorage;
