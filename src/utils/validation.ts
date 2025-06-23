
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateApiKey = (apiKey: string, providerName: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!apiKey || apiKey.trim().length === 0) {
    errors.push('API key is required');
    return { isValid: false, errors };
  }
  
  const trimmedKey = apiKey.trim();
  
  // Provider-specific validation
  switch (providerName) {
    case 'OpenAI':
      if (!trimmedKey.startsWith('sk-')) {
        errors.push('OpenAI API keys should start with "sk-"');
      }
      if (trimmedKey.length < 40) {
        errors.push('OpenAI API keys are typically longer than 40 characters');
      }
      break;
      
    case 'Claude':
    case 'Anthropic (Direct)':
      if (!trimmedKey.startsWith('sk-ant-')) {
        errors.push('Anthropic API keys should start with "sk-ant-"');
      }
      break;
      
    case 'Google Gemini':
      if (trimmedKey.length < 30) {
        errors.push('Google API keys are typically at least 30 characters long');
      }
      break;
      
    case 'Groq':
      if (!trimmedKey.startsWith('gsk_')) {
        errors.push('Groq API keys should start with "gsk_"');
      }
      break;
      
    case 'OpenRouter':
      if (!trimmedKey.startsWith('sk-or-')) {
        errors.push('OpenRouter API keys should start with "sk-or-"');
      }
      break;
      
    default:
      // Basic validation for other providers
      if (trimmedKey.length < 20) {
        errors.push('API key seems too short');
      }
      break;
  }
  
  // General validation
  if (trimmedKey.includes(' ')) {
    errors.push('API key should not contain spaces');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEndpoint = (endpoint: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!endpoint || endpoint.trim().length === 0) {
    errors.push('Endpoint URL is required');
    return { isValid: false, errors };
  }
  
  try {
    const url = new URL(endpoint);
    
    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push('Endpoint must use HTTP or HTTPS protocol');
    }
    
    if (!url.pathname.includes('/chat/completions') && !url.pathname.includes('/completions')) {
      errors.push('Endpoint should typically end with /chat/completions or /completions');
    }
    
  } catch (error) {
    errors.push('Invalid URL format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
