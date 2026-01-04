import { useState, useEffect, useCallback } from 'react';
import type { PublicMenuData, PublicMenuResponse } from '../types';

interface UsePublicMenuReturn {
  menu: PublicMenuData | null;
  isLoading: boolean;
  error: string | null;
  isNotFound: boolean;
  isInactive: boolean;
  retry: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function usePublicMenu(menuId: string): UsePublicMenuReturn {
  const [menu, setMenu] = useState<PublicMenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMenu = useCallback(async () => {
    if (!menuId) {
      setError('Menu ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsNotFound(false);
    setIsInactive(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/public/${menuId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setIsNotFound(true);
          setError('Menu not found');
          return;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: PublicMenuResponse = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error?.message || 'Failed to load menu');
      }

      if (!data.data.isActive) {
        setIsInactive(true);
        setMenu(data.data);
        return;
      }

      setMenu(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Failed to fetch public menu:', err);
    } finally {
      setIsLoading(false);
    }
  }, [menuId, retryCount]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return {
    menu,
    isLoading,
    error,
    isNotFound,
    isInactive,
    retry,
  };
}
