import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Heading } from '@/components/ui/Text/Text';
import type { MenuErrorProps } from '../../types';

export const MenuError = memo(function MenuError({ error, onRetry }: MenuErrorProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: theme === 'dark' ? '#000000' : '#F5F5F7' }}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⚠️</div>
        <Heading level={2} className="mb-4">
          Unable to Load Menu
        </Heading>
        <Text variant="body" color="secondary" className="mb-8">
          {error}
        </Text>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`min-h-[44px] px-8 py-3 rounded-[1rem] font-semibold transition-all duration-200 active:scale-95 ${
              theme === 'dark'
                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
                : 'bg-black/5 hover:bg-black/10 text-black border border-black/10'
            }`}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
});
