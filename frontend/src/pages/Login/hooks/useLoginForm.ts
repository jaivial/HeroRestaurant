import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const location = useLocation();

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

      setIsLoading(true);
      setErrors({});

      try {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (location.state?.from) {
          navigate(location.state.from);
          return;
        }

        if (result?.workspaceId) {
          navigate(`/w/${result.workspaceId}/dashboard`);
        }
        // Note: Every user is guaranteed to have at least 1 workspace (enforced during registration)
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : 'Login failed',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validate, login, navigate, location.state]
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
    handleSubmit,
    handleChange,
  };
}
