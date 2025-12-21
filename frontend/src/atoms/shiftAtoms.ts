import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export interface Shift {
  id: string;
  punch_in_at: string;
  punch_out_at?: string | null;
  [key: string]: any;
}

export interface ShiftStatus {
  isPunchedIn: boolean;
  activeShift: Shift | null;
}

export const shiftStatusAtom = atom<ShiftStatus>({
  isPunchedIn: false,
  activeShift: null,
});

export const isPunchedInAtom = atom(
  (get) => get(shiftStatusAtom).isPunchedIn
);

export const activeShiftAtom = atom(
  (get) => get(shiftStatusAtom).activeShift
);

export const timeFormatAtom = atomWithStorage<'12h' | '24h'>('time-format', '24h');

