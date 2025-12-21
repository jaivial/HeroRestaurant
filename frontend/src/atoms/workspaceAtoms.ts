import { atom } from 'jotai';
import type { Workspace } from '@/types';

export const currentWorkspaceAtom = atom<Workspace | null>(null);
export const workspacesAtom = atom<Workspace[]>([]);
export const workspaceIdAtom = atom<string | null>(null);
export const workspaceNameAtom = atom<string | null>(null);
export const workspaceSlugAtom = atom<string | null>(null);
