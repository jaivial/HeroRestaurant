import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { MenuHeader } from './ui/MenuHeader';
import { MenuSection } from './MenuSection';
import type { PublicMenuData } from '../types';

interface MenuContentProps {
  menu: PublicMenuData;
}

export const MenuContent = memo(function MenuContent({ menu }: MenuContentProps) {
  const theme = useAtomValue(themeAtom);

  const sortedSections = [...menu.sections].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme === 'dark' ? '#000000' : '#F5F5F7' }}
    >
      <MenuHeader
        restaurantName={menu.restaurant.name}
        logoUrl={menu.restaurant.logoUrl}
        menuTitle={menu.title}
        type={menu.type}
        price={menu.price}
        drinkIncluded={menu.drinkIncluded}
        coffeeIncluded={menu.coffeeIncluded}
      />

      <main className="max-w-3xl mx-auto px-6 pb-16">
        {sortedSections.map((section, index) => (
          <MenuSection
            key={section.id}
            section={section}
            index={index}
            total={sortedSections.length}
          />
        ))}
      </main>

      <footer className="max-w-3xl mx-auto px-6 pb-12 text-center">
        <div
          className={`h-[1px] w-full mb-8 ${
            theme === 'dark' ? 'bg-white/10' : 'bg-black/5'
          }`}
        />
        <div className="text-[12px] leading-relaxed" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
          Powered by Hero Restaurant
        </div>
      </footer>
    </div>
  );
});
