
import { useEffect, useState } from 'react';
import database from '@/lib/database';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        console.log('[useDatabase] Starting database initialization...');
        await database.initialize();
        console.log('[useDatabase] Database initialized successfully');
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        console.error('[useDatabase] Database initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Database initialization failed');
        setIsInitialized(false);
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    database
  };
};
