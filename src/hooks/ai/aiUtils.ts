
export interface ParsedAIResponse {
  [key: string]: string | string[] | number | undefined;
}

export const parseAIResponse = (response: string): ParsedAIResponse => {
  const lines = response.split('\n').filter(line => line.trim().length > 0);
  const parsed: ParsedAIResponse = {};

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).toLowerCase().trim();
    const value = line.substring(colonIndex + 1).trim();
    
    // Handle special cases
    switch (key) {
      case 'age':
        parsed[key] = parseInt(value) || undefined;
        break;
      case 'tags':
        parsed[key] = value.split(',').map(tag => tag.trim()).filter(Boolean);
        break;
      default:
        parsed[key] = value;
        break;
    }
  });

  return parsed;
};

export const handleAIError = (error: unknown, operation: string): Error => {
  console.error(`❌ ${operation} failed:`, error);
  
  if (error instanceof Error) {
    return new Error(`Failed to ${operation.toLowerCase()}: ${error.message}`);
  }
  
  return new Error(`Failed to ${operation.toLowerCase()}: Unknown error occurred`);
};

export const createSuggestionsList = (response: string): string[] => {
  return response
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(suggestion => suggestion.length > 10)
    .slice(0, 5); // Limit to 5 suggestions
};

export const validateAIInput = (input: string, operation: string): void => {
  if (!input || input.trim().length === 0) {
    throw new Error(`No input provided for ${operation}`);
  }
  
  if (input.trim().length < 3) {
    throw new Error(`Input too short for ${operation}. Please provide more details.`);
  }
};
