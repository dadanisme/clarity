import { useState, useCallback } from "react";

interface UseLoadingOptions {
  initialLoading?: boolean;
  onError?: (error: Error) => void;
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { initialLoading = false, onError } = options;
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback(
    (err: Error) => {
      setError(err);
      setIsLoading(false);
      onError?.(err);
    },
    [onError]
  );

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        startLoading();
        const result = await asyncFn();
        stopLoading();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLoadingError(error);
        throw error;
      }
    },
    [startLoading, stopLoading, setLoadingError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading,
    reset,
  };
}
