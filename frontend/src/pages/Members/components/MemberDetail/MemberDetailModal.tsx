import { Modal, Text, Avatar, Badge, Divider, Button } from '@/components/ui';
import type { Member } from '@/atoms/memberAtoms';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

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
  const innerStroke = isDark ? 'border-white/10' : 'border-black/[0.08]';
  const surfaceCard = cn(
    'rounded-[1rem] border transition-all duration-200',
    glassBase,
    innerStroke,
    isDark ? 'bg-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]' : 'bg-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
  );

  const headerPill = cn(
    'inline-flex items-center justify-center rounded-full border px-4 py-1.5 h-8',
    glassBase,
    innerStroke,
    isDark ? 'bg-white/5' : 'bg-black/[0.03]'
  );

  // Semantic Backgrounds
  const modalBg = isDark ? 'bg-[#0A0A0B]/90' : 'bg-[#FFFFFF]/95';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      size="lg"
      className={cn(
        'rounded-[2.2rem] shadow-apple-float overflow-hidden border',
        glassBase,
        innerStroke,
        modalBg
      )}
    >
      <div className="relative space-y-8 pb-4">
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
              status={member.status === 'active' ? 'online' : 'offline'}
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
            <Text variant="callout" color="tertiary" className="font-medium opacity-80">
              ID: {member.id}
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
                isDark ? 'ring-white/20 shadow-[0_0_8px_rgba(48,209,88,0.3)]' : 'ring-black/10 shadow-[0_0_4px_rgba(0,0,0,0.05)]',
                member.status === 'active' 
                  ? (isDark ? 'bg-[#30D158]' : 'bg-[#34C759]') 
                  : (isDark ? 'bg-[#FF453A]' : 'bg-[#FF3B30]')
              )} />
              <Text as="span" variant="caption1" weight="bold" color="primary" className="capitalize">
                {member.status}
              </Text>
            </span>
          </div>
        </div>

        <Divider className={isDark ? 'opacity-10' : 'opacity-5'} />

        {/* Info Grid - 8pt Grid spacing */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
          <div className="space-y-8">
            <section className="space-y-3">
              <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
                Account Status
              </Text>
              <div className={cn(surfaceCard, 'flex items-center gap-3 p-4')}>
                <div className={cn(
                  'h-3 w-3 rounded-full animate-pulse ring-2 transition-all duration-300',
                  isDark ? 'ring-white/10 shadow-[0_0_12px_rgba(48,209,88,0.4)]' : 'ring-black/5 shadow-[0_0_8px_rgba(0,0,0,0.05)]',
                  member.status === 'active' 
                    ? (isDark ? 'bg-[#30D158]' : 'bg-[#34C759]') 
                    : (isDark ? 'bg-[#FF453A]' : 'bg-[#FF3B30]')
                )} />
                <div className="flex flex-col">
                  <Text weight="semibold" color="primary" className="capitalize">
                    {member.status === 'active' ? 'Verified Member' : 'Account Inactive'}
                  </Text>
                  <Text variant="caption2" color="tertiary">Current workspace visibility</Text>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
                Joined Workspace
              </Text>
              <div className={cn(surfaceCard, 'p-4 flex flex-col gap-1')}>
                <Text weight="bold" color="primary" className="text-[17px]">
                  {formatDate(member.joinedAt)}
                </Text>
                <Text variant="caption2" color="tertiary">Initial enrollment date</Text>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-3">
              <Text variant="caption1" weight="bold" color="tertiary" vibrant className="uppercase tracking-widest pl-1">
                Last Activity
              </Text>
              <div className={cn(surfaceCard, 'p-4 flex flex-col gap-1')}>
                <Text weight="bold" color="primary" className="text-[17px]">
                  {member.lastActiveAt ? formatDateTime(member.lastActiveAt) : 'Never'}
                </Text>
                <Text variant="caption2" color="tertiary">Last synchronized interaction</Text>
              </div>
            </section>

            <section className="space-y-3">
              <Text 
                variant="caption1" 
                weight="bold" 
                color="tertiary"
                vibrant
                className="uppercase tracking-widest pl-1"
              >
                Security & Role
              </Text>
              <div className={cn(surfaceCard, 'p-4 space-y-2')}>
                <div className="flex items-center gap-2">
                  <div className={cn('h-1.5 w-1.5 rounded-full', member.roleName ? 'bg-apple-blue' : 'bg-apple-gray-500')} />
                  <Text 
                    weight="bold" 
                    color={member.roleName ? "blue" : "tertiary"}
                    className="text-[17px]"
                  >
                    {member.roleName || 'No Role Assigned'}
                  </Text>
                </div>
                <Text variant="footnote" color="secondary" className="leading-snug opacity-90">
                  {member.roleName
                    ? 'Permissions are dynamically managed by workspace policies.'
                    : 'Assign a role to grant workspace access and set authority levels.'}
                </Text>
              </div>
            </section>
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