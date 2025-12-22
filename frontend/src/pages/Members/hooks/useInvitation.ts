import { useState, useCallback } from 'react';
import { useWSMutation } from '@/hooks/useWSRequest';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export function useInvitation() {
  const { workspaceId } = useParams();
  const theme = useAtomValue(themeAtom);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createInvitationMutation } = useWSMutation('invitation', 'create');

  const generateInvitation = useCallback(async (roleId?: string, email?: string) => {
    if (!workspaceId) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await createInvitationMutation({
        restaurantId: workspaceId,
        roleId: roleId || undefined,
        email: email || undefined,
        expiresInDays: 7
      });

      if (response && response.invitation) {
        setInvitationToken(response.invitation.token);
        return response.invitation.token;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate invitation');
    } finally {
      setIsGenerating(false);
    }
  }, [workspaceId, createInvitationMutation]);

  const getInvitationLink = useCallback((token: string) => {
    return `${window.location.origin}/invite/${token}`;
  }, []);

  return {
    invitationToken,
    isGenerating,
    error,
    generateInvitation,
    getInvitationLink,
    theme,
  };
}
