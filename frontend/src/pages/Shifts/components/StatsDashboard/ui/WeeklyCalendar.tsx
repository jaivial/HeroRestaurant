import { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { shiftsWeeklyLayoutPreferenceAtom } from '@/atoms/preferenceAtoms';
import { Text, Badge, Button, Tabs, TabsList, TabsTrigger, IconButton } from '@/components/ui';
import type { ShiftHistoryItem } from '../../../types';
import { cn } from '@/utils/cn';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { safeParseDate } from '@/utils/time';
import { LayoutGrid, List, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface WeeklyCalendarProps {
  history: ShiftHistoryItem[];
}

export function WeeklyCalendar({ history }: WeeklyCalendarProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animationFrame = useRef<number | null>(null);

  const applyInertia = useCallback(() => {
    if (!scrollRef.current) return;
    
    scrollRef.current.scrollLeft -= velocity.current;
    velocity.current *= 0.95; // Friction coefficient

    if (Math.abs(velocity.current) > 0.1) {
      animationFrame.current = requestAnimationFrame(applyInertia);
    } else {
      animationFrame.current = null;
    }
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    lastX.current = e.pageX;
    lastTime.current = Date.now();
    velocity.current = 0;
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = '';
      applyInertia();
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (e.pageX - lastX.current) / dt * 15; // Velocity based on pixels/ms
      lastX.current = e.pageX;
      lastTime.current = now;
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    lastX.current = e.touches[0].pageX;
    lastTime.current = Date.now();
    velocity.current = 0;
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    scrollRef.current.style.scrollBehavior = 'auto';
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (e.touches[0].pageX - lastX.current) / dt * 15;
      lastX.current = e.touches[0].pageX;
      lastTime.current = now;
    }
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = '';
      applyInertia();
    }
  };

  const verticalContainerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useAtom(shiftsWeeklyLayoutPreferenceAtom);
  const [weekOffset, setWeekOffset] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Group shifts by day (let's generate a range of days for paging)
  const calendarDays = useMemo(() => {
    const days = [];
    const now = new Date();
    
    // Find the Monday of the current week
    const currentDay = now.getDay();
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const mondayOfCurrentWeek = new Date(now);
    mondayOfCurrentWeek.setDate(now.getDate() + diffToMon);
    
    // Generate 52 weeks before and 52 weeks after (Total 105 weeks)
    const startDate = new Date(mondayOfCurrentWeek);
    startDate.setDate(mondayOfCurrentWeek.getDate() - (52 * 7));

    for (let i = 0; i < 105 * 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
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
        isToday: dateStr === now.toDateString()
      });
    }
    return days;
  }, [history]);

  // Current week for vertical view (52 weeks before, current week, 52 weeks after)
  const currentVerticalWeek = useMemo(() => {
    const startIndex = (52 + weekOffset) * 7;
    return calendarDays.slice(startIndex, startIndex + 7);
  }, [calendarDays, weekOffset]);

  const weekRangeLabel = useMemo(() => {
    if (currentVerticalWeek.length === 0) return '';
    const first = currentVerticalWeek[0];
    const last = currentVerticalWeek[6];
    return `${first.month} ${first.dayNumber} - ${last.month} ${last.dayNumber}, ${first.date.getFullYear()}`;
  }, [currentVerticalWeek]);

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

  const goToToday = useCallback(() => {
    if (layout === 'horizontal') {
      scrollToToday(true);
    } else {
      setWeekOffset(0);
    }
  }, [layout, scrollToToday]);

  const { contextSafe } = useGSAP({ scope: verticalContainerRef });

  const animateWeekChange = contextSafe((dir: 'next' | 'prev') => {
    if (isAnimating) return;
    const container = verticalContainerRef.current;
    if (!container) return;

    setIsAnimating(true);

    const exitX = dir === 'next' ? 150 : -150;
    const enterX = dir === 'next' ? -150 : 150;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        gsap.set(container, { clearProps: "all" });
      }
    });

    // 1. EXIT: Slide and Fade current view
    tl.to(container, {
      x: exitX,
      opacity: 0,
      duration: 0.5,
      ease: "power2.in"
    });

    // 2. SWAP: Change state only after container is fully invisible
    tl.add(() => {
      setWeekOffset(prev => dir === 'next' ? prev + 1 : prev - 1);
    });

    // 3. RESET: Jump to start position of NEW view (still invisible)
    tl.set(container, { x: enterX, opacity: 0 });

    // 4. ENTER: Slide and Fade new view in
    tl.to(container, {
      x: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power3.out"
    }, "+=0.02"); // Small delay to let React render the new cards
  });

  // Handle entrance for layout mount/switch
  useGSAP(() => {
    const currentContainer = layout === 'horizontal' ? scrollRef.current : verticalContainerRef.current;
    if (!currentContainer || isAnimating) return;

    gsap.fromTo(currentContainer,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, { dependencies: [layout] });

  const handleLayoutChange = (newLayout: string) => {
    if (isAnimating) return;
    const currentContainer = layout === 'horizontal' ? scrollRef.current : verticalContainerRef.current;
    
    if (!currentContainer) {
      setLayout(newLayout as 'horizontal' | 'vertical');
      return;
    }

    setIsAnimating(true);
    gsap.to(currentContainer, {
      opacity: 0,
      y: layout === 'horizontal' ? -20 : 20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        setLayout(newLayout as 'horizontal' | 'vertical');
        setIsAnimating(false);
      }
    });
  };

  return (
    <div className="relative group w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .inner-scrollbar-hide::-webkit-scrollbar { display: none; }
        .inner-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .ease-apple { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0); }
      `}} />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4">
        <Tabs 
          value={layout} 
          onChange={handleLayoutChange}
        >
          <TabsList variant="glass" className="p-1">
            <TabsTrigger value="horizontal" className="flex items-center gap-2 px-4 py-1.5">
              <LayoutGrid size={16} />
              <span>Carousel</span>
            </TabsTrigger>
            <TabsTrigger value="vertical" className="flex items-center gap-2 px-4 py-1.5">
              <List size={16} />
              <span>Column</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          {layout === 'vertical' && (
            <div className="flex items-center gap-2 mr-2">
              <IconButton 
                icon={<ChevronLeft size={20} />} 
                variant="glass" 
                size="sm"
                onClick={() => animateWeekChange('prev')}
                disabled={weekOffset <= -52 || isAnimating}
              />
              <Text weight="bold" className={cn(
                "text-[14px] min-w-[180px] text-center",
                isDark ? "text-white" : "text-black"
              )}>
                {weekRangeLabel}
              </Text>
              <IconButton 
                icon={<ChevronRight size={20} />} 
                variant="glass" 
                size="sm"
                onClick={() => animateWeekChange('next')}
                disabled={weekOffset >= 52 || isAnimating}
              />
            </div>
          )}
          <Button 
            variant="glass" 
            size="sm" 
            onClick={goToToday}
            className="rounded-full font-bold text-[13px]"
            disabled={isAnimating}
          >
            Go to Today
          </Button>
        </div>
      </div>

      {layout === 'horizontal' ? (
        <div className="md:left-[calc(50%-(50vw-140px))] md:w-[calc(100vw-280px)] md:max-w-none relative">
          <div 
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseLeave={onMouseUp}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="flex flex-col md:flex-row gap-4 overflow-y-auto md:overflow-x-auto max-h-[70vh] md:max-h-none pb-6 cursor-grab active:cursor-grabbing no-scrollbar select-none md:px-8 min-[1024px]:px-16"
            style={{ 
              scrollSnapType: 'none', // Changed from 'both proximity' to 'none' for better manual drag feel
              touchAction: 'pan-y' // Allow vertical scroll but handle horizontal drag
            }}
          >
            {calendarDays.map((day, idx) => (
              <div 
                key={idx}
                data-today={day.isToday}
                className={cn(
                  "flex-shrink-0 w-full md:w-[260px] flex flex-col min-h-[280px] md:min-h-[340px] p-6 rounded-[2.2rem] transition-all duration-350 ease-apple",
                  "border backdrop-blur-[20px] saturate-[180%] scroll-snap-align-center",
                  day.isToday
                    ? (isDark 
                        ? "bg-apple-blue/20 border-apple-blue/40 border-white/20" 
                        : "bg-apple-blue/10 border-apple-blue/30 border-black/[0.08]")
                    : (isDark 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/80 border-black/[0.05]")
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <Text weight="bold" className={day.isToday ? "text-apple-blue" : (isDark ? "text-white/40" : "text-black/40")}>
                      {day.name}
                    </Text>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-[28px] font-bold leading-none",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {day.dayNumber}
                      </span>
                      <div className="flex flex-col -space-y-1">
                        <span className={cn(
                          "text-[12px] font-bold uppercase",
                          isDark ? "text-white/40" : "text-black/40"
                        )}>
                          {day.month}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium opacity-30",
                          isDark ? "text-white" : "text-black"
                        )}>
                          {day.date.getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {day.totalMinutes > 0 && (
                    <Badge variant={day.isToday ? "default" : "info"} size="sm" className="font-bold">
                      {(day.totalMinutes / 60).toFixed(1)}h
                    </Badge>
                  )}
                </div>

                <div 
                  className="flex-1 space-y-3 overflow-y-auto max-h-[180px] pr-1 inner-scrollbar-hide"
                  style={{ touchAction: 'pan-y' }}
                >
                  {day.shifts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Text variant="caption" className={cn(
                        "italic font-medium",
                        isDark ? "text-white/20" : "text-black/20"
                      )}>No activity</Text>
                    </div>
                  ) : (
                    day.shifts.map((shift) => (
                      <div 
                        key={shift.id}
                        className={cn(
                          "p-3 rounded-[1rem] transition-colors",
                          isDark ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/[0.08]"
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
                          <span className={isDark ? "text-white/30" : "text-black/30"}>—</span>
                          <span>
                            {shift.punchOutAt 
                              ? safeParseDate(shift.punchOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Active'}
                          </span>
                        </div>
                        {shift.notes && (
                          <Text variant="caption1" className={cn(
                            "mt-1.5 text-[11px] leading-tight line-clamp-2",
                            isDark ? "text-white/60" : "text-black/60"
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
      ) : (
        <div className="flex flex-col items-center pb-8 overflow-x-hidden">
          <div 
            ref={verticalContainerRef}
            className="w-full max-w-[480px] space-y-4"
          >
            {currentVerticalWeek.map((day, idx) => (
              <div 
                key={`${weekOffset}-${idx}`}
                className={cn(
                  "vertical-card w-full flex flex-col md:flex-row gap-4 p-5 rounded-[2rem] transition-all duration-300",
                  "border backdrop-blur-[20px] saturate-[180%]",
                  day.isToday
                    ? (isDark 
                        ? "bg-apple-blue/20 border-apple-blue/40" 
                        : "bg-apple-blue/10 border-apple-blue/30")
                    : (isDark 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/80 border-black/[0.05]")
                )}
              >
                <div className="flex md:flex-col justify-between md:justify-center items-center md:items-start min-w-[90px] border-b md:border-b-0 md:border-r border-white/10 md:pr-4 pb-2 md:pb-0">
                  <div>
                    <Text weight="bold" className={cn(
                      "text-[11px] uppercase tracking-widest",
                      day.isToday ? "text-apple-blue" : (isDark ? "text-white/40" : "text-black/40")
                    )}>
                      {day.name}
                    </Text>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-[22px] font-bold leading-none",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {day.dayNumber}
                      </span>
                      <span className={cn(
                        "text-[11px] font-semibold uppercase",
                        isDark ? "text-white/40" : "text-black/40"
                      )}>
                        {day.month}
                      </span>
                    </div>
                  </div>
                  {day.totalMinutes > 0 && (
                    <Badge variant={day.isToday ? "default" : "info"} size="sm" className="font-bold md:mt-1.5 py-0 px-2 h-5 text-[10px]">
                      {(day.totalMinutes / 60).toFixed(1)}h
                    </Badge>
                  )}
                </div>

                <div className="flex-1 py-1">
                  {day.shifts.length === 0 ? (
                    <div className="h-full flex items-center">
                      <Text variant="caption" className={cn(
                        "italic font-medium",
                        isDark ? "text-white/20" : "text-black/20"
                      )}>No shifts recorded</Text>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {day.shifts.map((shift) => (
                        <div 
                          key={shift.id}
                          className={cn(
                            "flex flex-col p-2.5 rounded-xl border transition-colors w-full",
                            isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-black/[0.02] border-black/[0.02] hover:bg-black/[0.04]"
                          )}
                        >
                          <div className={cn(
                            "font-bold flex items-center gap-2 text-[12px]",
                            isDark ? "text-white" : "text-black"
                          )}>
                            <Clock size={12} className="text-apple-blue" />
                            <span className="flex-1">
                              {safeParseDate(shift.punchInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' — '}
                              {shift.punchOutAt 
                                ? safeParseDate(shift.punchOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Active'}
                            </span>
                            {shift.totalMinutes && (
                              <span className="opacity-40 text-[10px]">
                                {((shift.totalMinutes)/60).toFixed(1)}h
                              </span>
                            )}
                          </div>
                          {shift.notes && (
                            <Text variant="caption1" className={cn(
                              "mt-0.5 text-[10px] line-clamp-1 opacity-50 italic",
                              isDark ? "text-white" : "text-black"
                            )}>
                              &quot;{shift.notes}&quot;
                            </Text>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

