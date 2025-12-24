// frontend/src/pages/Shifts/components/MemberCard/MemberCard.tsx

import { memo, useState, useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { MemberCardUI } from './ui/MemberCardUI';
import type { MemberShiftSummary } from '../../types';

interface MemberCardProps {
  member: MemberShiftSummary;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
}

export const MemberCard = memo(function MemberCard({ member, isSelected, onClick, index = 0 }: MemberCardProps) {
  const isDark = useAtomValue(themeAtom) === 'dark';
  const cardRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState('');

  useGSAP(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current,
        { x: -20, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.5, 
          delay: index * 0.05, 
          ease: 'power2.out' 
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!member.active_punch_in_at) return;

    const update = () => {
      const start = new Date(member.active_punch_in_at!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setDuration(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [member.active_punch_in_at]);

  return (
    <MemberCardUI 
      member={member}
      isSelected={isSelected}
      isDark={isDark}
      isPunchedIn={!!member.active_punch_in_at}
      duration={duration}
      onClick={onClick}
      cardRef={cardRef}
    />
  );
});
