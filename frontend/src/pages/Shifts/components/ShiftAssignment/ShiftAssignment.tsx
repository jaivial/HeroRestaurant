// frontend/src/pages/Shifts/components/ShiftAssignment/ShiftAssignment.tsx

import { useMemo, useState, useEffect } from 'react';
import { 
  Input,
  Select, 
  Heading, 
  Text,
  Card,
  Spinner
} from '@/components/ui';
import type { ShiftAssignmentProps } from '../../types';
import { useShiftAssignment } from '../../hooks/useShiftAssignment';
import { useTeamShifts } from '../../hooks/useTeamShifts';
import { Search, UserX } from 'lucide-react';
import { AssignShiftModal } from './ui/AssignShiftModal';
import { MemberCard } from './ui/MemberCard';
import { MemberShiftOverview } from './ui/MemberShiftOverview';

export function ShiftAssignment({ restaurantId }: ShiftAssignmentProps) {
  const { assignShift } = useShiftAssignment(restaurantId);
  const { members, isLoading } = useTeamShifts(restaurantId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [punchFilter, setPunchFilter] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-select first member if none selected
  useEffect(() => {
    if (!selectedMemberId && members.length > 0) {
      const firstId = members[0].id;
      // Use requestAnimationFrame to avoid cascading renders
      requestAnimationFrame(() => setSelectedMemberId(firstId));
    }
  }, [members, selectedMemberId]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role_name === roleFilter;
      const matchesPunch = punchFilter === 'all' || 
                          (punchFilter === 'in' ? !!m.active_punch_in_at : !m.active_punch_in_at);
      
      return matchesSearch && matchesRole && matchesPunch;
    });
  }, [members, searchTerm, roleFilter, punchFilter]);

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId), 
  [members, selectedMemberId]);

  const roles = useMemo(() => {
    const uniqueRoles = Array.from(new Set(members.map(m => m.role_name).filter(Boolean)));
    return [{ label: 'All Roles', value: 'all' }, ...uniqueRoles.map(r => ({ label: r as string, value: r as string }))];
  }, [members]);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Member List */}
        <div className="w-full md:w-[380px] flex flex-col gap-4">
          <Card className="p-4 flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400" size={18} />
              <Input 
                placeholder="Search members..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Select 
                value={roleFilter} 
                onChange={setRoleFilter} 
                options={roles}
                className="h-10"
              />
              <Select 
                value={punchFilter} 
                onChange={setPunchFilter} 
                options={[
                  { label: 'All Punch', value: 'all' },
                  { label: 'Punched In', value: 'in' },
                  { label: 'Punched Out', value: 'out' }
                ]}
                className="h-10"
              />
            </div>
          </Card>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-[400px] pr-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <UserX size={48} className="mb-2" />
                <Text>No members found</Text>
              </div>
            ) : (
              filteredMembers.map(member => (
                <MemberCard 
                  key={member.id}
                  member={member}
                  isSelected={selectedMemberId === member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Side: Member Detail & Shifts */}
        <div className="flex-1 min-w-0">
          <Card className="p-8 h-full overflow-hidden">
            {selectedMember ? (
              <MemberShiftOverview 
                memberId={selectedMember.id}
                memberName={selectedMember.name}
                restaurantId={restaurantId}
                onQuickAssign={() => setIsModalOpen(true)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <UserX size={64} className="mb-4" />
                <Heading level={2}>Select a member</Heading>
                <Text>Select a team member from the list to view their shifts and assign new ones.</Text>
              </div>
            )}
          </Card>
        </div>
      </div>

      {isModalOpen && selectedMember && (
        <AssignShiftModal 
          members={[selectedMember]} 
          onClose={() => setIsModalOpen(false)}
          onAssign={assignShift}
        />
      )}
    </div>
  );
}
