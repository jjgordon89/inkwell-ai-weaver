
// Utility functions for local models

/**
 * Format model size for display
 */
export function formatModelSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get a friendly name for a model
 */
export function getModelDisplayName(modelName: string): string {
  // Remove common suffixes and make more readable
  return modelName
    .replace(/:latest$/, '')
    .replace(/-instruct$/, ' (Instruct)')
    .replace(/-chat$/, ' (Chat)')
    .replace(/-code$/, ' (Code)')
    .replace(/(\d+)b/i, ' $1B')
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Check if a model name suggests it's good for coding
 */
export function isCodeModel(modelName: string): boolean {
  const codeKeywords = ['code', 'codellama', 'deepseek', 'starcoder', 'wizard', 'phind'];
  return codeKeywords.some(keyword => 
    modelName.toLowerCase().includes(keyword)
  );
}

/**
 * Check if a model name suggests it's an instruct/chat model
 */
export function isChatModel(modelName: string): boolean {
  const chatKeywords = ['instruct', 'chat', 'assistant', 'conversational'];
  return chatKeywords.some(keyword => 
    modelName.toLowerCase().includes(keyword)
  );
}

/**
 * Get estimated model size category
 */
export function getModelSizeCategory(modelName: string): 'small' | 'medium' | 'large' | 'unknown' {
  const match = modelName.match(/(\d+)b/i);
  if (!match) return 'unknown';
  
  const sizeB = parseInt(match[1]);
  if (sizeB <= 7) return 'small';
  if (sizeB <= 30) return 'medium';
  return 'large';
}
