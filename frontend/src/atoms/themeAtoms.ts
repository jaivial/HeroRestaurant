import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type Theme = 'light' | 'dark';

export const themeAtom = atomWithStorage<Theme>('theme', 'light');

export const toggleThemeAtom = atom(null, (get, set) => {
  const current = get(themeAtom);
  set(themeAtom, current === 'light' ? 'dark' : 'light');
});
