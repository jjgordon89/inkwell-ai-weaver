import { useState } from 'react';

export function useAsyncFeedback() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const wrap = async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await fn();
      setSuccess('Success!');
      return result;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, success, setError, setSuccess, wrap };
}
