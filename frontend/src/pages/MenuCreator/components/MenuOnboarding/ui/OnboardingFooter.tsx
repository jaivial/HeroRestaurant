// src/pages/MenuCreator/components/MenuOnboarding/ui/OnboardingFooter.tsx
import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Button } from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';
import type { OnboardingStep } from '../../../types';

interface OnboardingFooterProps {
  step: OnboardingStep;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
}

export const OnboardingFooter = memo(function OnboardingFooter({ step, onNext, onBack, isValid }: OnboardingFooterProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between p-8 md:p-12 pt-12 border-t bg-surface-secondary">
      <Button 
        variant="ghost" 
        onClick={onBack}
        disabled={step === 1}
        className="rounded-full h-14 px-10 text-lg font-bold disabled:opacity-0 transition-all hover:bg-surface-tertiary"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M15 19l-7-7 7-7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Previous
      </Button>
      
      <Button 
        onClick={onNext} 
        disabled={!isValid}
        className={cn(
          "rounded-full h-14 px-12 text-lg font-bold transition-all shadow-apple-md hover:scale-105 active:scale-95",
          step === 5 
            ? "bg-apple-green hover:bg-apple-green-hover text-white" 
            : cn(
                "text-lg font-bold transition-all",
                isDark 
                  ? "bg-white text-black hover:bg-apple-gray-100" 
                  : "bg-black text-white hover:bg-apple-gray-800"
              )
        )}
      >
        {step === 5 ? 'Create Menu' : 'Continue'}
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 5l7 7-7 7" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>
  );
});

