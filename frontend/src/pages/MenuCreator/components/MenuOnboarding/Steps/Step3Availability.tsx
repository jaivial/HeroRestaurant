// src/pages/MenuCreator/components/MenuOnboarding/Steps/Step3Availability.tsx
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../../../atoms/themeAtoms';
import { useStep3Availability } from '../../../hooks/useStep3Availability';
import { Heading, Text } from '../../../../../components/ui/Text/Text';
import { Card, CardContent } from '../../../../../components/ui/Card/Card';
import { Toggle } from '../../../../../components/ui/Toggle/Toggle';
import { cn } from '../../../../../utils/cn';

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

export function Step3Availability() {
  // ✅ Layer 2: Business logic in custom hook
  const { 
    menu, 
    settings, 
    toggleDay, 
    toggleMealCompletely 
  } = useStep3Availability();

  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const renderSchedule = (meal: 'breakfast' | 'lunch' | 'dinner', label: string) => {
    const isMealOpen = settings?.mealSchedules?.[meal] ?? true;
    if (!isMealOpen) return null;

    const selectedDays = menu?.availability?.[meal] || [];
    const isMealActive = selectedDays.length > 0;

    return (
      <Card 
        className={cn(
          "transition-all duration-500 border-2 p-2 rounded-[2.2rem]",
          isMealActive 
            ? isDark ? "border-apple-blue bg-[#252525] shadow-apple-xl" : "border-black bg-black/5 shadow-apple-xl"
            : isDark ? "border-[#616161] bg-[#000000] hover:border-[#9E9E9E] hover:bg-[#252525]" : "border-[#BDBDBD] bg-[#FFFFFF] hover:border-black/30 hover:bg-[#F2F2F7]"
        )}
      >
        <CardContent className="p-6 space-y-6">
          <div 
            className="flex items-center justify-between p-4 rounded-2xl transition-colors cursor-pointer group"
            onClick={() => toggleMealCompletely(meal, !isMealActive)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                isMealActive 
                  ? isDark ? "border-apple-blue bg-apple-blue" : "border-black bg-black"
                  : isDark ? "border-[#A1A1A6] bg-[#0A0A0B]" : "border-[#424245] bg-[#E5E5EA]"
              )}>
                {isMealActive && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
              </div>
              <div className="space-y-1">
                <Text weight="semibold" className={cn("text-xl capitalize", isMealActive && (isDark ? "text-white" : "text-black"))}>{label}</Text>
                <Text variant="footnote" color="secondary" className="text-base">Select days this menu is available for {label}</Text>
              </div>
            </div>
            <Toggle checked={isMealActive} onChange={() => {}} className="pointer-events-none" />
          </div>

          {isMealActive && (
            <div className="flex flex-wrap gap-3 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {DAYS.map((day) => {
                const isRestaurantOpen = settings?.openingDays?.includes(day.id) ?? true;
                const isSelected = selectedDays.includes(day.id);
                
                return (
                  <button
                    key={day.id}
                    onClick={() => toggleDay(meal, day.id)}
                    disabled={!isRestaurantOpen}
                    type="button"
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-2",
                      isSelected 
                        ? isDark ? "bg-black border-[#616161] text-white shadow-apple-md scale-105 hover:border-[#9E9E9E]" : "bg-black border-black text-white shadow-apple-md scale-105 hover:bg-apple-gray-800"
                        : isDark ? "bg-white/80 border-[#616161] text-black/90 hover:border-[#9E9E9E] hover:bg-white hover:text-black hover:scale-105 shadow-sm" : "bg-[#F5F5F7] border-[#BDBDBD] text-[#757575] hover:border-black hover:bg-[#E5E5EA] hover:text-black hover:scale-105 shadow-sm",
                      !isRestaurantOpen && (isDark ? "opacity-30 cursor-not-allowed grayscale border-[#2C2C2E] bg-[#161617]" : "opacity-30 cursor-not-allowed grayscale border-[#E5E5EA] bg-[#F5F5F7] hover:scale-100 hover:border-[#E5E5EA] hover:bg-[#F5F5F7]")
                    )}
                  >
                    <Text weight="bold" variant="subheadline" className={cn("text-lg", isSelected ? "text-white" : "")}>{day.label}</Text>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Heading level={2} className="text-3xl font-bold tracking-tight">Availability</Heading>
        <Text color="secondary" className="text-lg">Configure when this menu is available to your customers.</Text>
      </div>

      <div className="space-y-8">
        {renderSchedule('breakfast', 'Breakfast')}
        {renderSchedule('lunch', 'Lunch')}
        {renderSchedule('dinner', 'Dinner')}
      </div>

      <div className={cn("p-6 rounded-[2.2rem] border-2 flex items-start gap-4", isDark ? "bg-[#0A0A0B] border-[#424245]" : "bg-[#F5F5F7] border-[#E5E5EA]")}>
        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", isDark ? "bg-[#424245]" : "bg-[#E5E5EA]")}>
          <svg className={cn("w-4 h-4", isDark ? "text-[#A1A1A6]" : "text-[#757575]")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </div>
        <Text variant="footnote" weight="medium" className={cn("text-base leading-relaxed", isDark ? "text-[#A1A1A6]" : "text-[#757575]")}>
          Note: Days marked as inactive are currently set as &quot;Closed&quot; in your restaurant settings.
        </Text>
      </div>
    </div>
  );
}
