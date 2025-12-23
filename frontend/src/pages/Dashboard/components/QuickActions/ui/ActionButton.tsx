import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';
import type { ActionButtonProps } from '../../../types';

export function ActionButton({ label, icon, color, onClick }: ActionButtonProps) {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const glassClasses = isDark
    ? 'backdrop-blur-[20px] saturate-[180%] bg-white/[0.03] border-white/10 hover:bg-white/10'
    : 'backdrop-blur-[20px] saturate-[180%] bg-black/5 border-black/5 hover:bg-black/10';

  const colorStyles = {
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    green: isDark ? 'text-emerald-400' : 'text-emerald-600',
    purple: isDark ? 'text-purple-400' : 'text-purple-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-[2.2rem] text-left transition-all duration-300',
        'border',
        glassClasses,
        'group'
      )}
    >
      <div className={cn(
        'mb-2 transition-transform duration-300 group-hover:scale-110 group-active:scale-95',
        colorStyles[color]
      )}>
        {icon}
      </div>
      <p className={cn(
        'font-medium transition-colors duration-300',
        isDark ? 'text-white/80 group-hover:text-white' : 'text-black/80 group-hover:text-black'
      )}>
        {label}
      </p>
    </button>
  );
}

type SvgProps = React.SVGProps<SVGSVGElement>;

export const IconPlus = (props: SvgProps) => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export const IconTable = (props: SvgProps) => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export const IconMenu = (props: SvgProps) => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

export const IconChart = (props: SvgProps) => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

