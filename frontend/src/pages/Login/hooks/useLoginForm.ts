import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { LoginFormData, LoginFormErrors } from '../types';
import type { User, Workspace } from '@/types';

export function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Mock login for demo purposes
      // In production, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockUser: User = {
        id: '1',
        name: 'Demo User',
        email: formData.email,
        avatar: undefined,
      };

      const mockWorkspace: Workspace = {
        id: 'demo-workspace',
        name: 'Demo Restaurant',
        slug: 'demo-restaurant',
        permissions: 0x7FFFFFFFFFFFFFFFn, // All permissions for demo
      };

      const mockToken = 'demo-token-' + Date.now();

      login(mockUser, mockWorkspace, mockToken);
      navigate(`/w/${mockWorkspace.id}/dashboard`);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleSubmit,
    handleChange,
  };
}
