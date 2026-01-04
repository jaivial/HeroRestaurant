import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Heading } from '@/components/ui/Text/Text';
import { Badge } from '@/components/ui/Badge/Badge';
import type { MenuHeaderProps } from '../../types';

export const MenuHeader = memo(function MenuHeader({
  restaurantName,
  logoUrl,
  menuTitle,
  type,
  price,
  drinkIncluded,
  coffeeIncluded,
}: MenuHeaderProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <header className="relative overflow-hidden">
      <div
        className={`absolute inset-0 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-[#0A84FF]/5 via-transparent to-transparent'
            : 'bg-gradient-to-b from-[#007AFF]/5 via-transparent to-transparent'
        }`}
      />

      <div className="relative px-6 pt-12 pb-8 text-center">
        {logoUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={logoUrl}
              alt={restaurantName}
              className="w-20 h-20 rounded-[1.5rem] object-cover shadow-lg"
            />
          </div>
        )}

        <Text
          variant="caption1"
          color="secondary"
          weight="semibold"
          className="uppercase tracking-[0.08em] mb-3"
        >
          {restaurantName}
        </Text>

        <Heading level={1} className="mb-6 px-4">
          {menuTitle}
        </Heading>

        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {type === 'fixed_price' && price !== null && (
            <div
              className={`px-6 py-3 rounded-[1.5rem] ${
                theme === 'dark' ? 'bg-white/10' : 'bg-black/5'
              }`}
            >
              <Text variant="title2" weight="bold">
                {price.toFixed(2)}€
              </Text>
              <Text variant="caption1" color="secondary" className="mt-0.5">
                per person
              </Text>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {drinkIncluded && (
            <Badge variant="info" size="md">
              🍷 Drink included
            </Badge>
          )}
          {coffeeIncluded && (
            <Badge variant="info" size="md">
              ☕ Coffee included
            </Badge>
          )}
        </div>
      </div>
    </header>
  );
});
