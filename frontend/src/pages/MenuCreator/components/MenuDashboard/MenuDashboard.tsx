// src/pages/MenuCreator/components/MenuDashboard/MenuDashboard.tsx
import { Button } from '../../../../components/ui/Button/Button';
import { Heading, Text } from '../../../../components/ui/Text/Text';
import { StatsSection } from './ui/StatsSection';
import { MenusList } from './ui/MenusList';
import type { MenuDashboardProps } from '../../types';

export function MenuDashboard({ menus, stats, onAddMenu, onToggleStatus }: MenuDashboardProps) {
  // ✅ Layer 2: Functional components compose UI components
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Heading level={1} className="text-5xl font-bold tracking-tight text-content-primary">Menu Creator</Heading>
          <Text color="secondary" className="text-xl font-medium">Manage your restaurant menus and schedules</Text>
        </div>
        <Button 
          onClick={onAddMenu} 
          size="lg"
          className="rounded-full h-16 px-10 bg-apple-blue hover:bg-apple-blue-hover text-white font-bold shadow-apple-lg transition-all hover:scale-105 active:scale-95 text-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 4v16m8-8H4" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
          Add New Menu
        </Button>
      </div>

      {/* Stats Section (Layer 3) */}
      <StatsSection stats={stats} />

      {/* Menus List (Layer 3) */}
      <MenusList 
        menus={menus} 
        onAddMenu={onAddMenu} 
        onToggleStatus={onToggleStatus} 
      />
    </div>
  );
}
