import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { useAtomValue } from 'jotai';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface TooltipProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  openOnClick?: boolean;
}

/**
 * Layer 3: UI Component - Tooltip
 * Follows Apple aesthetic for contextual overlays with Liquid Glass effect.
 * Adheres to SOLID principles and project styling rules.
 */
export const Tooltip = memo(function Tooltip({
  trigger,
  children,
  position = 'top',
  className = '',
  style,
  openOnClick = false,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const theme = useAtomValue(themeAtom);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top + scrollY - 12;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + scrollY + 12;
          left = rect.left + scrollX + rect.width / 2;
          break;
        case 'left':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.left + scrollX - 12;
          break;
        case 'right':
          top = rect.top + scrollY + rect.height / 2;
          left = rect.right + scrollX + 12;
          break;
      }

      setCoords({ top, left });
    }
  }, [position]);

  useLayoutEffect(() => {
    if (isOpen) {
      const handle = requestAnimationFrame(updateCoords);
      return () => cancelAnimationFrame(handle);
    }
  }, [isOpen, updateCoords]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updateCoords);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen, updateCoords]);

  // Entrance animation with GSAP
  useGSAP(() => {
    if (isOpen && tooltipRef.current) {
      gsap.fromTo(tooltipRef.current, 
        { 
          opacity: 0, 
          scale: 0.9, 
          y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
          x: position === 'left' ? 10 : position === 'right' ? -10 : 0
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          x: 0,
          duration: 0.4, 
          ease: 'elastic.out(1, 0.75)' 
        }
      );
    }
  }, { dependencies: [isOpen], scope: tooltipRef });

  // Close when clicking outside if openOnClick is true
  useEffect(() => {
    if (!isOpen || !openOnClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, openOnClick]);

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full origin-bottom mb-2',
    bottom: '-translate-x-1/2 origin-top mt-2',
    left: '-translate-x-full -translate-y-1/2 origin-right mr-2',
    right: '-translate-y-1/2 origin-left ml-2',
  };

  const panelClasses = cn(
    'fixed z-[100] p-5 rounded-[1.5rem] backdrop-blur-[25px] saturate-[200%] border',
    'shadow-[0_20px_50px_rgba(0,0,0,0.3)]',
    theme === 'dark'
      ? 'bg-black/85 border-white/15 text-white shadow-black/60'
      : 'bg-white/85 border-black/[0.08] text-black shadow-black/10',
    positionClasses[position],
    className
  );

  const getArrowClasses = () => {
    const base = "absolute w-3 h-3 rotate-45 border-inherit backdrop-blur-[25px] saturate-[200%] pointer-events-none";
    const themeArrow = theme === 'dark' ? 'bg-black/85' : 'bg-white/85';
    
    switch (position) {
      case 'top': return cn(base, themeArrow, "bottom-[-6px] left-1/2 -translate-x-1/2 border-b border-r");
      case 'bottom': return cn(base, themeArrow, "top-[-6px] left-1/2 -translate-x-1/2 border-t border-l");
      case 'left': return cn(base, themeArrow, "right-[-6px] top-1/2 -translate-y-1/2 border-t border-r");
      case 'right': return cn(base, themeArrow, "left-[-6px] top-1/2 -translate-y-1/2 border-b border-l");
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (openOnClick) {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (!openOnClick) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!openOnClick) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggle}
      >
        {trigger}
      </div>
      {isOpen && createPortal(
        <div
          ref={tooltipRef}
          style={{ 
            top: coords.top, 
            left: coords.left,
            ...style 
          }}
          className={panelClasses}
        >
          {/* Inner Glow effect for Apple aesthetic */}
          <div className={cn(
            "absolute inset-0 rounded-[1.5rem] pointer-events-none border border-white/10",
            theme === 'dark' ? "opacity-100" : "opacity-0"
          )} />
          <div className="relative z-10">
            {children}
          </div>
          {/* Arrow / Tip */}
          <div className={getArrowClasses()} />
        </div>,
        document.body
      )}
    </>
  );
});
