import { useMemo, useRef, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Badge, Button } from '@/components/ui';
import type { ShiftHistoryItem } from '../../../types';
import { cn } from '@/utils/cn';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { safeParseDate } from '@/utils/time';

interface WeeklyCalendarProps {
  history: ShiftHistoryItem[];
  isDark?: boolean;
}

export function WeeklyCalendar({ history, isDark: propIsDark }: WeeklyCalendarProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = propIsDark !== undefined ? propIsDark : theme === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);

  // Group shifts by day (let's generate a range of 90 days around today for better scroll feel)
  const calendarDays = useMemo(() => {
    const days = [];
    const now = new Date();
    
    // Generate from 45 days ago to 45 days ahead
    for (let i = -45; i <= 45; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      const dateStr = date.toDateString();
      
      const dayShifts = history.filter(s => safeParseDate(s.punchInAt).toDateString() === dateStr);
      const totalMinutes = dayShifts.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
      
      days.push({
        date,
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        dayNumber: date.getDate(),
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()],
        shifts: dayShifts,
        totalMinutes,
        isToday: i === 0
      });
    }
    return days;
  }, [history]);

  const scrollToToday = useCallback((smooth = true) => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    const todayCard = scrollContainer.querySelector('[data-today="true"]');
    
    if (todayCard) {
      const isVertical = window.innerWidth < 768;
      const offset = isVertical
        ? (todayCard as HTMLElement).offsetTop - (scrollContainer.clientHeight / 2) + ((todayCard as HTMLElement).clientHeight / 2)
        : (todayCard as HTMLElement).offsetLeft - (scrollContainer.clientWidth / 2) + ((todayCard as HTMLElement).clientWidth / 2);
      
      gsap.to(scrollContainer, { 
        [isVertical ? 'scrollTop' : 'scrollLeft']: offset,
        duration: smooth ? 1.2 : 0,
        ease: "power3.out"
      });
    }
  }, []);

  useGSAP(() => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    let isDown = false;
    let startPos: number;
    let scrollPos: number;
    let velocity = 0;
    let lastPos = 0;

    const isVertical = () => window.innerWidth < 768;

    const onMouseDown = (e: MouseEvent) => {
// ... (rest of GSAP logic) ...
      isDown = true;
      scrollContainer.classList.add('active');
      const vertical = isVertical();
      startPos = (vertical ? e.pageY : e.pageX) - (vertical ? scrollContainer.offsetTop : scrollContainer.offsetLeft);
      scrollPos = vertical ? scrollContainer.scrollTop : scrollContainer.scrollLeft;
      lastPos = vertical ? e.pageY : e.pageX;
      gsap.killTweensOf(scrollContainer);
    };

    const onMouseLeave = () => {
      isDown = false;
      scrollContainer.classList.remove('active');
    };

    const onMouseUp = () => {
      isDown = false;
      scrollContainer.classList.remove('active');
      applyInertia();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const vertical = isVertical();
      const currentPos = vertical ? e.pageY : e.pageX;
      const x = currentPos - (vertical ? scrollContainer.offsetTop : scrollContainer.offsetLeft);
      const walk = (x - startPos) * 1.5;
      velocity = currentPos - lastPos;
      lastPos = currentPos;
      
      if (vertical) {
        scrollContainer.scrollTop = scrollPos - walk;
      } else {
        scrollContainer.scrollLeft = scrollPos - walk;
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      isDown = true;
      gsap.killTweensOf(scrollContainer);
      const vertical = isVertical();
      const currentPos = vertical ? e.touches[0].pageY : e.touches[0].pageX;
      startPos = currentPos - (vertical ? scrollContainer.offsetTop : scrollContainer.offsetLeft);
      scrollPos = vertical ? scrollContainer.scrollTop : scrollContainer.scrollLeft;
      lastPos = currentPos;
    };

    const onTouchEnd = () => {
      isDown = false;
      applyInertia();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDown) return;
      const vertical = isVertical();
      const currentPos = vertical ? e.touches[0].pageY : e.touches[0].pageX;
      const x = currentPos - (vertical ? scrollContainer.offsetTop : scrollContainer.offsetLeft);
      const walk = (x - startPos) * 1.5;
      velocity = currentPos - lastPos;
      lastPos = currentPos;
      
      if (vertical) {
        scrollContainer.scrollTop = scrollPos - walk;
      } else {
        scrollContainer.scrollLeft = scrollPos - walk;
      }
    };

    const applyInertia = () => {
      if (Math.abs(velocity) < 1) return;
      
      const vertical = isVertical();
      const target = vertical 
        ? { scrollTop: scrollContainer.scrollTop - (velocity * 15) }
        : { scrollLeft: scrollContainer.scrollLeft - (velocity * 15) };

      gsap.to(scrollContainer, {
        ...target,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true
      });
    };

    scrollContainer.addEventListener('mousedown', onMouseDown);
    scrollContainer.addEventListener('mouseleave', onMouseLeave);
    scrollContainer.addEventListener('mouseup', onMouseUp);
    scrollContainer.addEventListener('mousemove', onMouseMove);
    scrollContainer.addEventListener('touchstart', onTouchStart, { passive: true });
    scrollContainer.addEventListener('touchend', onTouchEnd);
    scrollContainer.addEventListener('touchmove', onTouchMove, { passive: false });

    // Initial scroll to today (center)
    scrollToToday(false);

    return () => {
      scrollContainer.removeEventListener('mousedown', onMouseDown);
      scrollContainer.removeEventListener('mouseleave', onMouseLeave);
      scrollContainer.removeEventListener('mouseup', onMouseUp);
      scrollContainer.removeEventListener('mousemove', onMouseMove);
      scrollContainer.removeEventListener('touchstart', onTouchStart);
      scrollContainer.removeEventListener('touchend', onTouchEnd);
      scrollContainer.removeEventListener('touchmove', onTouchMove);
    };
  }, { scope: scrollRef });

  return (
    <div className="relative group w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="flex justify-end mb-4 px-4 min-[1024px]:px-8">
        <Button 
          variant="glass" 
          size="sm" 
          onClick={() => scrollToToday(true)}
          className="rounded-full font-bold text-[13px]"
        >
          Go to Today
        </Button>
      </div>
      <div 
        ref={scrollRef}
        className="flex flex-col md:flex-row gap-4 overflow-y-auto md:overflow-x-auto max-h-[60vh] md:max-h-none pb-6 cursor-grab active:cursor-grabbing no-scrollbar select-none px-4 min-[1024px]:px-8"
        style={{ 
          scrollSnapType: 'both proximity',
          touchAction: 'none' // Essential for custom physics on mobile
        }}
      >
      {calendarDays.map((day, idx) => (
        <div 
          key={idx}
          data-today={day.isToday}
          className={cn(
            "flex-shrink-0 w-full md:w-[260px] flex flex-col min-h-[160px] md:min-h-[220px] p-6 rounded-[2.2rem] transition-all duration-350 ease-apple",
            "border backdrop-blur-[20px] saturate-[180%] scroll-snap-align-center",
            day.isToday
              ? (isDark 
                  ? "bg-apple-blue/20 border-apple-blue/50 border-white/20" 
                  : "bg-apple-blue/10 border-apple-blue/30 border-black/[0.08]")
              : (isDark 
                  ? "bg-[#1C1C1E]/90 border-white/[0.12] shadow-apple-md" 
                  : "bg-white/80 border-black/[0.05] shadow-apple-sm")
          )}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col">
              <Text weight="bold" className={day.isToday ? "text-apple-blue" : (isDark ? "text-white/60" : "text-black/40")}>
                {day.name}
              </Text>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-[28px] font-bold leading-none",
                  isDark ? "text-white" : "text-black"
                )}>
                  {day.dayNumber}
                </span>
                <span className={cn(
                  "text-[14px] font-semibold uppercase",
                  isDark ? "text-white/60" : "text-black/40"
                )}>
                  {day.month}
                </span>
              </div>
            </div>
            {day.totalMinutes > 0 && (
              <Badge variant={day.isToday ? "default" : "info"} size="sm" className="font-bold">
                {(day.totalMinutes / 60).toFixed(1)}h
              </Badge>
            )}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[120px] pr-1 scrollbar-hide">
            {day.shifts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Text variant="caption" className={cn(
                  "italic font-medium",
                  isDark ? "text-white/30" : "text-black/20"
                )}>No activity</Text>
              </div>
            ) : (
              day.shifts.map((shift) => (
                <div 
                  key={shift.id}
                  className={cn(
                    "p-3 rounded-[1rem] transition-colors",
                    isDark ? "bg-white/[0.08] hover:bg-white/[0.12]" : "bg-black/5 hover:bg-black/[0.08]"
                  )}
                >
                  <div className={cn(
                    "font-bold flex justify-between items-center text-[13px]",
                    isDark ? "text-white" : "text-black"
                  )}>
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                      {safeParseDate(shift.punchInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={isDark ? "text-white/40" : "text-black/30"}>—</span>
                    <span className={cn(
                      !shift.punchOutAt && (isDark ? "text-[#28A745]" : "text-[#1E7E34]")
                    )}>
                      {shift.punchOutAt 
                        ? safeParseDate(shift.punchOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active'}
                    </span>
                  </div>
                  {shift.notes && (
                    <Text variant="caption1" className={cn(
                      "mt-1.5 text-[11px] leading-tight line-clamp-2",
                      isDark ? "text-white/70" : "text-black/60"
                    )} title={shift.notes}>
                      {shift.notes}
                    </Text>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        ))}
      </div>
    </div>
  );
}

