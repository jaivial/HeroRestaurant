import type { LoginFormProps } from '../../../types';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Button, Input } from '@/components/ui';

export function LoginForm({
  formData,
  errors,
  isLoading,
  onSubmit,
  onChange,
}: LoginFormProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errors.general && (
        <div className={`
          p-3 rounded-[1rem] border
          ${theme === 'dark' 
            ? 'bg-[#4A1C1C] border-[#C62828] text-[#EF5350]' 
            : 'bg-[#FFEBEE] border-[#E57373] text-[#C62828]'}
        `}>
          <p className="text-sm">
            {errors.general}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#AEAEB2]' : 'text-[#636366]'}`}>
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          className={`
            w-full px-4 py-2.5 rounded-[0.875rem] border-2 transition-all outline-none
            ${theme === 'dark'
              ? 'bg-[#1C1C1E] border-[#3A3A3C] text-white focus:border-[#64B5F6] focus:ring-4 focus:ring-[#64B5F6]/20'
              : 'bg-white border-[#E5E5EA] text-[#1C1C1E] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/20'}
            ${errors.email ? 'border-[#FF3B30]' : ''}
          `}
        />
        {errors.email && <p className="text-xs text-[#FF3B30] mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-[#AEAEB2]' : 'text-[#636366]'}`}>
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => onChange('password', e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          className={`
            w-full px-4 py-2.5 rounded-[0.875rem] border-2 transition-all outline-none
            ${theme === 'dark'
              ? 'bg-[#1C1C1E] border-[#3A3A3C] text-white focus:border-[#64B5F6] focus:ring-4 focus:ring-[#64B5F6]/20'
              : 'bg-white border-[#E5E5EA] text-[#1C1C1E] focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/20'}
            ${errors.password ? 'border-[#FF3B30]' : ''}
          `}
        />
        {errors.password && <p className="text-xs text-[#FF3B30] mt-1">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            className={`
              w-4 h-4 rounded-[0.5rem] border transition-colors cursor-pointer
              ${theme === 'dark' 
                ? 'bg-[#1C1C1E] border-[#3A3A3C] checked:bg-[#64B5F6]' 
                : 'bg-white border-[#D1D1D6] checked:bg-[#007AFF]'}
            `}
          />
          <span className={`
            ml-2 text-sm transition-colors
            ${theme === 'dark' ? 'text-[#AEAEB2] group-hover:text-[#FFFFFF]' : 'text-[#636366] group-hover:text-[#1C1C1E]'}
          `}>
            Remember me
          </span>
        </label>

        <a
          href="/forgot-password"
          className={`
            text-sm hover:underline transition-colors
            ${theme === 'dark' ? 'text-[#64B5F6]' : 'text-[#007AFF]'}
          `}
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`
          w-full h-[3rem] rounded-[1rem] font-bold text-lg
          transition-all duration-250 active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-[0_4px_12px_rgba(0,0,0,0.15)]
          ${theme === 'dark'
            ? 'bg-[#FFFFFF] text-[#000000] hover:bg-[#F2F2F7]'
            : 'bg-[#FFFFFF] text-[#000000] border-2 border-[#000000] hover:bg-[#1C1C1E] hover:text-[#FFFFFF]'}
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}

