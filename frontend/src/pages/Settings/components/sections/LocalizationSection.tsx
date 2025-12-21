import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { Input } from '@/components/ui/Input/Input';
import type { SettingsSectionProps } from '../../types';

export const LocalizationSection = memo(({ formData, onChange }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Regional & Localization</CardTitle>
          <Text variant="caption" color="secondary">Timezone, currency, and language settings.</Text>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Input
              label="Timezone"
              name="timezone"
              value={formData.timezone}
              onChange={onChange}
              placeholder="Europe/Madrid"
            />
            <Input
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={onChange}
              placeholder="EUR"
            />
          </div>

          <div className="space-y-6">
            <Input
              label="Default Language"
              name="defaultLanguage"
              value={formData.defaultLanguage}
              onChange={onChange}
              placeholder="en, es, fr..."
            />
            <Input
              label="Default Tax Rate (%)"
              name="defaultTaxRate"
              type="number"
              step="0.01"
              value={formData.defaultTaxRate}
              onChange={onChange}
              placeholder="10.00"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LocalizationSection.displayName = 'LocalizationSection';

