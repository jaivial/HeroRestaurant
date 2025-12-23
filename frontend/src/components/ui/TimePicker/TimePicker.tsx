import { useState, useRef, useEffect, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Modal, Text, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

interface ScrollColumnProps {
  items: number[];
  selectedValue: number;
  visualValue: number;
  onSelect: (v: number) => void;
  onVisualUpdate: (v: number) => void;
  dataKey: string;
  isDark: boolean;
}

const ITEM_HEIGHT = 44; // Slightly taller for better touch targets
const VISIBLE_ITEMS = 5;
const RADIUS = 110;

const ScrollColumn = ({ 
  items, 
  selectedValue, 
  visualValue,
  onSelect, 
  onVisualUpdate,
  isDark
}: ScrollColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const draggableInstance = useRef<Draggable[] | null>(null);
  const isInternalUpdate = useRef(false);

  // The Y coordinate that centers the selected index at the 88px mark (middle of 220px container)
  const getTargetY = useCallback((index: number) => {
    return -index * ITEM_HEIGHT;
  }, []);

  const updateVisualStyles = useCallback((y: number) => {
    if (!wrapperRef.current) return;
    
    const children = wrapperRef.current.children;
    const wrapperY = y;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      // childY is the logical distance from the center (0)
      const childY = (i * ITEM_HEIGHT) + wrapperY;
      
      const angle = (childY / RADIUS);
      const absAngle = Math.abs(angle);
      
      // Use a slightly wider angle than 90 deg to avoid popping, mask handles the fade-out
      if (absAngle < Math.PI / 1.6) {
        const cos = Math.cos(angle);
        const opacity = Math.pow(Math.max(0, cos), 2.5); 
        
        gsap.set(child, {
          opacity: opacity,
          rotationX: -angle * (180 / Math.PI),
          y: 88 - wrapperY, 
          transformOrigin: `50% 50% -${RADIUS}px`,
          z: 0.1,
          force3D: true,
          display: 'flex',
          color: isDark 
            ? (Math.abs(childY) < ITEM_HEIGHT/2 ? '#FFFFFF' : '#8E8E93') 
            : (Math.abs(childY) < ITEM_HEIGHT/2 ? '#000000' : '#8E8E93')
        });
      } else {
        gsap.set(child, { display: 'none' });
      }
    }

    const index = Math.min(items.length - 1, Math.max(0, Math.round(-y / ITEM_HEIGHT)));
    const value = items[index];
    if (visualValue !== value) {
      onVisualUpdate(value);
    }
  }, [items, onVisualUpdate, visualValue, isDark]);

  useEffect(() => {
    if (!wrapperRef.current || !containerRef.current) return;

    const wrapper = wrapperRef.current;
    const minY = getTargetY(items.length - 1);
    const maxY = getTargetY(0);
    
    const initialY = getTargetY(items.indexOf(selectedValue));
    gsap.set(wrapper, { y: initialY });
    updateVisualStyles(initialY);

    let lastY = initialY;
    let lastTime = Date.now();
    let velocity = 0;

    draggableInstance.current = Draggable.create(wrapper, {
      type: "y",
      edgeResistance: 0.85,
      bounds: { minY, maxY },
      onDragStart: function() {
        isInternalUpdate.current = true;
        gsap.killTweensOf(wrapper);
        lastY = this.y;
        lastTime = Date.now();
        velocity = 0;
      },
      onDrag: function() {
        const now = Date.now();
        const dt = now - lastTime;
        if (dt > 0) {
          velocity = ((this.y - lastY) / dt) * 1000;
          lastY = this.y;
          lastTime = now;
        }
        updateVisualStyles(this.y);
      },
      onDragEnd: function() {
        const currentY = this.y;
        let targetY = currentY + (velocity * 0.2); 
        targetY = Math.max(minY, Math.min(maxY, targetY));
        const snappedY = Math.round(targetY / ITEM_HEIGHT) * ITEM_HEIGHT;
        
        const distance = Math.abs(snappedY - currentY);
        const duration = Math.min(1.2, Math.max(0.4, distance / (Math.abs(velocity) || 1) * 0.6));

        gsap.to(wrapper, {
          y: snappedY,
          duration: duration,
          ease: "expo.out",
          onUpdate: function() {
            updateVisualStyles(gsap.getProperty(wrapper, "y") as number);
          },
          onComplete: () => {
            const index = Math.round(-snappedY / ITEM_HEIGHT);
            onSelect(items[index]);
            isInternalUpdate.current = false;
          }
        });
      }
    });

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current[0].kill();
      }
    };
  }, [items, onSelect, selectedValue]); // Dependencies adjusted for proper initialization

  useEffect(() => {
    if (isInternalUpdate.current) return;
    const targetY = getTargetY(items.indexOf(selectedValue));
    const currentY = gsap.getProperty(wrapperRef.current, "y") as number;

    if (Math.abs(targetY - currentY) > 1) {
      gsap.to(wrapperRef.current, {
        y: targetY,
        duration: 0.5,
        ease: "power3.out",
        onUpdate: function() {
          updateVisualStyles(gsap.getProperty(wrapperRef.current, "y") as number);
        }
      });
    }
  }, [selectedValue, items, getTargetY, updateVisualStyles]);

  return (
    <div 
      className="relative h-[220px] w-24 overflow-hidden" 
      style={{ 
        perspective: '1200px',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
      }} 
      ref={containerRef}
    >
      {/* Selection Overlay */}
      <div className={cn(
        "absolute top-[88px] left-0 right-0 h-[44px] rounded-xl pointer-events-none z-10 border-y shadow-sm",
        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
      )} />
      
      {/* Draggable Wrapper */}
      <div 
        ref={wrapperRef}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {items.map((v, i) => (
          <div 
            key={v}
            className={cn(
              "absolute top-0 left-0 right-0 h-[44px] flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors duration-200 select-none",
              visualValue === v ? "font-bold text-[24px]" : "font-medium text-[18px]"
            )}
            style={{ 
              backfaceVisibility: 'hidden',
              display: 'none' // Hidden until GSAP positions them
            }}
          >
            {String(v).padStart(2, '0')}
          </div>
        ))}
      </div>
    </div>
  );
};

