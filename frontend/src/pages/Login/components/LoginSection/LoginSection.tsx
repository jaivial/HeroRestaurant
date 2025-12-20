import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { useLoginForm } from '../../hooks/useLoginForm';
import { LoginForm } from './ui/LoginForm';
import { LoginHeader } from './ui/LoginHeader';
import { LoginFooter } from './ui/LoginFooter';
import { useNavigate } from 'react-router-dom';

export function LoginSection() {
  const theme = useAtomValue(themeAtom);
  const navigate = useNavigate();
  const { formData, errors, isLoading, handleSubmit, handleChange } = useLoginForm();

  const glassClasses = theme === 'dark'
    ? 'backdrop-blur-[20px] saturate-[180%] bg-[#000000BF] border border-[#FFFFFF1A] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-2px_rgba(0,0,0,0.2)]'
    : 'backdrop-blur-[20px] saturate-[180%] bg-[#FFFFFFE6] border border-[#FFFFFF2E] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]';

  return (
    <div className={`
      w-full max-w-md p-8
      ${glassClasses}
      rounded-[2.2rem]
      transition-all duration-300
    `}>
      <LoginHeader 
        title="HeroRestaurant" 
        subtitle="Sign in to your account" 
      />
      
      <LoginForm 
        formData={formData}
        errors={errors}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onChange={handleChange}
      />

      <LoginFooter onSignupClick={() => navigate('/signup')} />
    </div>
  );
}

