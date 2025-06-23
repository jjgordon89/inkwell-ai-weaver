
import type { ValidationResult } from '@/utils/validation';

export const validateAIInput = (input: string, operation: string): void => {
  if (!input || typeof input !== 'string') {
    throw new Error(`Invalid input for ${operation}: Input must be a non-empty string`);
  }
  
  if (input.trim().length === 0) {
    throw new Error(`Invalid input for ${operation}: Input cannot be empty`);
  }
  
  if (input.length > 50000) {
    throw new Error(`Invalid input for ${operation}: Input is too long (max 50,000 characters)`);
  }
};

export const validateAIResponse = (response: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!response || typeof response !== 'string') {
    errors.push('Response must be a string');
    return { isValid: false, errors };
  }
  
  if (response.trim().length === 0) {
    errors.push('Response cannot be empty');
    return { isValid: false, errors };
  }
  
  // Check for common error patterns
  if (response.toLowerCase().includes('error') && response.length < 100) {
    errors.push('Response appears to contain an error message');
  }
  
  if (response.includes('<!DOCTYPE html>')) {
    errors.push('Response appears to be HTML instead of text');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeApiKey = (apiKey: string): string => {
  return apiKey.trim().replace(/\s+/g, '');
};

export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) return '***';
  
  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  const middle = '*'.repeat(Math.max(4, apiKey.length - 8));
  
  return `${start}${middle}${end}`;
};

export const getModelDisplayName = (modelName: string): string => {
  // Clean up model names for display
  return modelName
    .replace(/^(accounts\/fireworks\/models\/|meta-llama\/|mistralai\/|microsoft\/)/i, '')
    .replace(/-instruct$|-chat$/i, '')
    .replace(/-v\d+/i, '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const categorizeModel = (modelName: string): string => {
  const name = modelName.toLowerCase();
  
  if (name.includes('gpt-4') || name.includes('claude') || name.includes('gemini')) {
    return 'flagship';
  }
  
  if (name.includes('turbo') || name.includes('fast') || name.includes('instant')) {
    return 'fast';
  }
  
  if (name.includes('vision') || name.includes('multimodal')) {
    return 'multimodal';
  }
  
  if (name.includes('code') || name.includes('coding')) {
    return 'coding';
  }
  
  if (name.includes('mini') || name.includes('small') || name.includes('7b') || name.includes('8b')) {
    return 'lightweight';
  }
  
  if (name.includes('70b') || name.includes('405b') || name.includes('large')) {
    return 'powerful';
  }
  
  return 'general';
};

// AI response parsing utilities
export const parseAIResponse = (response: string): Record<string, unknown> => {
  const parsed: Record<string, unknown> = {};
  
  // Parse key-value pairs from response
  const lines = response.split('\n');
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
      parsed[normalizedKey] = value;
    }
  }
  
  return parsed;
};

// Error handling utility
export const handleAIError = (error: unknown, operation: string): Error => {
  if (error instanceof Error) {
    return new Error(`Failed to ${operation}: ${error.message}`);
  }
  return new Error(`Failed to ${operation}: Unknown error occurred`);
};

// Create suggestions list from AI response
export const createSuggestionsList = (response: string): string[] => {
  return response
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean);
};
