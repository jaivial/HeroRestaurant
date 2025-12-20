// src/pages/MenuCreator/components/MenuDashboard/ui/MenuCard.tsx
import { memo } from 'react';
import { Card } from '../../../../../components/ui/Card/Card';
import { Button } from '../../../../../components/ui/Button/Button';
import { Toggle } from '../../../../../components/ui/Toggle/Toggle';
import { Badge } from '../../../../../components/ui/Badge/Badge';
import { Text } from '../../../../../components/ui/Text/Text';
import type { MenuCardProps } from '../../../types';

export const MenuCard = memo(function MenuCard({ menu, onToggleStatus }: MenuCardProps) {
  return (
    <Card className="group overflow-hidden border-2 border-apple-gray-100 bg-surface-primary rounded-[2.2rem] hover:shadow-apple-xl hover:border-apple-blue/20 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-apple-blue/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-8 h-8 text-apple-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <Text weight="bold" className="text-2xl">{menu.title}</Text>
              <Badge 
                variant={menu.type === 'fixed_price' ? 'default' : 'info'}
                className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              >
                {menu.type === 'fixed_price' ? 'Fixed Price' : 'Open'}
              </Badge>
            </div>
            <Text color="secondary" className="text-lg">
              {menu.price ? `${menu.price}€` : 'Open Prices'} • {menu.drinkIncluded ? 'Drink included' : 'No drink'}
            </Text>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-6 md:pt-0">
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <Text color="tertiary" weight="bold" className="uppercase tracking-widest text-[9px] mb-1 block">
                Status
              </Text>
              <Text variant="subheadline" weight="bold" className={menu.isActive ? 'text-apple-green' : 'text-content-tertiary'}>
                {menu.isActive ? 'Active' : 'Inactive'}
              </Text>
            </div>
            <Toggle 
              checked={menu.isActive} 
              onChange={(checked) => onToggleStatus(menu.id, checked)} 
            />
          </div>
          <Button 
            variant="ghost" 
            className="rounded-full w-12 h-12 p-0 hover:bg-apple-blue/10 hover:text-apple-blue transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth={2} />
            </svg>
          </Button>
        </div>
      </div>
    </Card>
  );
});

