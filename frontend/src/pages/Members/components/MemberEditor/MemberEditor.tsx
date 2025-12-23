import { Modal, Select, Button, Text, Avatar } from '@/components/ui';
import { useMemberEditor } from '../../hooks/useMemberEditor';
import type { Member, Role } from '@/atoms/memberAtoms';

interface MemberEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberId: string, data: { roleId: string | null; status: string }) => Promise<void>;
  member: Member | null;
  roles: Role[];
  currentUserPriority: number;
}

export function MemberEditor({ isOpen, onClose, onSave, member, roles, currentUserPriority }: MemberEditorProps) {
  const {
    roleId,
    setRoleId,
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
  } = useMemberEditor(member, isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    setIsSubmitting(true);
    try {
      await onSave(member.id, {
        roleId: roleId || null,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter roles that the current user can assign (priority less than current user)
  const assignableRoles = roles.filter(role => role.display_order < currentUserPriority);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Member"
      size="md"
      className="rounded-[2.2rem] shadow-apple-float"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {member && (
          <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-surface-secondary/50 border border-surface-tertiary">
            <Avatar 
              src={member.user.avatarUrl || undefined} 
              name={member.user.name} 
              size="lg"
            />
            <div>
              <Text weight="bold" variant="headline">{member.user.name}</Text>
              <Text color="tertiary" variant="subheadline">Member</Text>
            </div>
          </div>
        )}

        <Select
          label="Workspace Role"
          value={roleId}
          onChange={(val) => setRoleId(val)}
          options={[
            { value: '', label: 'No Role' },
            ...assignableRoles.map(r => ({ value: r.id, label: `${r.name} (Priority: ${r.display_order})` }))
          ]}
          className="rounded-[1rem]"
        />

        <Select
          label="Status"
          value={status}
          onChange={(val) => setStatus(val as 'active' | 'suspended')}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          className="rounded-[1rem]"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} type="button" className="rounded-[1rem]">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} className="rounded-[1rem] shadow-apple-md">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

