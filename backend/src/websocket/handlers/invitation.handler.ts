import type { WSConnection } from '../state/connections';
import { InvitationService } from '../../services/invitation.service';
import { Errors } from '../../utils/errors';

export const invitationHandlers = {
  /**
   * Creates a new invitation
   */
  create: async (ws: WSConnection, payload: any) => {
    if (!ws.data.userId) throw Errors.UNAUTHORIZED;

    const invitation = await InvitationService.createInvitation(
      payload,
      ws.data.userId
    );

    return { data: { invitation } };
  },

  /**
   * Validates an invitation token
   */
  validate: async (ws: WSConnection, payload: any) => {
    const details = await InvitationService.validateInvitation(payload.token);
    return { data: details };
  },

  /**
   * Accepts an invitation
   */
  accept: async (ws: WSConnection, payload: any) => {
    if (!ws.data.userId) throw Errors.UNAUTHORIZED;

    const restaurantId = await InvitationService.acceptInvitation(
      payload.token,
      ws.data.userId
    );

    return { data: { restaurantId } };
  },
};
