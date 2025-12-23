import React, { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';

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
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  const theme = useAtomValue(themeAtom);

  const baseClasses = "backdrop-blur-[20px] saturate-[180%] overflow-hidden";
  const themeClasses = theme === 'dark'
    ? 'bg-black/50 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white'
    : 'bg-white/85 border-black/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] text-black';

  if (isLoading) {
    return (
      <div className={`w-full h-48 flex items-center justify-center ${className}`}>
        <div className={`animate-pulse ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-[2.2rem] ${baseClasses} ${themeClasses} ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`
              ${theme === 'dark' ? 'border-b border-white/10 bg-white/5' : 'border-b border-black/[0.05] bg-black/[0.02]'}
            `}>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`
                    p-6 text-[12px] font-bold uppercase tracking-widest opacity-60
                    ${col.className || ''}
                  `}
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
                  className="p-12 text-center opacity-40 text-[17px]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => onRowClick?.(item)}
                  className={`
                    transition-all duration-200
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5'}
                    ${idx !== data.length - 1 ? (theme === 'dark' ? 'border-b border-white/5' : 'border-b border-black/[0.03]') : ''}
                  `}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={`p-6 text-[17px] ${col.className || ''}`}
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

