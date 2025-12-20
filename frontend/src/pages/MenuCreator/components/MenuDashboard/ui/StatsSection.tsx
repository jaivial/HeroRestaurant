// src/pages/MenuCreator/components/MenuDashboard/ui/StatsSection.tsx
import { memo } from 'react';
import { Card, CardContent } from '../../../../../components/ui/Card/Card';
import { Heading, Text } from '../../../../../components/ui/Text/Text';
import { cn } from '../../../../../utils/cn';
import type { StatsSectionProps } from '../../../types';

export const StatsSection = memo(function StatsSection({ stats }: StatsSectionProps) {
  const statItems = [
    { label: 'Total Menus', value: stats.totalMenus, color: 'text-content-primary', bg: 'bg-surface-primary border-2 border-apple-gray-100' },
    { label: 'Active', value: stats.activeMenus, color: 'text-info-text-green-light dark:text-info-text-green-dark', bg: 'bg-info-bg-green-light dark:bg-info-bg-green-dark border-2 border-info-border-green-light dark:border-info-border-green-dark' },
    { label: 'Fixed Price', value: stats.fixedPriceCount, color: 'text-content-primary', bg: 'bg-surface-primary border-2 border-apple-gray-100' },
    { label: 'Open Menus', value: stats.openMenuCount, color: 'text-content-primary', bg: 'bg-surface-primary border-2 border-apple-gray-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statItems.map((stat, i) => (
        <Card key={i} className={cn("rounded-[2.2rem] shadow-apple-sm transition-transform hover:scale-[1.02]", stat.bg)}>
          <CardContent className="p-8">
            <Text color="secondary" weight="bold" className="uppercase tracking-widest text-[11px] mb-3 block opacity-80">
              {stat.label}
            </Text>
            <Heading level={2} className={cn("text-4xl font-bold", stat.color)}>{stat.value}</Heading>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

