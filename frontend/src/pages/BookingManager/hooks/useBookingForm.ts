import { useState, useCallback } from 'react';
import type { BookingFormData, Booking } from '../types';

interface UseBookingFormProps {
  booking?: Booking;
  initialDate?: string;
  initialTime?: string;
  onSubmit: (data: BookingFormData) => Promise<void>;
}

const initialValues: BookingFormData = {
  guestName: '',
  guestPhone: '',
  guestEmail: '',
  partySize: 2,
  date: new Date().toISOString().split('T')[0],
  startTime: '19:00',
  duration: 90,
  tableId: null,
  source: 'phone',
  notes: '',
  dietaryRequirements: [],
};

export function useBookingForm({ booking, initialDate, initialTime, onSubmit }: UseBookingFormProps) {
  const [values, setValues] = useState<BookingFormData>(() => {
    if (booking) {
      return {
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        guestEmail: booking.guestEmail ?? '',
        partySize: booking.partySize,
        date: booking.date,
        startTime: booking.startTime,
        duration: booking.durationMinutes,
        tableId: booking.tableId,
        source: booking.source,
        notes: booking.notes ?? '',
        dietaryRequirements: booking.dietaryRequirements,
      };
    }
    return {
      ...initialValues,
      date: initialDate ?? initialValues.date,
      startTime: initialTime ?? initialValues.startTime,
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof BookingFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!values.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    } else if (values.guestName.trim().length < 2) {
      newErrors.guestName = 'Name must be at least 2 characters';
    }

    if (!values.guestPhone.trim()) {
      newErrors.guestPhone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(values.guestPhone)) {
      newErrors.guestPhone = 'Invalid phone number format';
    }

    if (values.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.guestEmail)) {
      newErrors.guestEmail = 'Invalid email format';
    }

    if (values.partySize < 1) {
      newErrors.partySize = 'Party size must be at least 1';
    } else if (values.partySize > 20) {
      newErrors.partySize = 'Party size cannot exceed 20';
    }

    if (!values.date) {
      newErrors.date = 'Date is required';
    }

    if (!values.startTime) {
      newErrors.startTime = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleChange = useCallback(<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleBlur = useCallback(<K extends keyof BookingFormData>(key: K) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    validate();
  }, [validate]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue: handleChange,
  };
}
