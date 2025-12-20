import type { LoginFooterProps } from '../../../types';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

export function LoginFooter({ onSignupClick }: LoginFooterProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div className="mt-6 text-center">
      <p className={`
        text-sm
        ${theme === 'dark' ? 'text-[#AEAEB2]' : 'text-[#636366]'}
      `}>
        Don't have an account?{' '}
        <a
          href="/signup"
          onClick={(e) => {
            if (onSignupClick) {
              e.preventDefault();
              onSignupClick();
            }
          }}
          className={`
            font-medium hover:underline transition-colors
            ${theme === 'dark' ? 'text-[#64B5F6]' : 'text-[#007AFF]'}
          `}
        >
          Sign up
        </a>
      </p>
    </div>
  );
}

