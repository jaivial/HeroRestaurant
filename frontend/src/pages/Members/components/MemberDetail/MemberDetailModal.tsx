import { useState } from 'react';
import { Modal, Text, Avatar, Badge, Divider, Button } from '@/components/ui';
import type { Member } from '@/atoms/memberAtoms';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import { useMemberShifts } from '../../hooks/useMemberShifts';
import { ShiftInfoSection } from './ui/ShiftInfoSection';
import { ShiftHistorySection } from './ui/ShiftHistorySection';
import { ShiftStatsCards } from './ui/ShiftStatsCards';
import { ShiftFilters } from './ui/ShiftFilters';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  
  const [viewMode, setViewMode] = useState('table');
  const { stats, status, period, setPeriod } = useMemberShifts(member?.id || '');

  const formatDate = (value: unknown) => {
    const d = new Date(value as any);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  };

  const formatDateTime = (value: unknown) => {
    const d = new Date(value as any);
    if (Number.isNaN(d.getTime())) return '—';
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  };

  if (!member) return null;

  // Liquid Glass Effect & Inner Stroke (The "Apple Edge")
  const glassBase = "backdrop-blur-[20px] saturate-[180%]";
  const surfaceCard = cn(
    'rounded-[1.2rem] border transition-all duration-200',
    glassBase,
    isDark 
      ? 'bg-[#1C1C1E]/80 border-white/[0.12] shadow-[0_4px_16px_rgba(0,0,0,0.4)]' 
      : 'bg-white/70 border-black/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
  );

  const headerPill = cn(
    'inline-flex items-center justify-center rounded-full border px-4 py-1.5 h-8',
    glassBase,
    isDark ? 'bg-white/[0.08] border-white/[0.15]' : 'bg-black/[0.03] border-black/[0.08]'
  );

  // Semantic Backgrounds
  const modalBg = isDark ? 'bg-[#000000]/95' : 'bg-[#FFFFFF]/95';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      size="xl"
      className={cn(
        'rounded-[2.2rem] shadow-apple-float border max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar',
        glassBase,
        modalBg
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="relative space-y-8 pb-8 w-full overflow-x-hidden no-scrollbar">
        {/* Background decor */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-apple-blue/15 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-apple-purple/15 blur-3xl opacity-50" />

        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6 pt-4">
          <div className="relative">
            <Avatar
              src={member.user.avatarUrl || undefined}
              name={member.user.name}
              size="2xl"
              status={
                member.status === 'active' 
                  ? 'online' 
                  : member.status === 'suspended' 
                    ? 'suspended' 
                    : 'offline'
              }
              className={cn(
                "ring-4 transition-transform duration-300 hover:scale-105",
                isDark ? "ring-white/10" : "ring-black/5"
              )}
            />
          </div>

          <div className="space-y-2">
            <Text variant="title1" weight="bold" color="primary" className="tracking-tight leading-tight">
              {member.user.name}
            </Text>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge 
              className={cn(
                'px-4 py-1.5 text-sm font-semibold rounded-full border shadow-sm',
                !member.roleName && 'bg-transparent border-dashed border-tertiary/50 text-tertiary'
              )}
              style={member.roleName ? {
                backgroundColor: isDark ? `${member.roleColor}30` : `${member.roleColor}15`,
                color: member.roleColor || undefined,
                borderColor: isDark ? `${member.roleColor}40` : `${member.roleColor}30`,
                borderWidth: '1px',
              } : {}}
            >
              {member.roleName || 'No Role'}
            </Badge>
            <span className={headerPill}>
              <Text 
                variant="caption1" 
                weight="bold" 
                color="tertiary"
                vibrant
                className="uppercase tracking-[0.1em] text-[10px]"
              >
                Priority
              </Text>
              <Text as="span" weight="bold" color="blue" className="ml-2">
                {member.rolePriority ?? 0}
              </Text>
            </span>
            <span className={headerPill}>
              <span className={cn(
                'mr-2 h-2 w-2 rounded-full ring-1 transition-all duration-300',
                isDark ? 'ring-white/20 shadow-[0_0_8px_rgba(40,167,69,0.3)]' : 'ring-black/10 shadow-[0_0_4px_rgba(0,0,0,0.05)]',
                member.status === 'active' 
                  ? (isDark ? 'bg-[#28A745]' : 'bg-[#1E7E34]') 
                  : member.status === 'suspended'
                    ? (isDark ? 'bg-[#636366]' : 'bg-[#8E8E93]')
                    : (isDark ? 'bg-[#FF453A]' : 'bg-[#FF3B30]')
              )} />
              <Text as="span" variant="caption1" weight="bold" color="primary" className="capitalize">
                {member.status}
              </Text>
            </span>
          </div>
        </div>

        <Divider className={isDark ? 'opacity-20' : 'opacity-10'} />

        {/* Bento Grid - Member Insights */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-2">
          {/* Current Shift Status - High Relevance (2x2) */}
          <div className="md:col-span-2 xl:row-span-2 h-full">
            <ShiftInfoSection status={status} isDark={isDark} />
          </div>

          {/* Account Status (1x1) */}
          <section className="space-y-3">
            <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
              Account Status
            </Text>
            <div className={cn(surfaceCard, 'flex items-center gap-3 p-4 h-[72px]')}>
              <div className={cn(
                'h-3 w-3 rounded-full animate-pulse ring-2 transition-all duration-300',
                isDark ? 'ring-white/10 shadow-[0_0_12px_rgba(40,167,69,0.4)]' : 'ring-black/5 shadow-[0_0_8px_rgba(0,0,0,0.05)]',
                member.status === 'active' 
                  ? (isDark ? 'bg-[#28A745]' : 'bg-[#1E7E34]') 
                  : member.status === 'suspended'
                    ? (isDark ? 'bg-[#636366]' : 'bg-[#8E8E93]')
                    : (isDark ? 'bg-[#FF453A]' : 'bg-[#FF3B30]')
              )} />
              <div className="flex flex-col">
                <Text weight="semibold" color="primary" className="capitalize leading-tight">
                  {member.status === 'active' ? 'Active' : 'Suspended'}
                </Text>
                <Text variant="caption2" color="tertiary">Workspace visibility</Text>
              </div>
            </div>
          </section>

          {/* Joined Workspace (1x1) */}
          <section className="space-y-3">
            <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
              Joined Workspace
            </Text>
            <div className={cn(surfaceCard, 'p-4 flex flex-col justify-center h-[72px]')}>
              <Text weight="bold" color="primary" className="text-[17px] leading-tight">
                {formatDate(member.joinedAt)}
              </Text>
              <Text variant="caption2" color="tertiary">Enrollment date</Text>
            </div>
          </section>

          {/* Security & Role (1x1) */}
          <section className="space-y-3">
            <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
              Security & Role
            </Text>
            <div className={cn(surfaceCard, 'p-4 flex flex-col justify-center h-[72px]')}>
              <div className="flex items-center gap-2">
                <div className={cn('h-1.5 w-1.5 rounded-full', member.roleName ? 'bg-apple-blue' : 'bg-apple-gray-500')} />
                <Text weight="bold" color={member.roleName ? "blue" : "tertiary"} className="text-[17px] leading-tight truncate">
                  {member.roleName || 'No Role Assigned'}
                </Text>
              </div>
            </div>
          </section>

          {/* Last Connection (1x1) */}
          <section className="space-y-3">
            <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
              Last Connection
            </Text>
            <div className={cn(surfaceCard, 'p-4 flex flex-col justify-center h-[72px]')}>
              {status.presence?.isConnected ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full animate-pulse shadow-sm",
                      isDark ? "bg-[#28A745]" : "bg-[#1E7E34]"
                    )} />
                    <Text 
                      weight="bold" 
                      className={cn(
                        "text-[17px] leading-tight",
                        isDark ? "text-[#28A745]" : "text-[#1E7E34]"
                      )}
                    >
                      Connected
                    </Text>
                  </div>
                  <Text variant="caption2" color="tertiary">
                    Since {status.presence.connectedAt ? new Date(status.presence.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                  </Text>
                </>
              ) : (
                <>
                  <Text weight="bold" color="primary" className="text-[17px] leading-tight">
                    {member.lastActiveAt ? formatDateTime(member.lastActiveAt) : 'Never'}
                  </Text>
                  <Text variant="caption2" color="tertiary">Last interaction</Text>
                </>
              )}
            </div>
          </section>
        </div>

        <Divider className={isDark ? 'opacity-20' : 'opacity-10'} />

        {/* Shift Management Section */}
        <div className="relative z-10 px-2 space-y-6">
          <div className="flex flex-col gap-4">
            <Text variant="title2" weight="bold" color="primary">Shift Management</Text>
            <ShiftFilters 
              period={period} 
              onPeriodChange={setPeriod}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isDark={isDark}
            />
          </div>

          {/* Stats Summary */}
          <ShiftStatsCards stats={stats} isDark={isDark} />

          {/* Detailed Content Grid */}
          <div className="min-h-[500px]">
            <ShiftHistorySection stats={stats} viewMode={viewMode} isDark={isDark} />
          </div>
        </div>

        {/* Footer Action */}
        <div className="relative z-10 flex justify-center pt-8">
          <Button 
            onClick={onClose} 
            variant={isDark ? "gray" : "secondary"} 
            size="lg" 
            className={cn(
              "rounded-full px-16 h-[52px] text-[17px] font-bold transition-all active:scale-95 shadow-lg",
              isDark ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/10"
            )}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
