import { Modal, Input, Button, Text, Checkbox } from '@/components/ui';
import { PERMISSIONS, hasPermission } from '@/utils/permissions';
import { useRoleEditor } from '../../hooks/useRoleEditor';
import type { Role } from '@/atoms/memberAtoms';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import { useEffect } from 'react';

interface RoleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  role?: Role | null;
  currentUserPriority: number;
}

const PERMISSION_GROUPS = [
  {
    name: 'General',
    permissions: [
      { key: 'VIEW_DASHBOARD', label: 'Dashboard' },
      { key: 'VIEW_ANALYTICS', label: 'Analytics' },
      { key: 'VIEW_AUDIT_LOG', label: 'Audit Logs' },
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
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
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

  // Auto-generate description based on permissions
  useEffect(() => {
    if (!isOpen) return;
    
    const selectedLabels = PERMISSION_GROUPS.flatMap(group => 
      group.permissions
        .filter(perm => hasPermission(permissions, PERMISSIONS[perm.key as keyof typeof PERMISSIONS]))
        .map(perm => perm.label)
    );

    if (selectedLabels.length === 0) {
      setDescription('No permissions assigned');
    } else if (selectedLabels.length === PERMISSION_GROUPS.flatMap(g => g.permissions).length) {
      setDescription('Full administrative access with all permissions');
    } else {
      setDescription(`Access to: ${selectedLabels.join(', ')}`);
    }
  }, [permissions, isOpen, setDescription]);

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

  const modalBg = isDark ? 'bg-[#0A0A0B]' : 'bg-[#F5F5F7]';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? 'Edit Role' : 'Create New Role'}
      size="lg"
      className={cn('rounded-[2.2rem] shadow-apple-float overflow-hidden', modalBg)}
    >
      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Background decor */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-apple-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-apple-purple/10 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-widest px-1">
              Role Identity
            </Text>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Manager, Server"
              className={cn('rounded-2xl border-none h-12 text-lg font-medium ring-1 ring-inset', 
                isDark ? 'bg-white/5 ring-white/10 focus:ring-apple-blue' : 'bg-white ring-black/5 focus:ring-apple-blue shadow-sm')}
            />
          </div>
          <div className="space-y-2">
            <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-widest px-1">
              Priority Level
            </Text>
            <Input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value))}
              min={0}
              max={currentUserPriority - 1}
              required
              className={cn('rounded-2xl border-none h-12 text-lg font-medium ring-1 ring-inset', 
                isDark ? 'bg-white/5 ring-white/10 focus:ring-apple-blue' : 'bg-white ring-black/5 focus:ring-apple-blue shadow-sm')}
              helperText={
                <span className={cn('text-[10px] font-medium uppercase tracking-tighter', isDark ? 'text-white/30' : 'text-black/30')}>
                  Must be below {currentUserPriority}
                </span>
              }
            />
          </div>
        </div>

        <div className="relative z-10 p-4 rounded-2xl border bg-apple-blue/5 border-apple-blue/10">
          <Text variant="caption1" weight="bold" color="blue" className="uppercase tracking-widest mb-1 block">
            Auto-generated Description
          </Text>
          <Text color="secondary" className="leading-relaxed text-sm italic">
            &quot;{description}&quot;
          </Text>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <Text variant="caption1" weight="bold" color="tertiary" className="uppercase tracking-widest">
              Permissions Map
            </Text>
            <Text variant="caption2" color="tertiary">
              Select capabilities for this role
            </Text>
          </div>
          
          <div className="space-y-8 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.name} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-current opacity-10" />
                  <Text variant="caption1" weight="bold" color="secondary" className="uppercase tracking-widest text-[10px]">
                    {group.name}
                  </Text>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-current opacity-10" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.permissions.map((perm) => {
                    const isChecked = hasPermission(permissions, PERMISSIONS[perm.key as keyof typeof PERMISSIONS]);
                    return (
                      <label
                        key={perm.key}
                        htmlFor={perm.key}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer group',
                          isChecked 
                            ? (isDark ? 'bg-apple-blue/10 border-apple-blue/30' : 'bg-apple-blue/5 border-apple-blue/20 shadow-sm')
                            : (isDark ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-white border-black/5 hover:border-black/10 shadow-sm')
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                          isChecked 
                            ? 'bg-apple-blue border-apple-blue' 
                            : (isDark ? 'border-white/20' : 'border-black/10 group-hover:border-black/20')
                        )}>
                          {isChecked && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <Checkbox
                          id={perm.key}
                          checked={isChecked}
                          onChange={() => handleTogglePermission(perm.key as keyof typeof PERMISSIONS)}
                          className="hidden"
                        />
                        <Text weight="medium" color={isChecked ? "primary" : "secondary"} className="text-sm transition-colors">
                          {perm.label}
                        </Text>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={cn("relative z-10 flex justify-end gap-3 pt-6 border-t", isDark ? "border-white/5" : "border-black/5")}>
          <Button variant="ghost" onClick={onClose} type="button" className="rounded-full px-6 font-semibold">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting} 
            className="rounded-full px-8 font-bold shadow-apple-md bg-apple-blue text-white hover:bg-apple-blue/90"
          >
            {role ? 'Update Role' : 'Create Role'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
