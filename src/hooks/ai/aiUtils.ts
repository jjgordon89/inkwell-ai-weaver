
import { validateAIResponse } from '@/utils/validation';

export { validateAIResponse }; // Export the imported function

export interface ParsedAIResponse {
  [key: string]: string | string[] | number | undefined;
}

export const parseAIResponse = (response: string): ParsedAIResponse => {
  // Validate the response first
  const validation = validateAIResponse(response);
  if (!validation.isValid) {
    console.warn('AI response validation failed:', validation.errors);
    throw new Error(`Invalid AI response: ${validation.errors.join(', ')}`);
  }

  const lines = response.split('\n').filter(line => line.trim().length > 0);
  const parsed: ParsedAIResponse = {};

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;

    const key = line.substring(0, colonIndex).toLowerCase().trim();
    const value = line.substring(colonIndex + 1).trim();
    
    // Validate and sanitize the value
    if (!value || value.length === 0) return;
    
    // Handle special cases
    switch (key) {
      case 'age': {
        const age = parseInt(value);
        parsed[key] = isNaN(age) ? undefined : Math.max(0, Math.min(200, age));
        break;
      }
      case 'tags': {
        const tags = value.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0 && tag.length <= 50)
          .slice(0, 10); // Limit to 10 tags
        parsed[key] = tags;
        break;
      }
      default: {
        // Sanitize string values
        const sanitizedValue = value.replace(/[<>]/g, '').trim();
        if (sanitizedValue.length <= 5000) { // Limit field length
          parsed[key] = sanitizedValue;
        }
        break;
      }
    }
  });

  return parsed;
};

export const handleAIError = (error: unknown, operation: string): Error => {
  console.error(`❌ ${operation} failed:`, error);
  
  if (error instanceof Error) {
    // Sanitize error message
    const sanitizedMessage = error.message.replace(/[<>]/g, '').substring(0, 500);
    return new Error(`Failed to ${operation.toLowerCase()}: ${sanitizedMessage}`);
  }
  
  return new Error(`Failed to ${operation.toLowerCase()}: Unknown error occurred`);
};

export const createSuggestionsList = (response: string): string[] => {
  // Validate the response first
  const validation = validateAIResponse(response);
  if (!validation.isValid) {
    console.warn('AI response validation failed for suggestions:', validation.errors);
    return [];
  }

  return response
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-•*]\s*/, '').trim())
    .filter(suggestion => suggestion.length >= 10 && suggestion.length <= 500) // Validate length
    .map(suggestion => suggestion.replace(/[<>]/g, '')) // Sanitize
    .slice(0, 5); // Limit to 5 suggestions
};

export const validateAIInput = (input: string, operation: string): void => {
  if (!input || typeof input !== 'string') {
    throw new Error(`No input provided for ${operation}`);
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    throw new Error(`No input provided for ${operation}`);
  }
  
  if (trimmed.length < 3) {
    throw new Error(`Input too short for ${operation}. Please provide more details.`);
  }

  if (trimmed.length > 10000) {
    throw new Error(`Input too long for ${operation}. Please keep it under 10,000 characters.`);
  }

  // Check for potentially harmful content
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
    throw new Error(`Input contains potentially unsafe content for ${operation}`);
  }
};
