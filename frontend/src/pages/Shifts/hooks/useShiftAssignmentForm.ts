// frontend/src/pages/Shifts/hooks/useShiftAssignmentForm.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MemberShiftSummary, NewScheduledShift, ScheduledShift } from '../types';

export function useShiftAssignmentForm(
  members: MemberShiftSummary[], 
  onSubmitAction: (data: NewScheduledShift) => Promise<any>,
  onClose: () => void,
  existingShift?: ScheduledShift
) {
  const [memberId, setMemberId] = useState(existingShift?.membership_id || '');
  const [date, setDate] = useState(() => {
    if (existingShift?.start_at) {
      return new Date(existingShift.start_at).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState(() => {
    if (existingShift?.start_at) {
      return new Date(existingShift.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return '09:00';
  });
  const [endTime, setEndTime] = useState(() => {
    if (existingShift?.end_at) {
      return new Date(existingShift.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return '17:00';
  });
  const [notes, setNotes] = useState(existingShift?.notes || '');
  const [color, setColor] = useState(existingShift?.color || '#34C759'); // Default Apple Green
  const [label, setLabel] = useState(existingShift?.label || 'Normal Shift');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (members.length > 0 && !memberId && !existingShift) {
      setMemberId(members[0].id);
    }
  }, [members, memberId, existingShift]);

  const handleSubmit = useCallback(async () => {
    if (!memberId || !date || !startTime || !endTime) {
      return;
    }

    setIsSubmitting(true);
    try {
      const start_at = new Date(`${date}T${startTime}`).toISOString();
      const end_at = new Date(`${date}T${endTime}`).toISOString();

      await onSubmitAction({
        membership_id: memberId,
        start_at,
        end_at,
        notes: notes || undefined,
        color,
        label
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to process shift:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [memberId, date, startTime, endTime, notes, color, label, onSubmitAction, onClose]);

  const memberOptions = useMemo(() => members.map(m => ({
    label: m.name,
    value: m.id
  })), [members]);

  return {
    memberId,
    setMemberId,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    notes,
    setNotes,
    color,
    setColor,
    label,
    setLabel,
    isSubmitting,
    isSuccess,
    onSubmit: handleSubmit,
    memberOptions,
    showDatePicker,
    setShowDatePicker,
    showStartTimePicker,
    setShowStartTimePicker,
    showEndTimePicker,
    setShowEndTimePicker,
    isEdit: !!existingShift
  };
}
