import type { LoginHeaderProps } from '../../../types';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export function LoginHeader({ title, subtitle }: LoginHeaderProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div className="mb-8 text-center">
      <h1 className={`
        text-3xl font-bold mb-2
        ${theme === 'dark' ? 'text-[#FFFFFF]' : 'text-[#0A0A0B]'}
      `}>
        {title}
      </h1>
      <p className={`
        ${theme === 'dark' ? 'text-[#AEAEB2]' : 'text-[#636366]'}
      `}>
        {subtitle}
      </p>
    </div>
  );
}

