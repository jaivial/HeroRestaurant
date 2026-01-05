import { memo, useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Modal, Input, Button, Textarea, Select, MultiSelect } from '@/components/ui';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker/TimePicker';
import { isReservationFormOpenAtom, formInitialDataAtom, tablesAtom } from '../atoms/bookingAtoms';
import { useBookingForm } from '../hooks/useBookingForm';
import type { ReservationFormProps, BookingFormData, Table } from '../types';

const dietaryOptions = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'dairy_free', label: 'Dairy Free' },
  { value: 'nut_allergy', label: 'Nut Allergy' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const sourceOptions = [
  { value: 'phone', label: 'Phone' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'online', label: 'Online' },
  { value: 'third_party', label: 'Third Party' },
  { value: 'staff', label: 'Staff' },
];

export const ReservationForm = memo(function ReservationForm({
  isOpen,
  onClose,
  booking,
  initialDate,
  initialTime,
  onSubmit,
}: ReservationFormProps) {
  const [isOpenState, setIsOpenState] = useAtom(isReservationFormOpenAtom);
  const tables = useAtomValue(tablesAtom);
  const setFormInitialData = useSetAtom(formInitialDataAtom);

  useEffect(() => {
    setIsOpenState(isOpen);
    if (isOpen) {
      setFormInitialData({
        date: initialDate,
        time: initialTime,
        booking,
      });
    }
  }, [isOpen, initialDate, initialTime, booking, setIsOpenState, setFormInitialData]);

  const handleClose = () => {
    setIsOpenState(false);
    onClose();
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useBookingForm({
    booking,
    initialDate,
    initialTime,
    onSubmit: async (data: BookingFormData) => {
      await onSubmit(data);
      handleClose();
    },
  });

  const availableTables = tables.filter(t => t.capacity >= values.partySize);

  return (
    <Modal
      isOpen={isOpenState}
      onClose={handleClose}
      title={booking ? 'Edit Reservation' : 'New Reservation'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Guest Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Guest Name"
              value={values.guestName}
              onChange={(e) => setFieldValue('guestName', e.target.value)}
              onBlur={() => handleBlur('guestName')}
              error={errors.guestName}
              placeholder="John Doe"
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={values.guestPhone}
              onChange={(e) => setFieldValue('guestPhone', e.target.value)}
              onBlur={() => handleBlur('guestPhone')}
              error={errors.guestPhone}
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>

          <Input
            label="Email (optional)"
            type="email"
            value={values.guestEmail}
            onChange={(e) => setFieldValue('guestEmail', e.target.value)}
            onBlur={() => handleBlur('guestEmail')}
            error={errors.guestEmail}
            placeholder="john@example.com"
          />
        </div>

        {/* Reservation Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Reservation Details
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DatePicker
              value={values.date}
              onChange={(value) => setFieldValue('date', value)}
              min={new Date().toISOString().split('T')[0]}
            />

            <TimePicker
              value={values.startTime}
              onChange={(value) => setFieldValue('startTime', value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Party Size
              </label>
              <select
                value={values.partySize}
                onChange={(e) => setFieldValue('partySize', parseInt(e.target.value))}
                className="w-full h-[44px] px-4 bg-white/72 dark:bg-black/50 backdrop-blur-[20px] border border-white/[0.18] dark:border-white/10 rounded-[1rem] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration
              </label>
              <select
                value={values.duration}
                onChange={(e) => setFieldValue('duration', parseInt(e.target.value))}
                className="w-full h-[44px] px-4 bg-white/72 dark:bg-black/50 backdrop-blur-[20px] border border-white/[0.18] dark:border-white/10 rounded-[1rem] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={150}>2.5 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Table Assignment
          </h3>

          {availableTables.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => setFieldValue('tableId', values.tableId === table.id ? null : table.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    ${values.tableId === table.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-white/[0.18] dark:border-white/10 hover:border-blue-300'
                    }
                  `}
                >
                  <div className="font-medium text-sm">{table.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {table.capacity} seats
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Text color="secondary">No available tables for this party size</Text>
          )}
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Additional Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source
              </label>
              <select
                value={values.source}
                onChange={(e) => setFieldValue('source', e.target.value as any)}
                className="w-full h-[44px] px-4 bg-white/72 dark:bg-black/50 backdrop-blur-[20px] border border-white/[0.18] dark:border-white/10 rounded-[1rem] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dietary Requirements
              </label>
              <select
                multiple
                value={values.dietaryRequirements}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                  setFieldValue('dietaryRequirements', selected);
                }}
                className="w-full h-[44px] px-4 bg-white/72 dark:bg-black/50 backdrop-blur-[20px] border border-white/[0.18] dark:border-white/10 rounded-[1rem] text-[15px] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {dietaryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Special Notes"
            value={values.notes}
            onChange={(e) => setFieldValue('notes', e.target.value)}
            placeholder="Any special requests or notes..."
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="rounded-[1rem]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="rounded-[1rem] shadow-apple-md"
          >
            {booking ? 'Update Reservation' : 'Create Reservation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
});
