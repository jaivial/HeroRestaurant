import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import type { SettingsSectionProps } from '../../types';

export const GeneralSection = memo(({ formData, onChange }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>General Settings</CardTitle>
          <Text variant="caption" color="secondary">Manage your workspace&apos;s basic information and branding.</Text>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Input
              label="Workspace Name"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="e.g. My Amazing Restaurant"
              required
            />
            <Input
              label="Workspace Slug"
              name="slug"
              value={formData.slug}
              onChange={onChange}
              placeholder="my-restaurant"
              required
              leftIcon={<span className="text-[14px] opacity-40">/w/</span>}
            />
          </div>

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Tell us about your restaurant..."
            className="min-h-[120px]"
          />
        </div>
      </CardContent>
    </Card>
  );
});

GeneralSection.displayName = 'GeneralSection';

