import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWSRequest, useWSMutation } from '@/hooks/useWSRequest';
import { useAuth } from '@/hooks/useAuth';

export function useInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'accepted' | 'error'>('validating');
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);

  const { execute: validateInvitation } = useWSRequest<any, any>('invitation', 'validate');
  const { mutate: acceptInvitation } = useWSMutation('invitation', 'accept');

  const handleValidate = useCallback(async () => {
    if (!token) return;
    try {
      const data = await validateInvitation({ token });
      if (data) {
        setInvitation(data);
        setStatus('valid');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired invitation');
      setStatus('invalid');
    }
  }, [token, validateInvitation]);

  const handleAccept = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    try {
      const response = await acceptInvitation({ token });
      if (response && response.restaurantId) {
        setStatus('accepted');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join workspace');
      setStatus('error');
    }
  }, [token, isAuthenticated, acceptInvitation]);

  useEffect(() => {
    handleValidate();
  }, [handleValidate]);

  // If valid and authenticated, auto-accept
  useEffect(() => {
    if (status === 'valid' && isAuthenticated) {
      handleAccept();
    }
  }, [status, isAuthenticated, handleAccept]);

  // Countdown and redirect
  useEffect(() => {
    if (status === 'accepted') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/w/${invitation.restaurant.id}/dashboard`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, navigate, invitation]);

  return {
    status,
    invitation,
    error,
    countdown,
    isAuthenticated,
  };
}
