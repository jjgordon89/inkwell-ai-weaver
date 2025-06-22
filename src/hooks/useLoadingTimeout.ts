
import { useState, useEffect, useCallback } from 'react';

interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

export const useLoadingTimeout = (options: UseLoadingTimeoutOptions = {}) => {
  const { timeoutMs = 30000, onTimeout } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
      console.warn('Operation timed out after', timeoutMs, 'ms');
    }, timeoutMs);

    return () => clearTimeout(timeoutId);
  }, [isLoading, timeoutMs, onTimeout]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setHasTimedOut(false);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setHasTimedOut(false);
  }, []);

  return {
    isLoading,
    hasTimedOut,
    startLoading,
    stopLoading
  };
};
