import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import type { AllergenTagProps } from '../../types';

export const AllergenTag = memo(function AllergenTag({
  allergenId,
  name,
  icon,
}: AllergenTagProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${
        theme === 'dark' ? 'bg-white/10 text-white/80' : 'bg-black/5 text-black/70'
      }`}
      title={name}
    >
      <span className="text-[14px]">{icon}</span>
      <span>{name}</span>
    </div>
  );
});
