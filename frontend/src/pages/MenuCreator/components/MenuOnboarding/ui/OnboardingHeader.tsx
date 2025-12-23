// src/pages/MenuCreator/components/MenuOnboarding/ui/OnboardingHeader.tsx
import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text } from '@/components/ui/Text/Text';
import { cn } from '@/utils/cn';
import type { OnboardingStep } from '../../../types';

interface OnboardingHeaderProps {
  step: OnboardingStep;
}

export const OnboardingHeader = memo(function OnboardingHeader({ step }: OnboardingHeaderProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <div className="p-6 md:p-10 pb-0">
      <div className="flex items-center justify-center mb-6 relative">
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
                  s === step 
                    ? cn(
                        "w-16 shadow-apple-md",
                        isDark ? "bg-white" : "bg-black"
                      )
                    : s < step 
                      ? cn(
                          "w-8 shadow-apple-sm",
                          isDark ? "bg-[#248A3D]" : "bg-[#1E6B34]"
                        )
                      : cn(
                          "w-8",
                          isDark ? "bg-white/20" : "bg-black/10"
                        )
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

