import { memo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../../../atoms/themeAtoms';
import { Modal } from '../../../../../components/ui/Modal/Modal';
import { Button } from '../../../../../components/ui/Button/Button';
import { Input } from '../../../../../components/ui/Input/Input';
import { Heading, Text } from '../../../../../components/ui/Text/Text';
import { cn } from '../../../../../utils/cn';
import type { Menu } from '../../../types';

interface ConfirmDeleteModalProps {
  menu: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModal = memo(function ConfirmDeleteModal({
  menu,
  isOpen,
  onClose,
  onConfirm
}: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  if (!menu) return null;

  const totalDishes = menu.sections?.reduce((sum, s) => sum + s.dishes.length, 0) || 0;
  const requiresTyping = totalDishes > 0;
  const expectedText = menu.title;
  const canConfirm = requiresTyping ? confirmText === expectedText : true;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      setConfirmText('');
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-10 space-y-8">
        <div className="flex items-start gap-6">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
            isDark ? "bg-red-500/20" : "bg-red-100"
          )}>
            <svg className={cn("w-8 h-8", isDark ? "text-red-400" : "text-red-600")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            <Heading level={2} className="text-3xl font-bold">Delete Menu?</Heading>
            <Text color="secondary" className="text-lg leading-relaxed">
              You are about to delete <span className="font-bold text-content-primary">"{menu.title}"</span>.
              {totalDishes > 0 && (
                <span> This menu contains <span className="font-bold text-content-primary">{totalDishes} {totalDishes === 1 ? 'dish' : 'dishes'}</span>.</span>
              )}
            </Text>
          </div>
        </div>

        {requiresTyping && (
          <div className="space-y-4 p-6 rounded-[1.5rem] bg-surface-secondary">
            <Text weight="semibold" className="text-base">
              Type <span className="font-mono font-bold text-content-primary">"{expectedText}"</span> to confirm deletion:
            </Text>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              className={cn(
                "h-14 text-lg px-6 rounded-[1.5rem] border-2 transition-all font-mono",
                confirmText === expectedText
                  ? isDark ? "border-red-500 bg-red-500/10" : "border-red-600 bg-red-50"
                  : isDark ? "bg-[#000000] border-[#616161] hover:border-[#9E9E9E]" : "bg-[#F5F5F7] border-[#BDBDBD] hover:border-[#757575]"
              )}
              autoFocus
            />
          </div>
        )}

        <div className={cn(
          "p-6 rounded-[1.5rem] flex items-start gap-4",
          isDark ? "bg-[#1C1C1E] border border-[#424245]" : "bg-[#F5F5F7]"
        )}>
          <svg className={cn("w-5 h-5 flex-shrink-0 mt-0.5", isDark ? "text-[#A1A1A6]" : "text-[#757575]")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <Text variant="footnote" className={cn("text-base leading-relaxed", isDark ? "text-[#A1A1A6]" : "text-[#757575]")}>
            This action cannot be undone. All sections and dishes will be permanently deleted.
          </Text>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1 h-14 rounded-full text-lg font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={cn(
              "flex-1 h-14 rounded-full text-lg font-bold shadow-apple-md transition-all",
              canConfirm
                ? "bg-red-600 hover:bg-red-700 text-white hover:scale-105 active:scale-95"
                : "opacity-50 cursor-not-allowed"
            )}
          >
            Delete Menu
          </Button>
        </div>
      </div>
    </Modal>
  );
});
