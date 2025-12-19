import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type Theme = 'light' | 'dark';

export const themeAtom = atomWithStorage<Theme>('theme', 'light');

export const themeEffectAtom = atom(
  (get) => get(themeAtom),
  (_get, set, newTheme: Theme) => {
    set(themeAtom, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
);

export const toggleThemeAtom = atom(null, (get, set) => {
  const current = get(themeAtom);
  set(themeEffectAtom, current === 'light' ? 'dark' : 'light');
});
