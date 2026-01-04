import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text } from '@/components/ui/Text/Text';
import { AllergenTag } from './AllergenTag';
import type { DishCardProps } from '../../types';

const ALLERGENS_MAP: Record<string, { name: string; icon: string }> = {
  gluten: { name: 'Gluten', icon: '🌾' },
  crustaceans: { name: 'Crustaceans', icon: '🦐' },
  eggs: { name: 'Eggs', icon: '🥚' },
  fish: { name: 'Fish', icon: '🐟' },
  peanuts: { name: 'Peanuts', icon: '🥜' },
  soy: { name: 'Soy', icon: '🫘' },
  milk: { name: 'Milk', icon: '🥛' },
  nuts: { name: 'Nuts', icon: '🌰' },
  celery: { name: 'Celery', icon: '🌿' },
  mustard: { name: 'Mustard', icon: '🍯' },
  sesame: { name: 'Sesame', icon: '🍳' },
  sulphites: { name: 'Sulphites', icon: '🍷' },
  lupin: { name: 'Lupin', icon: '🌸' },
  molluscs: { name: 'Molluscs', icon: '🐚' },
  none: { name: 'No Allergens', icon: '✅' },
};

export const DishCard = memo(function DishCard({ dish }: DishCardProps) {
  const theme = useAtomValue(themeAtom);

  const hasVisibleAllergens = dish.allergens.length > 0 && !dish.allergens.includes('none');
  const showImage = dish.showImage && dish.imageUrl;
  const showDescription = dish.showDescription && dish.description;

  return (
    <div
      className={`overflow-hidden rounded-[2.2rem] border transition-all duration-300 ${
        theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/90 border-black/5'
      }`}
    >
      {showImage && (
        <div className="relative w-full aspect-[16/10] overflow-hidden">
          <img
            src={dish.imageUrl!}
            alt={dish.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className={showImage ? 'p-6' : 'p-5'}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Text variant="headline" weight="semibold" className="flex-1">
            {dish.title}
          </Text>
          {dish.hasSupplement && dish.supplementPrice !== null && (
            <Text
              variant="callout"
              weight="semibold"
              color={theme === 'dark' ? 'blue' : 'blue'}
              className="flex-shrink-0"
            >
              +{dish.supplementPrice.toFixed(2)}€
            </Text>
          )}
        </div>

        {showDescription && (
          <Text variant="subheadline" color="secondary" className="mb-4 leading-relaxed">
            {dish.description}
          </Text>
        )}

        {hasVisibleAllergens && (
          <div className="flex flex-wrap gap-2 mt-4">
            {dish.allergens
              .filter((id) => id !== 'none')
              .map((allergenId) => {
                const allergen = ALLERGENS_MAP[allergenId];
                if (!allergen) return null;
                return (
                  <AllergenTag
                    key={allergenId}
                    allergenId={allergenId}
                    name={allergen.name}
                    icon={allergen.icon}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
});
