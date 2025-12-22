import { Modal, Divider } from '@/components/ui';
import { useInvitation } from '../../hooks/useInvitation';
import { useRoles } from '../../hooks/useRoles';
import { InviteByEmail } from './ui/InviteByEmail';
import { ShareInviteLink } from './ui/ShareInviteLink';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  
  const { 
    invitationToken, 
    isGenerating, 
    generateInvitation, 
    getInvitationLink 
  } = useInvitation();

  const { roles } = useRoles();

  const handleInviteByEmail = async (email: string, roleId?: string) => {
    await generateInvitation(roleId, email);
    // In a real app, the backend would send the email. 
    // Here we just generate the token to show success.
  };

  const inviteLink = invitationToken ? getInvitationLink(invitationToken) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Members"
      size="md"
      className={cn(
        'rounded-[2.2rem] shadow-apple-float overflow-hidden border backdrop-blur-[20px] saturate-[180%]',
        isDark ? 'bg-[#0A0A0B]/90 border-white/10' : 'bg-[#FFFFFF]/95 border-black/[0.08]'
      )}
    >
      <div className="space-y-4 py-2">
        <InviteByEmail 
          onInvite={handleInviteByEmail} 
          isLoading={isGenerating} 
          roles={roles}
          isDark={isDark}
        />

        <Divider className={cn(
          "my-2",
          isDark ? 'border-white/20 bg-white/20' : 'border-black/[0.12] bg-black/[0.12]'
        )} />

        <ShareInviteLink 
          inviteLink={inviteLink}
          onGenerate={() => generateInvitation()}
          isGenerating={isGenerating}
          isDark={isDark}
        />
      </div>
    </Modal>
  );
}
