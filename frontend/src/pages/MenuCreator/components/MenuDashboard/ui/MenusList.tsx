// src/pages/MenuCreator/components/MenuDashboard/ui/MenusList.tsx
import { memo } from 'react';
import { Heading, Text } from '../../../../../components/ui/Text/Text';
import { MenuCard } from './MenuCard';
import { EmptyMenus } from './EmptyMenus';
import type { MenusListProps } from '../../../types';

export const MenusList = memo(function MenusList({ menus, onAddMenu, onToggleStatus }: MenusListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <Heading level={3} className="text-2xl font-bold">Your Menus</Heading>
        <Text color="tertiary" weight="medium">{menus.length} total</Text>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {menus.length === 0 ? (
          <EmptyMenus onAddMenu={onAddMenu} />
        ) : (
          menus.map((menu) => (
            <MenuCard 
              key={menu.id} 
              menu={menu} 
              onToggleStatus={onToggleStatus} 
            />
          ))
        )}
      </div>
    </div>
  );
});

