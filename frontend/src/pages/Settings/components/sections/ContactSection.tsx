import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { Input } from '@/components/ui/Input/Input';
import type { SettingsSectionProps } from '../../types';

export const ContactSection = memo(({ formData, onChange }: SettingsSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Address & Contact</CardTitle>
          <Text variant="caption" color="secondary">How customers can find and reach your restaurant.</Text>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="space-y-6">
          <Input
            label="Street Address"
            name="address"
            value={formData.address}
            onChange={onChange}
            placeholder="123 Main St"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={onChange}
              placeholder="Madrid"
            />
            <Input
              label="State/Province"
              name="state"
              value={formData.state}
              onChange={onChange}
              placeholder="Madrid"
            />
            <Input
              label="Postal Code"
              name="postalCode"
              value={formData.postalCode}
              onChange={onChange}
              placeholder="28001"
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={onChange}
              placeholder="Spain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <Input
            label="Contact Email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={onChange}
            placeholder="hello@restaurant.com"
          />
          <Input
            label="Contact Phone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={onChange}
            placeholder="+34 123 456 789"
          />
          <Input
            label="Website URL"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={onChange}
            placeholder="https://www.restaurant.com"
          />
        </div>
      </CardContent>
    </Card>
  );
});

ContactSection.displayName = 'ContactSection';

