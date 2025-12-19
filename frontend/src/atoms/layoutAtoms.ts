import { atom } from 'jotai';

export const sidebarOpenAtom = atom<boolean>(false);

export const toggleSidebarAtom = atom(
  null,
  (get, set) => {
    set(sidebarOpenAtom, !get(sidebarOpenAtom));
  }
);

export const isMobileViewportAtom = atom<boolean>(
  typeof window !== 'undefined' ? window.innerWidth < 1024 : false
);
