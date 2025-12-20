import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import type { QuickActionsProps } from '../../types';
import { ActionButton, IconPlus, IconTable, IconMenu, IconChart } from './ui/ActionButton';

export function QuickActions({ onAction }: QuickActionsProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-black/50 border-white/10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-white/72 border-black/[0.05] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]';

  return (
    <div className={cn(
      'p-6 rounded-[2.2rem] transition-all duration-300',
      glassClasses
    )}>
      <h3 className={cn(
        'text-lg font-semibold mb-6',
        isDark ? 'text-white' : 'text-black'
      )}>
        Quick Actions
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <ActionButton
          label="New Order"
          icon={<IconPlus />}
          color="blue"
          onClick={() => onAction?.('new-order')}
        />
        <ActionButton
          label="Manage Tables"
          icon={<IconTable />}
          color="green"
          onClick={() => onAction?.('manage-tables')}
        />
        <ActionButton
          label="View Menu"
          icon={<IconMenu />}
          color="purple"
          onClick={() => onAction?.('view-menu')}
        />
        <ActionButton
          label="View Reports"
          icon={<IconChart />}
          color="orange"
          onClick={() => onAction?.('view-reports')}
        />
      </div>
    </div>
  );
}

