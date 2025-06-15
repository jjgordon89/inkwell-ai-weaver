
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
