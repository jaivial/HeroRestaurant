// src/pages/MenuCreator/components/MenuDashboard/ui/EmptyMenus.tsx
import { memo } from 'react';
import { Card } from '../../../../../components/ui/Card/Card';
import { Button } from '../../../../../components/ui/Button/Button';
import { Text } from '../../../../../components/ui/Text/Text';

interface EmptyMenusProps {
  onAddMenu: () => void;
}

export const EmptyMenus = memo(function EmptyMenus({ onAddMenu }: EmptyMenusProps) {
  return (
    <Card className="p-20 text-center border-2 border-dashed bg-surface-secondary/50 rounded-[2.2rem]">
      <div className="max-w-xs mx-auto space-y-6">
        <div className="w-20 h-20 bg-surface-tertiary rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeWidth={1.5} />
          </svg>
        </div>
        <div className="space-y-2">
          <Text weight="bold" className="text-xl">No menus yet</Text>
          <Text color="secondary" className="text-base">Create your first menu to start serving your customers.</Text>
        </div>
        <Button 
          variant="secondary" 
          className="rounded-full px-8 h-12 font-bold" 
          onClick={onAddMenu}
        >
          Create Menu
        </Button>
      </div>
    </Card>
  );
});

