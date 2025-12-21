import { memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Text } from '@/components/ui/Text/Text';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import type { SettingsSectionProps } from '../../types';
import type { OpeningHour, MealSchedules } from '@/types';

const DAYS = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
} as const;

const MEALS = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  lunch: 'Lunch',
  merienda: 'Merienda',
  dinner: 'Dinner',
} as const;

export const ScheduleSection = memo(({ formData, onScheduleChange, onMealChange }: SettingsSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Opening Hours */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Opening Hours</CardTitle>
            <Text variant="caption" color="secondary">Set when your restaurant is open to the public.</Text>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {formData.openingHours.map((hour: OpeningHour) => (
            <div key={hour.day} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <div className="w-32">
                <Text weight="semibold">{DAYS[hour.day]}</Text>
              </div>
              
              <div className="flex items-center gap-4 flex-1">
                <Button
                  type="button"
                  variant={hour.isOpen ? 'filled' : 'gray'}
                  className="w-24 h-9"
                  onClick={() => onScheduleChange?.(hour.day, 'isOpen', !hour.isOpen)}
                >
                  {hour.isOpen ? 'Open' : 'Closed'}
                </Button>
                
                {hour.isOpen && (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      value={hour.openTime}
                      onChange={(e) => onScheduleChange?.(hour.day, 'openTime', e.target.value)}
                      className="h-9"
                    />
                    <Text variant="caption" color="secondary">to</Text>
                    <Input
                      type="time"
                      value={hour.closeTime}
                      onChange={(e) => onScheduleChange?.(hour.day, 'closeTime', e.target.value)}
                      className="h-9"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Service Schedules */}
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle>Service Schedules</CardTitle>
            <Text variant="caption" color="secondary">Define specific times for different meal services.</Text>
          </div>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(MEALS).map(([key, label]) => {
            const meal = formData.mealSchedules[key as keyof MealSchedules];
            return (
              <div key={key} className="space-y-4 p-6 rounded-[1.5rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <Text weight="bold">{label}</Text>
                  <Button
                    type="button"
                    variant={meal.enabled ? 'filled' : 'gray'}
                    className="h-8 px-4"
                    onClick={() => onMealChange?.(key, 'enabled', !meal.enabled)}
                  >
                    {meal.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                {meal.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Time"
                      type="time"
                      value={meal.startTime}
                      onChange={(e) => onMealChange?.(key, 'startTime', e.target.value)}
                      className="h-9"
                    />
                    <Input
                      label="End Time"
                      type="time"
                      value={meal.endTime}
                      onChange={(e) => onMealChange?.(key, 'endTime', e.target.value)}
                      className="h-9"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
});

ScheduleSection.displayName = 'ScheduleSection';

