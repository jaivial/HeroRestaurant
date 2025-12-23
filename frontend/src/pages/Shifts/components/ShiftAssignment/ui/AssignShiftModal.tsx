// frontend/src/pages/Shifts/components/ShiftAssignment/ui/AssignShiftModal.tsx

import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { 
  Modal, 
  Button, 
  Input, 
  Select, 
  Label,
  DatePicker,
  TimePicker
} from '@/components/ui';
import type { MemberShiftSummary, NewScheduledShift } from '../../../types';
import { Calendar, Clock } from 'lucide-react';

interface AssignShiftModalProps {
  members: MemberShiftSummary[];
  onClose: () => void;
  onAssign: (data: NewScheduledShift) => Promise<any>;
}

export function AssignShiftModal({ members, onClose, onAssign }: AssignShiftModalProps) {
  const theme = useAtomValue(themeAtom);

  const [memberId, setMemberId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (members.length > 0 && !memberId) {
      setMemberId(members[0].id);
    }
  }, [members, memberId]);

  const handleSubmit = async () => {
    if (!memberId || !date || !startTime || !endTime) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const start_at = new Date(`${date}T${startTime}`).toISOString();
      const end_at = new Date(`${date}T${endTime}`).toISOString();

      await onAssign({
        membership_id: memberId,
        start_at,
        end_at,
        notes: notes || undefined
      });
      onClose();
    } catch {
      alert('Failed to assign shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberOptions = members.map(m => ({
    label: m.name,
    value: m.id
  }));

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Assign Work Shift"
      size="md"
      className={theme === 'dark' ? 'bg-black/90' : 'bg-white/95'}
    >
      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label>Team Member</Label>
          <Select 
            value={memberId} 
            onChange={setMemberId}
            options={memberOptions}
            placeholder="Select a member..."
          />
        </div>

        <div className="space-y-1.5">
          <Label>Date</Label>
          <div className="relative">
            <Input 
              value={date} 
              readOnly
              onClick={() => setShowDatePicker(true)}
              className="pl-10 cursor-pointer"
            />
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Time</Label>
            <div className="relative">
              <Input 
                value={startTime} 
                readOnly
                onClick={() => setShowStartTimePicker(true)}
                className="pl-10 cursor-pointer"
              />
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>End Time</Label>
            <div className="relative">
              <Input 
                value={endTime} 
                readOnly
                onClick={() => setShowEndTimePicker(true)}
                className="pl-10 cursor-pointer"
              />
              <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Notes (Optional)</Label>
          <Input 
            placeholder="Additional details..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="gray" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            Assign Shift
          </Button>
        </div>
      </div>

      <DatePicker 
        isOpen={showDatePicker} 
        onClose={() => setShowDatePicker(false)} 
        value={date} 
        onChange={setDate} 
      />

      <TimePicker 
        isOpen={showStartTimePicker} 
        onClose={() => setShowStartTimePicker(false)} 
        value={startTime} 
        onChange={setStartTime}
        title="Start Time"
      />

      <TimePicker 
        isOpen={showEndTimePicker} 
        onClose={() => setShowEndTimePicker(false)} 
        value={endTime} 
        onChange={setEndTime}
        title="End Time"
      />
    </Modal>
  );
}
