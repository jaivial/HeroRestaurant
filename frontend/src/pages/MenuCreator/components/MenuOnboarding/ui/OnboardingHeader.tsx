// src/pages/MenuCreator/components/MenuOnboarding/ui/OnboardingHeader.tsx
import { memo } from 'react';
import { Button } from '../../../../../components/ui/Button/Button';
import { Text } from '../../../../../components/ui/Text/Text';
import { cn } from '../../../../../utils/cn';
import type { OnboardingStep } from '../../../types';

interface OnboardingHeaderProps {
  step: OnboardingStep;
  onCancel: () => void;
}

export const OnboardingHeader = memo(function OnboardingHeader({ step, onCancel }: OnboardingHeaderProps) {
  return (
    <div className="p-6 md:p-10 pb-0">
      <div className="flex items-center justify-between mb-12">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="rounded-full hover:bg-surface-secondary text-content-primary font-bold h-12 px-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" strokeWidth={2.5} strokeLinecap="round" />
          </svg>
          Cancel
        </Button>
        
        <div className="flex flex-col items-center gap-4">
          <Text variant="footnote" color="primary" weight="bold" className="uppercase tracking-[0.25em] text-[11px]">
            Step {step} of 5
          </Text>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-2.5 rounded-full transition-all duration-500",
                  s === step ? "w-16 bg-apple-blue shadow-sm" : s < step ? "w-8 bg-apple-blue/60" : "w-8 bg-apple-gray-200"
                )}
              />
            ))}
          </div>
        </div>

        <div className="w-[120px] hidden md:block" /> {/* Spacer for balance */}
      </div>
    </div>
  );
});

