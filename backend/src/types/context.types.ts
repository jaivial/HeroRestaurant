import type { User, Session, Membership } from './database.types';

export interface RequestContext {
  userId: string;
  sessionId: string;
  user: User;
  session: Session;
  memberFlags: bigint;
  currentRestaurantId?: string;
  membership?: Membership;
  restaurantFlags?: bigint;
}

export interface AuthenticatedContext {
  userId: string;
  user: User;
  session: Session;
}
