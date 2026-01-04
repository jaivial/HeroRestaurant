import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text } from '@/components/ui/Text/Text';

export const EmptySection = memo(function EmptySection() {
  const theme = useAtomValue(themeAtom);

  return (
    <div
      className={`rounded-[2.2rem] p-8 text-center border ${
        theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-white/50 border-black/5'
      }`}
    >
      <Text variant="callout" color="tertiary">
        No dishes in this section yet
      </Text>
    </div>
  );
});
