import { Modal, Text, Avatar, Badge, Divider, Button } from '@/components/ui';
import type { Member } from '@/atoms/memberAtoms';
import { cn } from '@/utils/cn';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberDetailModal({ isOpen, onClose, member }: MemberDetailModalProps) {
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

  const surfaceCard = cn(
    'rounded-[1.2rem] border',
    'bg-black/[0.03] border-black/[0.06] dark:bg-white/5 dark:border-white/10'
  );

  const headerPill = cn(
    'inline-flex items-center justify-center rounded-full border px-4 py-1.5',
    'bg-black/[0.03] border-black/[0.06] dark:bg-white/5 dark:border-white/10'
  );

  // High-contrast text for dark mode readability
  const primaryText = 'text-[#1D1D1F] dark:text-white';
  const secondaryText = 'text-[#1D1D1F]/60 dark:text-white/70';
  const tertiaryText = 'text-[#1D1D1F]/45 dark:text-white/50';

  const modalBg = 'bg-[#FAF8F5] dark:bg-[#2C2A26]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      size="lg"
      className={cn('rounded-[2.2rem] shadow-apple-float overflow-hidden', modalBg)}
    >
      <div className="relative space-y-6 pb-4">
        {/* Background decor (single layer to avoid nested glass) */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-apple-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-apple-purple/10 blur-3xl" />

        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center gap-4 pt-2">
          <Avatar
            src={member.user.avatarUrl || undefined}
            name={member.user.name}
            size="2xl"
            status={member.status === 'active' ? 'online' : 'offline'}
            className="ring-4 ring-apple-blue/20"
          />
          
          <div className="space-y-1">
            <Text variant="title1" weight="bold" className={cn(primaryText, 'tracking-tight leading-tight')}>
              {member.user.name}
            </Text>
            <Text variant="subheadline" className={cn(tertiaryText, 'mx-auto max-w-[52ch]')}>
              Member ID: {member.id}
            </Text>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge 
              className={cn(
                'px-4 py-1.5 text-sm font-semibold rounded-full border',
                !member.roleName && 'bg-transparent border-dashed border-content-tertiary/50 text-content-tertiary'
              )}
              style={member.roleName ? {
                backgroundColor: member.roleColor ? `${member.roleColor}15` : undefined,
                color: member.roleColor || undefined,
                borderColor: member.roleColor ? `${member.roleColor}30` : undefined,
                borderWidth: member.roleColor ? '1px' : '0',
              } : {}}
            >
              {member.roleName || 'No Role'}
            </Badge>
            <span className={headerPill}>
              <Text variant="caption1" weight="bold" className={cn(tertiaryText, 'uppercase tracking-widest')}>
                Priority
              </Text>
              <Text as="span" weight="bold" className="ml-2 text-apple-blue">
                {member.rolePriority ?? 0}
              </Text>
            </span>
            <span className={headerPill}>
              <span className={cn('mr-2 h-2.5 w-2.5 rounded-full', member.status === 'active' ? 'bg-apple-green' : 'bg-apple-red')} />
              <Text as="span" weight="semibold" className={cn(primaryText, 'capitalize')}>
                {member.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </span>
          </div>
        </div>

        <Divider />

        {/* Info Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
          <div className="space-y-6">
            <div>
              <Text variant="caption1" weight="bold" className={cn(tertiaryText, 'uppercase tracking-widest mb-2 block')}>
                Account Status
              </Text>
              <div className={cn(surfaceCard, 'flex items-center gap-2 p-4')}>
                <span className={cn('h-2.5 w-2.5 rounded-full', member.status === 'active' ? 'bg-apple-green' : 'bg-apple-red')} />
                <Text weight="semibold" className={cn(primaryText, 'capitalize')}>
                  {member.status === 'active' ? 'Active' : 'Inactive'}
                </Text>
              </div>
            </div>

            <div>
              <Text variant="caption1" weight="bold" className={cn(tertiaryText, 'uppercase tracking-widest mb-2 block')}>
                Joined Workspace
              </Text>
              <Text weight="semibold" className={cn(surfaceCard, primaryText, 'p-4 block')}>
                {formatDate(member.joinedAt)}
              </Text>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Text variant="caption1" weight="bold" className={cn(tertiaryText, 'uppercase tracking-widest mb-2 block')}>
                Last Active
              </Text>
              <Text weight="semibold" className={cn(surfaceCard, primaryText, 'p-4 block')}>
                {member.lastActiveAt ? formatDateTime(member.lastActiveAt) : 'Never'}
              </Text>
            </div>

            <div>
              <Text variant="caption1" weight="bold" className={cn(tertiaryText, 'uppercase tracking-widest mb-2 block')}>
                Assigned Role
              </Text>
              <div className={cn(surfaceCard, 'p-4')}>
                <Text weight="bold" className={cn('block mb-1', member.roleName ? 'text-apple-blue' : tertiaryText)}>
                  {member.roleName || 'No Role assigned'}
                </Text>
                <Text variant="footnote" className={cn(secondaryText, 'leading-relaxed')}>
                  {member.roleName
                    ? 'Role and permissions are managed by your workspace administrator.'
                    : 'Assign a role to grant permissions and set priority.'}
                </Text>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center pt-4">
          <Button onClick={onClose} variant="secondary" size="lg" className="rounded-full px-12 font-bold shadow-apple-md">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

