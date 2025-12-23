// src/pages/MenuCreator/components/MenuOnboarding/MenuOnboarding.tsx
import { Button } from '@/components/ui/Button/Button';
import { OnboardingHeader } from './ui/OnboardingHeader';
import { OnboardingFooter } from './ui/OnboardingFooter';
import { Step1BasicInfo } from './Steps/Step1BasicInfo';
import { Step2Structure } from './Steps/Step2Structure';
import { Step3Availability } from './Steps/Step3Availability';
import { Step4Dishes } from './Steps/Step4Dishes';
import { Step5Desserts } from './Steps/Step5Desserts';
import type { MenuOnboardingProps } from '../../types';

export function MenuOnboarding({ step, onCancel, onNext, onBack, isValid }: MenuOnboardingProps) {
  // ✅ Layer 2: Composes steps and navigation UI
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1BasicInfo />;
      case 2: return <Step2Structure />;
      case 3: return <Step3Availability />;
      case 4: return <Step4Dishes />;
      case 5: return <Step5Desserts />;
      default: return null;
    }
  };

  return (
    <div className="max-w-[95%] xl:max-w-[1400px] mx-auto py-4 px-4">
      {/* External Cancel Button */}
      <div className="flex justify-start mb-6 px-4">
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
      </div>

      <div className="bg-surface-primary backdrop-blur-md rounded-[2.2rem] border-2 border-apple-gray-100 shadow-apple-float overflow-hidden">
        {/* Header (Layer 3) */}
        <OnboardingHeader step={step} />

        {/* Step Content */}
        <div className="p-6 md:p-10 pt-0 min-h-[500px]">
          {renderStep()}
        </div>

        {/* Footer (Layer 3) */}
        <OnboardingFooter 
          step={step} 
          onNext={onNext} 
          onBack={onBack} 
          isValid={isValid} 
        />
      </div>
    </div>
  );
}
