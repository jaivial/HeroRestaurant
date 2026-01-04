import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Heading } from '@/components/ui/Text/Text';
import type { MenuInactiveProps } from '../../types';

export const MenuInactive = memo(function MenuInactive({
  restaurantName,
}: MenuInactiveProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: theme === 'dark' ? '#000000' : '#F5F5F7' }}
    >
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🍽️</div>
        <Heading level={1} className="mb-4">
          Menu Currently Unavailable
        </Heading>
        <Text variant="body" color="secondary" className="mb-4">
          This menu from <strong>{restaurantName}</strong> is not currently active.
        </Text>
        <Text variant="footnote" color="tertiary">
          Please contact the restaurant for more information about available menus.
        </Text>
      </div>
    </div>
  );
});
