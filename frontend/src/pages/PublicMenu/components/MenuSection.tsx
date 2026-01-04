import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text } from '@/components/ui/Text/Text';
import { DishCard } from './ui/DishCard';
import { EmptySection } from './ui/EmptySection';
import type { MenuSectionProps } from '../types';

export const MenuSection = memo(function MenuSection({
  section,
  index,
  total,
}: MenuSectionProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <section className="mb-12">
      <div className="mb-6">
        <Text
          variant="title2"
          weight="bold"
          className={`${theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'}`}
        >
          {section.name}
        </Text>
        {index < total - 1 && (
          <div
            className={`h-[1px] w-16 mt-3 ${
              theme === 'dark' ? 'bg-white/20' : 'bg-black/10'
            }`}
          />
        )}
      </div>

      {section.dishes.length === 0 ? (
        <EmptySection />
      ) : (
        <div className="space-y-4">
          {section.dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      )}
    </section>
  );
});
