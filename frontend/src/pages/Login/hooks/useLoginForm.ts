import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useAuth } from '@/hooks/useAuth';
import { isConnectedAtom, connectionStatusAtom } from '@/atoms/websocketAtoms';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';
import type { LoginFormData, LoginFormErrors } from '../types';

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const workspace = useAtomValue(currentWorkspaceAtom);
  const isConnected = useAtomValue(isConnectedAtom);
  const connectionStatus = useAtomValue(connectionStatusAtom);

  const validate = useCallback((): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      if (!isConnected) {
        setErrors({
          general: 'Not connected to server. Please wait...',
        });
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const success = await login({
          email: formData.email,
          password: formData.password,
        });

        if (success) {
          // Navigate to dashboard - workspace should be set by login
          // We need to wait a tick for the workspace to be set
          setTimeout(() => {
            const ws = workspace;
            if (ws) {
              navigate(`/w/${ws.id}/dashboard`);
            } else {
              navigate('/dashboard');
            }
          }, 0);
        } else {
          setErrors({
            general: 'Invalid email or password',
          });
        }
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : 'Login failed',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validate, isConnected, login, workspace, navigate]
  );

  const handleChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  return {
    formData,
    errors,
    isLoading,
    isConnected,
    connectionStatus,
    handleSubmit,
    handleChange,
  };
}
