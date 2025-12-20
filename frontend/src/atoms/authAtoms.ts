import { atom } from 'jotai';
import type { AuthStatus } from '@/types';

export const authStatusAtom = atom<AuthStatus>('unknown');
export const currentUserIdAtom = atom<string | null>(null);
export const currentUserNameAtom = atom<string | null>(null);
export const currentUserEmailAtom = atom<string | null>(null);
export const currentUserAvatarAtom = atom<string | null>(null);
export const sessionExpiryAtom = atom<number | null>(null);
export const lastActivityAtom = atom<number>(Date.now());
export const currentUserGlobalFlagsAtom = atom<bigint>(0n);
