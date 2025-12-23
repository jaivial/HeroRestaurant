import { Modal, Input, Textarea, Button, Text, Checkbox, Divider } from '@/components/ui';
import { PERMISSIONS, hasPermission } from '@/utils/permissions';
import { useRoleEditor } from '../../hooks/useRoleEditor';
import type { Role } from '@/atoms/memberAtoms';

interface RoleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description: string; displayOrder: number; color: string; permissions: string }) => Promise<void>;
  role?: Role | null;
  currentUserPriority: number;
}

const PERMISSION_GROUPS = [
  {
    name: 'General',
    permissions: [
      { key: 'VIEW_DASHBOARD', label: 'View Dashboard' },
      { key: 'VIEW_ANALYTICS', label: 'View Analytics' },
      { key: 'VIEW_AUDIT_LOG', label: 'View Audit Logs' },
    ]
  },
  {
    name: 'Orders & Tables',
    permissions: [
      { key: 'VIEW_ORDERS', label: 'View Orders' },
      { key: 'CREATE_ORDERS', label: 'Create Orders' },
      { key: 'UPDATE_ORDERS', label: 'Update Orders' },
      { key: 'CANCEL_ORDERS', label: 'Cancel Orders' },
      { key: 'VIEW_TABLES', label: 'View Tables' },
      { key: 'MANAGE_TABLES', label: 'Manage Tables' },
    ]
  },
  {
    name: 'Menu & Inventory',
    permissions: [
      { key: 'VIEW_MENU', label: 'View Menu' },
      { key: 'EDIT_MENU', label: 'Edit Menu' },
      { key: 'VIEW_INVENTORY', label: 'View Inventory' },
      { key: 'MANAGE_INVENTORY', label: 'Manage Inventory' },
    ]
  },
  {
    name: 'Members & Roles',
    permissions: [
      { key: 'VIEW_MEMBERS', label: 'View Members' },
      { key: 'INVITE_MEMBERS', label: 'Invite Members' },
      { key: 'MANAGE_MEMBERS', label: 'Manage Members' },
      { key: 'REMOVE_MEMBERS', label: 'Remove Members' },
      { key: 'MANAGE_ROLES', label: 'Manage Roles' },
    ]
  },
  {
    name: 'Settings & Billing',
    permissions: [
      { key: 'VIEW_SETTINGS', label: 'View Settings' },
      { key: 'EDIT_SETTINGS', label: 'Edit Settings' },
      { key: 'VIEW_BILLING', label: 'View Billing' },
      { key: 'MANAGE_BILLING', label: 'Manage Billing' },
    ]
  }
];

export function RoleEditor({ isOpen, onClose, onSave, role, currentUserPriority }: RoleEditorProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    displayOrder,
    setDisplayOrder,
    color,
    permissions,
    isSubmitting,
    setIsSubmitting,
    handleTogglePermission,
  } = useRoleEditor(role, currentUserPriority, isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        name,
        description,
        displayOrder,
        color,
        permissions: permissions.toString(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'Edit Role' : 'Create New Role'}
      size="lg"
      className="rounded-[2.2rem] shadow-apple-float"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Role Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Manager, Server"
            className="rounded-[1rem]"
          />
          <Input
            label="Priority (0-100)"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
            min={0}
            max={currentUserPriority - 1}
            required
            helperText={`Must be less than your priority (${currentUserPriority})`}
            className="rounded-[1rem]"
          />
        </div>

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What can this role do?"
          className="rounded-[1rem]"
        />

        <div>
          <Text weight="bold" className="mb-3 block">Permissions</Text>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.name} className="space-y-3">
                <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-wider">
                  {group.name}
                </Text>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.permissions.map((perm) => (
                    <div key={perm.key} className="flex items-center gap-3 p-3 rounded-[1rem] bg-surface-secondary/50 border border-surface-tertiary">
                      <Checkbox
                        id={perm.key}
                        checked={hasPermission(permissions, PERMISSIONS[perm.key as keyof typeof PERMISSIONS])}
                        onChange={() => handleTogglePermission(perm.key as keyof typeof PERMISSIONS)}
                      />
                      <label htmlFor={perm.key} className="text-sm font-medium cursor-pointer">
                        {perm.label}
                      </label>
                    </div>
                  ))}
                </div>
                <Divider />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose} type="button" className="rounded-[1rem]">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} className="rounded-[1rem] shadow-apple-md">
            {role ? 'Save Changes' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

