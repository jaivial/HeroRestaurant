import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Text, Heading } from '@/components/ui/Text/Text';
import type { MenuNotFoundProps } from '../../types';

export const MenuNotFound = memo(function MenuNotFound(_props: MenuNotFoundProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: theme === 'dark' ? '#000000' : '#F5F5F7' }}
    >
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔍</div>
        <Heading level={1} className="mb-4">
          Menu Not Found
        </Heading>
        <Text variant="body" color="secondary">
          The menu you're looking for doesn't exist or may have been removed.
        </Text>
      </div>
    </div>
  );
});
