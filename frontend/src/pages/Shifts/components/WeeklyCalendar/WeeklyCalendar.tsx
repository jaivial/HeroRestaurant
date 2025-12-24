// frontend/src/pages/Shifts/components/WeeklyCalendar/WeeklyCalendar.tsx

import { useRef, useCallback, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useWeeklyCalendar } from '../../hooks/useWeeklyCalendar';
import { WeeklyCalendarUI } from './ui/WeeklyCalendarUI';
import type { WeeklyCalendarProps } from '../../types';

export function WeeklyCalendar({ history, scheduled = [], isConstrained = false, onShiftClick }: WeeklyCalendarProps) {
  const verticalContainerRef = useRef<HTMLDivElement>(null);
  const calendar = useWeeklyCalendar(history, scheduled);
  const { contextSafe } = useGSAP({ scope: verticalContainerRef });

  const animateWeekChange = useCallback((dir: 'next' | 'prev') => {
    if (calendar.isAnimating) return;
    const container = verticalContainerRef.current;
    if (!container) return;

    contextSafe(() => {
      calendar.setIsAnimating(true);

      const exitX = dir === 'next' ? 150 : -150;
      const enterX = dir === 'next' ? -150 : 150;

      const tl = gsap.timeline({
        onComplete: () => {
          calendar.setIsAnimating(false);
          gsap.set(container, { clearProps: "all" });
        }
      });

      tl.to(container, {
        x: exitX,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in"
      });

      tl.add(() => {
        calendar.setWeekOffset(prev => dir === 'next' ? prev + 1 : prev - 1);
      });

      tl.set(container, { x: enterX, opacity: 0 });

      tl.to(container, {
        x: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power3.out"
      }, "+=0.02");
    })();
  }, [calendar, contextSafe]);

  // Handle entrance for layout mount/switch
  useGSAP(() => {
    const currentContainer = calendar.layout === 'horizontal' ? calendar.scrollRef.current : verticalContainerRef.current;
    if (!currentContainer || calendar.isAnimating) return;

    gsap.fromTo(currentContainer,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, { dependencies: [calendar.layout] });

  return (
    <WeeklyCalendarUI 
      {...calendar}
      history={history}
      scheduled={scheduled}
      isConstrained={isConstrained}
      verticalContainerRef={verticalContainerRef}
      onWeekChange={animateWeekChange}
      onDragStart={calendar.handleDragStart}
      onDragMove={calendar.handleDragMove}
      onDragEnd={calendar.handleDragEnd}
      onGoToToday={calendar.goToToday}
      onShiftClick={onShiftClick}
    />
  );
}
