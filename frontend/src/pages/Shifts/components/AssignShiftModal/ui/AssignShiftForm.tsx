// frontend/src/pages/Shifts/components/ShiftAssignment/ui/AssignShiftForm.tsx

import { memo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { 
  Button, 
  Input, 
  Select, 
  Label,
  DatePicker,
  TimePicker,
  Text,
  Heading
} from '@/components/ui';
import type { AssignShiftFormProps } from '../../../types';
import { Calendar, Clock, Tag, Palette, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

const SHIFT_COLORS = [
  { name: 'Apple Green', value: '#34C759' },
  { name: 'Apple Blue', value: '#007AFF' },
  { name: 'Apple Orange', value: '#FF9500' },
  { name: 'Apple Red', value: '#FF3B30' },
  { name: 'Apple Purple', value: '#AF52DE' },
  { name: 'Apple Pink', value: '#FF2D55' },
  { name: 'Apple Yellow', value: '#FFCC00' },
  { name: 'Apple Indigo', value: '#5856D6' },
];

export const AssignShiftForm = memo(function AssignShiftForm({
  isEdit,
  onRemove,
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
  onSubmit,
  onCancel,
  memberOptions,
  showDatePicker,
  setShowDatePicker,
  showStartTimePicker,
  setShowStartTimePicker,
  showEndTimePicker,
  setShowEndTimePicker
}: AssignShiftFormProps) {
  const isDark = useAtomValue(themeAtom) === 'dark';
  const formRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (formRef.current) {
      const children = formRef.current.children;
      gsap.fromTo(children, 
        { 
          y: 30, 
          opacity: 0,
          scale: 0.95,
          filter: 'blur(10px)'
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.08,
          ease: 'expo.out',
          clearProps: 'all'
        }
      );
    }
  }, { scope: formRef });

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-apple-green/20 blur-2xl rounded-full animate-pulse" />
          <CheckCircle2 size={80} className="text-apple-green relative z-10 animate-bounce" />
        </div>
        <div className="text-center space-y-1">
          <Heading level={2}>{isEdit ? 'Shift Updated!' : 'Shift Assigned!'}</Heading>
          <Text color="secondary">The schedule has been updated successfully.</Text>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="space-y-6 py-4">
      <div className="space-y-1.5">
        <Label className="flex items-center gap-2">
          Team Member
        </Label>
        <Select 
          value={memberId} 
          onChange={setMemberId}
          options={memberOptions}
          placeholder="Select a member..."
          className="h-11"
          disabled={isEdit}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2">
            <Calendar size={14} /> Date
          </Label>
          <div className="relative group">
            <Input 
              value={date} 
              readOnly
              onClick={() => setShowDatePicker(true)}
              className="pl-10 h-11 cursor-pointer group-hover:border-apple-blue/50 transition-colors"
            />
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:text-apple-blue transition-colors pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-2">
            <Tag size={14} /> Shift Label
          </Label>
          <Input 
            placeholder="e.g. Morning, Kitchen, Server..." 
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2">
            <Clock size={14} /> Start Time
          </Label>
          <div className="relative group">
            <Input 
              value={startTime} 
              readOnly
              onClick={() => setShowStartTimePicker(true)}
              className="pl-10 h-11 cursor-pointer group-hover:border-apple-blue/50 transition-colors"
            />
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:text-apple-blue transition-colors pointer-events-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2">
            <Clock size={14} /> End Time
          </Label>
          <div className="relative group">
            <Input 
              value={endTime} 
              readOnly
              onClick={() => setShowEndTimePicker(true)}
              className="pl-10 h-11 cursor-pointer group-hover:border-apple-blue/50 transition-colors"
            />
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:text-apple-blue transition-colors pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Palette size={14} /> Visual Marker
        </Label>
        <div className="flex flex-wrap gap-3">
          {SHIFT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 active:scale-95",
                color === c.value ? "border-apple-blue scale-110 shadow-lg shadow-apple-blue/20" : "border-transparent"
              )}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Internal Notes (Optional)</Label>
        <Input 
          placeholder="Specific instructions for this shift..." 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-3 pt-6">
        <div className="flex gap-3">
          <Button variant="gray" onClick={onCancel} disabled={isSubmitting} className="flex-1 h-12 rounded-2xl">
            Cancel
          </Button>
          <Button 
            onClick={onSubmit} 
            loading={isSubmitting} 
            className="flex-1 h-12 rounded-2xl shadow-lg shadow-apple-blue/20"
          >
            {isEdit ? 'Update Shift' : 'Assign Shift'}
          </Button>
        </div>
        
        {isEdit && onRemove && (
          <Button 
            variant="plain" 
            onClick={onRemove} 
            disabled={isSubmitting}
            className="text-apple-red font-bold py-2 hover:bg-apple-red/5 rounded-xl"
          >
            Remove Shift
          </Button>
        )}
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
    </div>
  );
});
