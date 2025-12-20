// src/pages/MenuCreator/components/MenuOnboarding/Steps/ui/AllergenModal.tsx
import { memo } from 'react';
import { Modal } from '../../../../../../components/ui/Modal/Modal';
import { Button } from '../../../../../../components/ui/Button/Button';
import { Text } from '../../../../../../components/ui/Text/Text';
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../../../../atoms/themeAtoms';
import { cn } from '../../../../../../utils/cn';
import { ALLERGENS } from '../../../../types';
import type { AllergenModalProps } from '../../../../types';

export const AllergenModal = memo(function AllergenModal({ 
  isOpen, 
  onClose, 
  onToggleAllergen, 
  selectedAllergens 
}: AllergenModalProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Mandatory Allergens"
    >
      <div className="space-y-6 p-2">
        <Text color="secondary" className="text-center mb-4">Select all allergens present in this dish.</Text>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {ALLERGENS.map((allergen) => {
            const isSelected = selectedAllergens.includes(allergen.id);
            
            return (
              <button
                key={allergen.id}
                onClick={() => onToggleAllergen(allergen.id)}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-4 rounded-[1.5rem] transition-all duration-300 border-2",
                  isSelected
                    ? cn(
                        "border-transparent shadow-apple-md scale-[1.08] z-10",
                        isDark ? "bg-[#a5a5a5]" : "bg-[#C7BAAA]"
                      )
                    : isDark
                      ? "bg-white/5 border-white/10 text-apple-gray-400 hover:border-white/20 hover:bg-white/10 hover:scale-105 shadow-sm"
                      : "bg-apple-gray-100/50 border-apple-gray-200 text-apple-gray-600 hover:border-apple-gray-300 hover:bg-apple-gray-100 hover:scale-105 shadow-sm"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-200">
                    <svg className="w-3 h-3 text-black/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <span className={cn("text-3xl transition-transform duration-300", isSelected && "scale-110")}>{allergen.icon}</span>
                <Text 
                  variant="caption2" 
                  weight="bold" 
                  align="center" 
                  className={cn(
                    "transition-colors duration-300",
                    isSelected 
                      ? "text-black/90" 
                      : isDark 
                        ? "text-apple-gray-400" 
                        : "text-apple-gray-600"
                  )}
                >
                  {allergen.name}
                </Text>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={onClose}
            className="rounded-full px-12 h-12 bg-apple-blue hover:bg-apple-blue-hover text-white font-bold shadow-apple-md"
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
});

