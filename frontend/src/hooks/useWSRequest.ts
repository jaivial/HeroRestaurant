import { useCallback, useState } from 'react';
import { useAtomValue } from 'jotai';
import { isConnectedAtom } from '@/atoms/websocketAtoms';
import { wsClient } from '@/websocket';
import type { WSMessageCategory } from '@/websocket';

// ============================================================================
// Types
// ============================================================================

interface UseWSRequestOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

interface UseWSRequestResult<TPayload, TData> {
  execute: (payload?: TPayload) => Promise<TData | undefined>;
  isLoading: boolean;
  error: Error | null;
  data: TData | null;
  reset: () => void;
}

// ============================================================================
// useWSRequest Hook
// ============================================================================

/**
 * Hook for making WebSocket requests with loading/error state
 */
export function useWSRequest<TPayload = unknown, TData = unknown>(
  category: WSMessageCategory,
  action: string,
  options: UseWSRequestOptions<TData> = {}
): UseWSRequestResult<TPayload, TData> {
  const { onSuccess, onError } = options;
  const isConnected = useAtomValue(isConnectedAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const execute = useCallback(
    async (payload?: TPayload): Promise<TData | undefined> => {
      if (!isConnected) {
        const err = new Error('Not connected to server');
        setError(err);
        onError?.(err);
        return undefined;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await wsClient.request<TData>(category, action, payload);
        setData(response);
        onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Request failed');
        setError(error);
        onError?.(error);
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, category, action, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { execute, isLoading, error, data, reset };
}

// ============================================================================
// useWSMutation Hook
// ============================================================================

interface UseWSMutationOptions<TData, TPrevious> {
  /** Called before the request - return rollback data */
  onMutate?: () => TPrevious;
  /** Called on success */
  onSuccess?: (data: TData) => void;
  /** Called on error with rollback data */
  onError?: (error: Error, rollbackData: TPrevious | undefined) => void;
  /** Called after success or error */
  onSettled?: () => void;
}

/**
 * Hook for mutations with optimistic update support
 */
export function useWSMutation<TPayload = unknown, TData = unknown, TPrevious = unknown>(
  category: WSMessageCategory,
  action: string,
  options: UseWSMutationOptions<TData, TPrevious> = {}
) {
  const { onMutate, onSuccess, onError, onSettled } = options;
  const isConnected = useAtomValue(isConnectedAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (payload?: TPayload): Promise<TData | undefined> => {
      if (!isConnected) {
        const err = new Error('Not connected to server');
        setError(err);
        onError?.(err, undefined);
        return undefined;
      }

      // Optimistic update
      const previousData = onMutate?.();
      setIsLoading(true);
      setError(null);

      try {
        const response = await wsClient.request<TData>(category, action, payload);
        onSuccess?.(response);
        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Mutation failed');
        setError(error);
        onError?.(error, previousData);
        return undefined;
      } finally {
        setIsLoading(false);
        onSettled?.();
      }
    },
    [isConnected, category, action, onMutate, onSuccess, onError, onSettled]
  );

  return { mutate, isLoading, error };
}
