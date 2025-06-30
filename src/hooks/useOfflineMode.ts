import { useState, useEffect, useCallback } from 'react';
import { useAppToast } from './useAppToast';

export interface UseOfflineModeOptions {
  showStatusToasts?: boolean;
}

const defaultOptions: UseOfflineModeOptions = {
  showStatusToasts: true
};

/**
 * Hook for handling application offline/online status
 */
export function useOfflineMode(options: UseOfflineModeOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const { showToast } = useAppToast();

  // Track offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // If we were previously offline, show a toast when returning online
      if (wasOffline && mergedOptions.showStatusToasts) {
        showToast({
          title: 'You\'re back online',
          description: 'Your changes will now be synced',
          variant: 'default',
        });
      }
      
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      
      if (mergedOptions.showStatusToasts) {
        showToast({
          title: 'You\'re offline',
          description: 'Changes will be saved locally and synced when you reconnect',
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, mergedOptions.showStatusToasts, showToast]);

  /**
   * Save local changes to be synced when back online
   */
  const saveForSync = useCallback((key: string, data: unknown) => {
    try {
      // Get the current sync queue
      const queueJson = localStorage.getItem('sync_queue') || '[]';
      const queue = JSON.parse(queueJson);
      
      // Add the new item to the queue
      queue.push({
        key,
        data,
        timestamp: new Date().toISOString()
      });
      
      // Save the updated queue
      localStorage.setItem('sync_queue', JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Failed to save for sync:', error);
      return false;
    }
  }, []);

  /**
   * Get all pending sync items
   */
  const getPendingSyncItems = useCallback(() => {
    try {
      const queueJson = localStorage.getItem('sync_queue') || '[]';
      return JSON.parse(queueJson);
    } catch (error) {
      console.error('Failed to get pending sync items:', error);
      return [];
    }
  }, []);

  /**
   * Clear a specific sync item
   */
  const clearSyncItem = useCallback((timestamp: string) => {
    try {
      const queueJson = localStorage.getItem('sync_queue') || '[]';
      const queue = JSON.parse(queueJson);
      
      // Filter out the item with the matching timestamp
      const updatedQueue = queue.filter((item: { timestamp: string }) => item.timestamp !== timestamp);
      
      // Save the updated queue
      localStorage.setItem('sync_queue', JSON.stringify(updatedQueue));
      return true;
    } catch (error) {
      console.error('Failed to clear sync item:', error);
      return false;
    }
  }, []);

  /**
   * Clear all sync items
   */
  const clearAllSyncItems = useCallback(() => {
    try {
      localStorage.setItem('sync_queue', '[]');
      return true;
    } catch (error) {
      console.error('Failed to clear all sync items:', error);
      return false;
    }
  }, []);

  /**
   * Manually check if we're online
   */
  const checkConnection = useCallback(async () => {
    try {
      // Try to fetch a small resource to check connection
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const newIsOnline = response.ok;
      setIsOnline(newIsOnline);
      return newIsOnline;
    } catch (error) {
      setIsOnline(false);
      return false;
    }
  }, []);

  return {
    isOnline,
    wasOffline,
    saveForSync,
    getPendingSyncItems,
    clearSyncItem,
    clearAllSyncItems,
    checkConnection
  };
}
