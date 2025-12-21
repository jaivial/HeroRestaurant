// ─── Data Types ─────────────────────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// ─── Component Props ────────────────────────────────────────
export type LoginSectionProps = Record<string, never>;

export interface LoginFormProps {
  formData: LoginFormData;
  errors: LoginFormErrors;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof LoginFormData, value: string) => void;
}

export interface LoginHeaderProps {
  title: string;
  subtitle: string;
}

export interface LoginFooterProps {
  onSignupClick?: () => void;
}
