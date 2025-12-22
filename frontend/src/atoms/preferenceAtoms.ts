import { atom } from 'jotai';
import { workspaceIdAtom } from './workspaceAtoms';
import { wsClient } from '@/websocket/client';

export interface UserPreferences {
  [key: string]: any;
}

// Raw preferences stored as a dictionary
export const preferencesAtom = atom<UserPreferences>({});

// Loading state
export const preferencesLoadingAtom = atom<boolean>(false);

// Action to fetch all preferences for the current workspace
export const fetchPreferencesAtom = atom(
  null,
  async (get, set) => {
    const restaurantId = get(workspaceIdAtom);
    if (!restaurantId) return;

    set(preferencesLoadingAtom, true);
    try {
      const response = await wsClient.request<{ preferences: UserPreferences }>(
        'preference',
        'get',
        { restaurantId }
      );
      set(preferencesAtom, response.preferences);
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
    } finally {
      set(preferencesLoadingAtom, false);
    }
  }
);

// Helper to create a synchronized preference atom
function createPreferenceAtom<T>(key: string, defaultValue: T) {
  const baseAtom = atom<T>((get) => {
    const prefs = get(preferencesAtom);
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  });

  return atom(
    (get) => get(baseAtom),
    async (get, set, newValue: T | ((prev: T) => T)) => {
      const restaurantId = get(workspaceIdAtom);
      if (!restaurantId) return;

      const current = get(baseAtom);
      const nextValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(current) 
        : newValue;

      // Optimistic update
      set(preferencesAtom, (prev) => ({ ...prev, [key]: nextValue }));

      try {
        await wsClient.request('preference', 'set', {
          restaurantId,
          key,
          value: nextValue,
        });
      } catch (error) {
        console.error(`Failed to save preference ${key}:`, error);
        // Rollback on error
        set(preferencesAtom, (prev) => ({ ...prev, [key]: current }));
      }
    }
  );
}

// Individual Preference Atoms
export const shiftsTimeFormatPreferenceAtom = createPreferenceAtom<'12h' | '24h'>(
  'shifts.time_format',
  '24h'
);

export const shiftsStatsPeriodPreferenceAtom = createPreferenceAtom<string>(
  'shifts.stats_period',
  'monthly'
);

export const shiftsHistoryTabPreferenceAtom = createPreferenceAtom<string>(
  'shifts.history_tab',
  'table'
);

export const shiftsWeeklyLayoutPreferenceAtom = createPreferenceAtom<'horizontal' | 'vertical'>(
  'shifts.weekly_layout',
  'horizontal'
);