interface TimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  value: string; // HH:mm
  onChange: (time: string) => void;
  title?: string;
}

export function TimePicker({ isOpen, onClose, value, onChange, title = 'Select Time' }: TimePickerProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const [hours, setHours] = useState(() => value ? parseInt(value.split(':')[0]) : 9);
  const [minutes, setMinutes] = useState(() => value ? parseInt(value.split(':')[1]) : 0);

  const [visualHours, setVisualHours] = useState(hours);
  const [visualMinutes, setVisualMinutes] = useState(minutes);

  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setHours(h);
      setMinutes(m);
      setVisualHours(h);
      setVisualMinutes(m);
    }
  }, [value, isOpen]); // Sync when opened

  const handleConfirm = () => {
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    onChange(`${hh}:${mm}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-6 py-8">
          <div className="flex flex-col items-center">
            <Text variant="caption" weight="bold" className="uppercase opacity-40 mb-3 tracking-widest">Hour</Text>
            <ScrollColumn 
              items={hoursArray} 
              selectedValue={hours} 
              visualValue={visualHours}
              onSelect={setHours} 
              onVisualUpdate={setVisualHours}
              dataKey="hour" 
              isDark={isDark}
            />
          </div>
          
          <Text className="text-[32px] font-light mt-8 opacity-30">:</Text>
          
          <div className="flex flex-col items-center">
            <Text variant="caption" weight="bold" className="uppercase opacity-40 mb-3 tracking-widest">Min</Text>
            <ScrollColumn 
              items={minutesArray} 
              selectedValue={minutes} 
              visualValue={visualMinutes}
              onSelect={setMinutes} 
              onVisualUpdate={setVisualMinutes}
              dataKey="minute" 
              isDark={isDark}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 w-full pt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1 rounded-2xl">
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1 rounded-2xl shadow-lg shadow-apple-blue/20">
            Set Time
          </Button>
        </div>
      </div>
    </Modal>
  );
}