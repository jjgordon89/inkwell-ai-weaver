/**
 * Utility functions for date formatting and manipulation
 */

export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' | 'relative' = 'medium'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'medium':
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'long':
      return d.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'relative':
      return getRelativeTimeString(d);
    default:
      return d.toLocaleString();
  }
};

export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

/**
 * Ensures a date is in ISO string format for consistent API communication
 * @param date Date or string to normalize
 * @returns ISO formatted date string
 */
export const normalizeDate = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  
  if (typeof date === 'string') {
    // If it's already a valid ISO string, return it
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(date)) {
      return date;
    }
    // Otherwise, parse and convert to ISO
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  
  return date.toISOString();
};

/**
 * Ensures dates in an object are consistently serialized for API communication
 * Useful when sending objects to the backend
 * @param obj Object with potential date properties
 * @returns Object with ISO string dates
 */
export const serializeDates = <T extends Record<string, unknown>>(obj: T): T => {
  const result = { ...obj };
  
  for (const key in result) {
    const value = result[key];
    
    if (value instanceof Date) {
      // @ts-expect-error - we're setting back the same key with a string instead of Date
      result[key] = value.toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // @ts-expect-error - we're setting back the same key with potentially modified nested object
      result[key] = serializeDates(value as Record<string, unknown>);
    }
  }
  
  return result;
};

/**
 * Parse ISO string dates into Date objects
 * Useful when receiving data from the backend
 * @param obj Object with potential ISO string date properties
 * @returns Object with proper Date objects
 */
export const parseDates = <T extends Record<string, unknown>>(obj: T): T => {
  const result = { ...obj };
  
  for (const key in result) {
    const value = result[key];
    
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value)) {
      // @ts-expect-error - we're setting back the same key with a Date instead of string
      result[key] = new Date(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // @ts-expect-error - we're setting back the same key with potentially modified nested object
      result[key] = parseDates(value as Record<string, unknown>);
    }
  }
  
  return result;
};

/**
 * Formats a date in ISO format
 * @param date Date object to format
 * @returns ISO formatted string
 */
export const toISOString = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  return normalizeDate(date);
};

/**
 * Calculates duration between two dates in a human-readable format
 * @param start Start date
 * @param end End date
 * @returns Formatted duration string
 */
export const formatDuration = (start: Date | string, end: Date | string): string => {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const diffInMs = endDate.getTime() - startDate.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  
  if (diffInSec < 60) {
    return `${diffInSec} second${diffInSec === 1 ? '' : 's'}`;
  }
  
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) {
    return `${diffInMin} minute${diffInMin === 1 ? '' : 's'}`;
  }
  
  const diffInHours = Math.floor(diffInMin / 60);
  const remainingMins = diffInMin % 60;
  
  if (diffInHours < 24) {
    if (remainingMins === 0) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'}`;
    }
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ${remainingMins} minute${remainingMins === 1 ? '' : 's'}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
};
