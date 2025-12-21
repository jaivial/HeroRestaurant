import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { Input } from '@/components/ui/Input/Input';
import type { SettingsSectionProps } from '../../types';

export const BrandingSection = memo(({ formData, onChange }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Media & Branding</CardTitle>
          <Text variant="caption" color="secondary">Customize how your workspace looks to you and your customers.</Text>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Input
              label="Logo URL"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={onChange}
              placeholder="https://..."
            />
            <Input
              label="Cover Image URL"
              name="coverUrl"
              value={formData.coverUrl}
              onChange={onChange}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Text variant="callout" weight="semibold">Primary Brand Color</Text>
              <div className="flex items-center gap-4">
                <div 
                  className="w-11 h-11 rounded-[1rem] border border-black/10 shadow-sm"
                  style={{ backgroundColor: formData.primaryColor }}
                />
                <Input
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={onChange}
                  placeholder="#007AFF"
                  className="flex-1"
                />
              </div>
              <Text variant="caption" color="secondary">Used for buttons, links, and highlights in your public menu.</Text>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BrandingSection.displayName = 'BrandingSection';

