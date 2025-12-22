import { atom } from 'jotai';

export interface InvitationDetails {
  id: string;
  restaurant: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  inviter: {
    name: string;
  };
  role: {
    name: string;
    color: string | null;
  } | null;
  expiresAt: string;
}

export const isInviteModalOpenAtom = atom<boolean>(false);
export const activeInvitationAtom = atom<InvitationDetails | null>(null);
export const invitationLoadingAtom = atom<boolean>(false);
export const invitationErrorAtom = atom<string | null>(null);
