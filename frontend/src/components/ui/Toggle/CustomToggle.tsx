import { Switch } from '@headlessui/react';
import React from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../atoms/themeAtoms';
import { cn } from '../../../utils/cn';

interface CustomToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CustomToggle: React.FC<CustomToggleProps> = ({
  label,
  description,
  checked,
  onChange,
  className,
}) => {
  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-300 border-2 group cursor-pointer",
        checked
          ? isDark 
            ? "bg-[#252525] border-apple-blue shadow-apple-md" 
            : "bg-black/5 border-black shadow-apple-md"
          : isDark
            ? "bg-[#161617] border-[#616161] hover:border-[#9E9E9E] hover:bg-[#252525] shadow-sm"
            : "bg-[#F5F5F7] border-[#BDBDBD] hover:border-[#757575] hover:bg-[#E8E8ED] shadow-sm",
        className
      )}
      onClick={() => onChange(!checked)}
    >
      <div className="flex flex-col items-start text-left space-y-1">
        <span className={cn(
          "text-xl font-bold transition-colors duration-300",
          checked 
            ? isDark ? "text-white" : "text-black" 
            : isDark ? "text-white" : "text-black"
        )}>
          {label}
        </span>
        {description && (
          <span className="text-base text-content-secondary">
            {description}
          </span>
        )}
      </div>

      <Switch
        checked={checked}
        onChange={onChange}
        className={cn(
          "relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2",
          checked
            ? isDark ? "bg-apple-blue border-apple-blue shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" : "bg-black border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
            : isDark ? "bg-apple-gray-800 border-[#616161] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" : "bg-apple-gray-300 border-[#BDBDBD] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none inline-block h-[27px] w-[27px] transform rounded-full bg-white shadow-apple-md transition duration-300 ease-apple-spring",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </Switch>
    </div>
  );
};
