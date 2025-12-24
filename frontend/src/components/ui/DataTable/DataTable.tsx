import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { cn } from '@/utils/cn';

export interface Column<T> {
  header: string | React.ReactNode;
  key: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  className?: string;
  emptyMessage?: string;
  theme?: 'light' | 'dark';
}

/**
 * DataTable Component
 * 
 * Follows SOLID principles:
 * - SRP: Responsible only for rendering a list of data in a table format.
 * - OCP: Open for extension via generic types T and custom render functions in Column definitions.
 * - ISP: Column definitions are minimal and only require what's needed for rendering.
 */
function DataTableComponent<T>({ 
  data, 
  columns, 
  onRowClick, 
  isLoading, 
  className = '',
  emptyMessage = 'No data available',
  theme: propTheme
}: DataTableProps<T>) {
  const globalTheme = useAtomValue(themeAtom);
  const theme = propTheme || globalTheme;

  const baseClasses = "backdrop-blur-[20px] saturate-[180%] overflow-hidden";
  const themeClasses = theme === 'dark'
    ? 'bg-[#1C1C1E]/80 border-white/[0.12] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]'
    : 'bg-white/85 border-black/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]';

  if (isLoading) {
    return (
      <div className={cn("w-full h-48 flex items-center justify-center", className)}>
        <div className={cn("animate-pulse", theme === 'dark' ? 'text-white/40' : 'text-black/40')}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-[1.2rem] ring-1 ring-inset", 
      theme === 'dark' ? 'ring-white/[0.05]' : 'ring-black/[0.02]',
      baseClasses, themeClasses, className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn(
              "border-b",
              theme === 'dark' ? 'border-white/10 bg-white/[0.02]' : 'border-black/[0.05] bg-black/[0.02]'
            )}>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={cn(
                    "p-6 text-[12px] font-bold uppercase tracking-widest",
                    theme === 'dark' ? 'text-white/60' : 'text-black/50',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className={cn(
                    "p-12 text-center text-[17px]",
                    theme === 'dark' ? 'text-white/40' : 'text-black/40'
                  )}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "transition-all duration-200",
                    onRowClick && "cursor-pointer",
                    theme === 'dark' ? 'hover:bg-white/[0.04]' : 'hover:bg-black/5',
                    idx !== data.length - 1 && (theme === 'dark' ? 'border-b border-white/[0.06]' : 'border-b border-black/[0.03]')
                  )}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={cn(
                        "p-6 text-[17px]", 
                        theme === 'dark' ? 'text-white' : 'text-[#1D1D1F]',
                        col.className
                      )}
                    >
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
