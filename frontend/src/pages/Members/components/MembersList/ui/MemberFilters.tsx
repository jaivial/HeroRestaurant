import { memo } from 'react';
import { Input, Select, IconButton } from '@/components/ui';
import type { Role } from '@/atoms/memberAtoms';
import { cn } from '@/utils/cn';

interface MemberFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  roleId: string;
  onRoleChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  roles: Role[];
  onReset: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MemberFilters = memo(function MemberFilters({
  search,
  onSearchChange,
  roleId,
  onRoleChange,
  status,
  onStatusChange,
  roles,
  onReset,
  className,
  style
}: MemberFiltersProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-end gap-4 mb-8", className)} style={style}>
      <div className="flex-1 w-full">
        <Input
          placeholder="Search members by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="rounded-[1.2rem]"
          leftIcon={
            <svg className="w-5 h-5 text-content-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>
      
      <div className="w-full md:w-48">
        <Select
          label="Role"
          value={roleId}
          onChange={onRoleChange}
          options={[
            { value: '', label: 'All Roles' },
            ...roles.map(r => ({ value: r.id, label: r.name }))
          ]}
          className="rounded-[1.2rem]"
        />
      </div>

      <div className="w-full md:w-40">
        <Select
          label="Status"
          value={status}
          onChange={onStatusChange}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
          ]}
          className="rounded-[1.2rem]"
        />
      </div>

      {(search || roleId || status) && (
        <IconButton
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          }
          onClick={onReset}
          variant="tinted"
          color="gray"
          size="md"
          label="Reset filters"
          className="rounded-full shadow-sm active:scale-90 transition-all"
        />
      )}
    </div>
  );
});
