// frontend/src/pages/Shifts/components/EditShiftModal/EditShiftModal.tsx

import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Modal } from '@/components/ui';
import type { EditShiftModalProps, NewScheduledShift } from '../../types';
import { useShiftAssignmentForm } from '../../hooks/useShiftAssignmentForm';
import { AssignShiftForm } from '../AssignShiftModal/ui/AssignShiftForm';
import { useCallback } from 'react';

export function EditShiftModal({ shift, members, onClose, onUpdate, onRemove }: EditShiftModalProps) {
  const isDark = useAtomValue(themeAtom) === 'dark';
  
  const handleUpdate = useCallback((data: NewScheduledShift) => {
    return onUpdate(data);
  }, [onUpdate]);

  const form = useShiftAssignmentForm(members, handleUpdate, onClose, shift);

  const handleRemove = useCallback(async () => {
    try {
      await onRemove(shift.id);
      onClose();
    } catch (error) {
      console.error('Failed to remove shift:', error);
    }
  }, [onRemove, shift.id, onClose]);

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={form.isSuccess ? "" : "Edit Work Shift"}
      size="md"
      className={isDark ? 'bg-black/90' : 'bg-white/95'}
    >
      <AssignShiftForm 
        {...form}
        onCancel={onClose}
        onRemove={handleRemove}
      />
    </Modal>
  );
}

