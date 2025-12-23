import React, { useState, useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Modal, IconButton, Text, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  title?: string;
}

export function DatePicker({ isOpen, onClose, value, onChange, title = 'Select Date' }: DatePickerProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const selectedDate = useMemo(() => value ? new Date(value) : new Date(), [value]);

  const days = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0, Sun=6

    const result = [];
    
    // Padding
    for (let i = 0; i < startDay; i++) {
      result.push(null);
    }
    
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(year, month, d));
    }
    
    return result;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const handleDateSelect = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    onClose();
  };

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const yearName = currentMonth.getFullYear();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <Text weight="bold" className="text-[18px]">
              {monthName} <span className="opacity-40">{yearName}</span>
            </Text>
          </div>
          <div className="flex gap-1">
            <IconButton 
              icon={<ChevronLeft size={18} />} 
              variant="gray" 
              size="sm"
              onClick={() => changeMonth(-1)}
              className="rounded-full h-8 w-8"
            />
            <IconButton 
              icon={<ChevronRight size={18} />} 
              variant="gray" 
              size="sm"
              onClick={() => changeMonth(1)}
              className="rounded-full h-8 w-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((wd, i) => (
            <div key={i} className="h-8 flex items-center justify-center">
              <Text variant="caption" weight="bold" className="text-[10px] opacity-30">{wd}</Text>
            </div>
          ))}
          {days.map((date, idx) => (
            <div key={idx} className="h-10 flex items-center justify-center">
              {date ? (
                <button
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 text-[14px] font-medium",
                    selectedDate.toDateString() === date.toDateString()
                      ? "bg-apple-blue text-white shadow-lg scale-110"
                      : isDark 
                        ? "hover:bg-white/10 text-white" 
                        : "hover:bg-black/5 text-black",
                    date.toDateString() === new Date().toDateString() && selectedDate.toDateString() !== date.toDateString() && "text-apple-blue font-bold border border-apple-blue/30"
                  )}
                >
                  {date.getDate()}
                </button>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="plain" size="sm" onClick={() => handleDateSelect(new Date())}>
            Today
          </Button>
        </div>
      </div>
    </Modal>
  );
}
