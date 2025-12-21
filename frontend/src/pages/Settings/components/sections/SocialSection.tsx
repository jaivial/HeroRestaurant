import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { Input } from '@/components/ui/Input/Input';
import type { SettingsSectionProps } from '../../types';

export const SocialSection = memo(({ formData, onChange }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Social Media</CardTitle>
          <Text variant="caption" color="secondary">Connect with your customers on social platforms.</Text>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Instagram URL"
            name="instagramUrl"
            value={formData.instagramUrl}
            onChange={onChange}
            placeholder="https://instagram.com/restaurant"
            leftIcon={<div className="w-5 h-5 opacity-40">📸</div>}
          />
          <Input
            label="Facebook URL"
            name="facebookUrl"
            value={formData.facebookUrl}
            onChange={onChange}
            placeholder="https://facebook.com/restaurant"
            leftIcon={<div className="w-5 h-5 opacity-40">👥</div>}
          />
        </div>
      </CardContent>
    </Card>
  );
});

SocialSection.displayName = 'SocialSection';

