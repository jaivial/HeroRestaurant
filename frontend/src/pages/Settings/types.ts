
export interface SettingsProps {}

export interface SettingsTab {
  id: string;
  label: string;
}

export interface SettingsSectionProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onScheduleChange?: (day: string, field: string, value: any) => void;
  onMealChange?: (meal: string, field: string, value: any) => void;
  isLoading?: boolean;
}

