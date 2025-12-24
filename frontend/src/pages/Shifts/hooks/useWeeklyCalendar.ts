// frontend/src/pages/Shifts/hooks/useWeeklyCalendar.ts

import { useRef, useCallback, useState, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { shiftsWeeklyLayoutPreferenceAtom } from '@/atoms/preferenceAtoms';
import { themeAtom } from '@/atoms/themeAtoms';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { safeParseDate } from '@/utils/time';
import type { ShiftHistoryItem, ScheduledShift } from '../types';

export function useWeeklyCalendar(history: ShiftHistoryItem[], scheduled: ScheduledShift[]) {
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
    const step = () => {
      if (!scrollRef.current) return;
      
      scrollRef.current.scrollLeft -= velocity.current;
      velocity.current *= 0.95;

      if (Math.abs(velocity.current) > 0.1) {
        animationFrame.current = requestAnimationFrame(step);
      } else {
        animationFrame.current = null;
      }
    };
    step();
  }, []);

  const handleDragStart = useCallback((pageX: number, offsetLeft: number) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = pageX - offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
    lastX.current = pageX;
    lastTime.current = Date.now();
    velocity.current = 0;
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    scrollRef.current.style.scrollBehavior = 'auto';
  }, []);

  const handleDragMove = useCallback((pageX: number, offsetLeft: number, multiplier = 2) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = pageX - offsetLeft;
    const walk = (x - startX.current) * multiplier;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (pageX - lastX.current) / dt * 15;
      lastX.current = pageX;
      lastTime.current = now;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.scrollBehavior = '';
      applyInertia();
    }
  }, [applyInertia]);

  const [layout, setLayout] = useAtom(shiftsWeeklyLayoutPreferenceAtom);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const calendarDays = useMemo(() => {
    const days = [];
    const now = new Date();
    const currentDay = now.getDay();
    const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const mondayOfCurrentWeek = new Date(now);
    mondayOfCurrentWeek.setDate(now.getDate() + diffToMon);
    
    const startDate = new Date(mondayOfCurrentWeek);
    startDate.setDate(mondayOfCurrentWeek.getDate() - (52 * 7));

    for (let i = 0; i < 105 * 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toDateString();
      
      const dayShifts = history.filter(s => safeParseDate(s.punchInAt).toDateString() === dateStr);
      const dayScheduled = scheduled.filter(s => new Date(s.start_at).toDateString() === dateStr);
      const totalMinutes = dayShifts.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
      
      days.push({
        date,
        name: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
        dayNumber: date.getDate(),
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()],
        shifts: dayShifts,
        scheduled: dayScheduled,
        totalMinutes,
        isToday: dateStr === now.toDateString()
      });
    }
    return days;
  }, [history, scheduled]);

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

  return {
    isDark,
    scrollRef,
    layout,
    setLayout,
    weekOffset,
    setWeekOffset,
    isAnimating,
    setIsAnimating,
    calendarDays,
    currentVerticalWeek,
    weekRangeLabel,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    goToToday,
    scrollToToday
  };
}
