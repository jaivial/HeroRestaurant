import { useAuth } from '@/hooks/useAuth';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { LoginSection } from './components/LoginSection/LoginSection';

export function Login() {
  const { authStatus } = useAuth();
  const theme = useAtomValue(themeAtom);

  if (authStatus === 'unknown') {
    return null;
  }

  return (
    <div className={`
      min-h-screen flex items-center justify-center
      transition-colors duration-500
      ${theme === 'dark' ? 'bg-[#0A0A0B]' : 'bg-[#D1D1D6]'}
      p-4
      min-[200px]:p-2
      min-[360px]:p-4
      min-[640px]:p-8
    `}>
      <LoginSection />
    </div>
  );
}
