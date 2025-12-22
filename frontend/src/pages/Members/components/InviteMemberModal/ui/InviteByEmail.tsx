import { Input, Button, Select, Text } from '@/components/ui';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface InviteByEmailProps {
  onInvite: (email: string, roleId?: string) => Promise<void>;
  isLoading: boolean;
  roles: { id: string; name: string }[];
  isDark: boolean;
}

export function InviteByEmail({ onInvite, isLoading, roles, isDark }: InviteByEmailProps) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await onInvite(email, roleId || undefined);
    setEmail('');
  };

  return (
    <div className="space-y-3">
      <Text variant="caption1" weight="bold" color="secondary" className="uppercase tracking-widest px-1">
        Invite by Email
      </Text>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-[15px]"
          />
          <Select
            value={roleId}
            onChange={setRoleId}
            options={[
              { value: '', label: 'Select Role (Optional)' },
              ...roles.map(r => ({ value: r.id, label: r.name }))
            ]}
            className="text-[15px]"
          />
        </div>
        <Button 
          type="submit" 
          variant="filled"
          loading={isLoading}
          className="rounded-xl h-12 font-bold shadow-apple-md w-full md:w-auto self-end px-8"
        >
          Send Invite
        </Button>
      </form>
    </div>
  );
}
