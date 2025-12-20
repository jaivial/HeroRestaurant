// src/pages/MenuCreator/components/MenuOnboarding/MenuOnboarding.tsx
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
      <div className="bg-surface-primary backdrop-blur-md rounded-[2.2rem] border-2 border-apple-gray-100 shadow-apple-float overflow-hidden">
        {/* Header (Layer 3) */}
        <OnboardingHeader step={step} onCancel={onCancel} />

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
