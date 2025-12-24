// frontend/src/pages/Shifts/components/ShiftAssignment/AssignShiftModal.tsx

import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Modal } from '@/components/ui';
import type { AssignShiftModalProps } from '../../types';
import { useShiftAssignmentForm } from '../../hooks/useShiftAssignmentForm';
import { AssignShiftForm } from './ui/AssignShiftForm';

export function AssignShiftModal({ members, onClose, onAssign }: AssignShiftModalProps) {
  const isDark = useAtomValue(themeAtom) === 'dark';
  const form = useShiftAssignmentForm(members, onAssign, onClose);

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={form.isSuccess ? "" : "Assign Work Shift"}
      size="md"
      className={isDark ? 'bg-black/90' : 'bg-white/95'}
    >
      <AssignShiftForm 
        {...form}
        onCancel={onClose}
      />
    </Modal>
  );
}
