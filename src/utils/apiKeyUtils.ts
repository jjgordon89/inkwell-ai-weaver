/**
 * Utility functions for API key handling and masking
 */

/**
 * Masks an API key for display in the UI, showing only the first and last 2 characters
 * with the rest as asterisks.
 * 
 * @param apiKey The API key to mask
 * @returns The masked API key (e.g., 'AK****************9Z')
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey) return '';
  if (apiKey.length <= 4) return apiKey; // Don't mask very short keys
  
  const firstTwo = apiKey.substring(0, 2);
  const lastTwo = apiKey.substring(apiKey.length - 2);
  const middleAsterisks = '*'.repeat(apiKey.length - 4);
  
  return `${firstTwo}${middleAsterisks}${lastTwo}`;
};

/**
 * Determines if an API key is valid based on minimum length and format requirements
 * 
 * @param apiKey The API key to validate
 * @param minLength Minimum required length (default: 8)
 * @returns True if valid, false otherwise
 */
export const isValidApiKey = (apiKey: string, minLength = 8): boolean => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  if (apiKey.length < minLength) return false;
  
  // Check if API key contains at least one letter and one number
  // (a common format requirement for many API keys)
  const hasLetter = /[a-zA-Z]/.test(apiKey);
  const hasNumber = /[0-9]/.test(apiKey);
  
  return hasLetter && hasNumber;
};
