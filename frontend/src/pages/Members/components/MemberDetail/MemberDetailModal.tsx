import { Modal, Avatar, Badge, Divider, Button } from '@/components/ui';
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

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/827a7c12-9c88-49e1-8128-1dae51d828e7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MemberDetailModal.tsx:13',message:'MemberDetailModal render',data:{isOpen, hasMember:!!member, memberId:member?.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D/E'})}).catch(()=>{});
  // #endregion
  if (!member) return null;

  const surfaceCard = cn(
    'rounded-[1.2rem] border backdrop-blur-xl transition-all duration-200',
    theme === 'dark'
      ? 'bg-white/[0.08] border-white/[0.15] hover:bg-white/[0.12] hover:border-white/20'
      : 'bg-black/[0.04] border-black/[0.08] hover:bg-black/[0.06] hover:border-black/[0.12]'
  );

  const headerPill = cn(
    'inline-flex items-center justify-center rounded-full border px-4 py-1.5 backdrop-blur-xl transition-all duration-200',
    theme === 'dark'
      ? 'bg-white/[0.08] border-white/[0.15] hover:bg-white/[0.12]'
      : 'bg-black/[0.04] border-black/[0.08] hover:bg-black/[0.06]'
  );

  const modalBg = theme === 'dark' ? 'bg-[#1C1C1E]' : 'bg-[#F5F5F7]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      size="lg"
      className={cn('rounded-[2.2rem] shadow-apple-float overflow-hidden', modalBg)}
    >
      <div className="relative space-y-6 pb-4">
        {/* Background decor with enhanced visibility */}
        <div className={cn(
          "pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl",
          theme === 'dark' ? 'bg-apple-blue/15' : 'bg-apple-blue/8'
        )} />
        <div className={cn(
          "pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full blur-3xl",
          theme === 'dark' ? 'bg-apple-purple/15' : 'bg-apple-purple/8'
        )} />

        {/* Header Section */}
        <div className="relative z-10 flex flex-col items-center text-center gap-4 pt-2">
          <Avatar
            src={member.user.avatarUrl || undefined}
            name={member.user.name}
            size="2xl"
            status={member.status === 'active' ? 'online' : 'offline'}
            className={cn(
              "ring-4 shadow-xl",
              theme === 'dark'
                ? 'ring-apple-blue/30 shadow-apple-blue/10'
                : 'ring-apple-blue/20 shadow-apple-blue/5'
            )}
          />
          
          <div className="space-y-1">
            <h1 className={cn(
              'text-3xl font-bold tracking-tight leading-tight',
              theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'
            )}>
              {member.user.name}
            </h1>
            <p className={cn(
              'text-sm mx-auto max-w-[52ch]',
              theme === 'dark' ? 'text-white/65' : 'text-[#1D1D1F]/55'
            )}>
              Member ID: {member.id}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge
              className={cn(
                'px-4 py-1.5 text-sm font-semibold rounded-full border backdrop-blur-xl transition-all duration-200',
                !member.roleName && cn(
                  'border-dashed',
                  theme === 'dark'
                    ? 'bg-white/[0.05] border-white/20 text-white/65'
                    : 'bg-black/[0.03] border-black/15 text-black/55'
                )
              )}
              style={member.roleName ? {
                backgroundColor: member.roleColor ? `${member.roleColor}${theme === 'dark' ? '20' : '15'}` : undefined,
                color: member.roleColor || undefined,
                borderColor: member.roleColor ? `${member.roleColor}${theme === 'dark' ? '40' : '30'}` : undefined,
                borderWidth: member.roleColor ? '1.5px' : '0',
              } : {}}
            >
              {member.roleName || 'No Role'}
            </Badge>
            <span className={headerPill}>
              <span className={cn(
                'text-xs font-bold uppercase tracking-widest',
                theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70'
              )}>
                Priority
              </span>
              <span className={cn(
                "ml-2 font-bold",
                theme === 'dark' ? 'text-apple-blue' : 'text-blue-600'
              )}>
                {member.rolePriority ?? 0}
              </span>
            </span>
            <span className={headerPill}>
              <span className={cn(
                'mr-2 h-2.5 w-2.5 rounded-full shadow-lg',
                member.status === 'active'
                  ? 'bg-apple-green shadow-apple-green/30'
                  : 'bg-apple-red shadow-apple-red/30'
              )} />
              <span className={cn(
                'font-semibold capitalize',
                theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'
              )}>
                {member.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </span>
          </div>
        </div>

        <Divider />

        {/* Info Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 px-1">
          <div className="space-y-6">
            <div>
              <label className={cn(
                'text-xs font-bold uppercase tracking-widest mb-3 block',
                theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70'
              )}>
                Account Status
              </label>
              <div className={cn(surfaceCard, 'flex items-center gap-3 p-4')}>
                <span className={cn(
                  'h-2.5 w-2.5 rounded-full shadow-lg',
                  member.status === 'active'
                    ? 'bg-apple-green shadow-apple-green/30'
                    : 'bg-apple-red shadow-apple-red/30'
                )} />
                <span className={cn(
                  'font-semibold capitalize',
                  theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]'
                )}>
                  {member.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div>
              <label className={cn(
                'text-xs font-bold uppercase tracking-widest mb-3 block',
                theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70'
              )}>
                Joined Workspace
              </label>
              <div className={cn(surfaceCard, 'p-4 font-semibold', theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]')}>
                {formatDate(member.joinedAt)}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className={cn(
                'text-xs font-bold uppercase tracking-widest mb-3 block',
                theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70'
              )}>
                Last Active
              </label>
              <div className={cn(surfaceCard, 'p-4 font-semibold', theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]')}>
                {member.lastActiveAt ? formatDateTime(member.lastActiveAt) : 'Never'}
              </div>
            </div>

            <div>
              <label className={cn(
                'text-xs font-bold uppercase tracking-widest mb-3 block',
                theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70'
              )}>
                Assigned Role
              </label>
              <div className={cn(surfaceCard, 'p-4 space-y-2')}>
                <h3 className={cn(
                  'font-bold block',
                  member.roleName
                    ? theme === 'dark' ? 'text-apple-blue' : 'text-blue-600'
                    : theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70'
                )}>
                  {member.roleName || 'No Role assigned'}
                </h3>
                <p className={cn('text-sm leading-relaxed', theme === 'dark' ? 'text-white/80' : 'text-[#1D1D1F]/70')}>
                  {member.roleName
                    ? 'Role and permissions are managed by your workspace administrator.'
                    : 'Assign a role to grant permissions and set priority.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center pt-4">
          <Button
            onClick={onClose}
            variant="secondary"
            size="lg"
            className={cn(
              "rounded-full px-12 font-bold shadow-apple-md transition-all duration-200",
              theme === 'dark'
                ? 'hover:bg-white/[0.15] hover:shadow-xl text-white'
                : 'hover:bg-black/[0.08] hover:shadow-xl text-[#1D1D1F]'
            )}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

