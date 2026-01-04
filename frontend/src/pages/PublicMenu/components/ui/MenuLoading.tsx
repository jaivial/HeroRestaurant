import { memo } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/atoms/themeAtoms';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import type { MenuLoadingProps } from '../../types';

export const MenuLoading = memo(function MenuLoading(_props: MenuLoadingProps) {
  const theme = useAtomValue(themeAtom);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#000000' : '#F5F5F7' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <Skeleton variant="circular" className="w-20 h-20 mx-auto mb-6" />
          <Skeleton variant="text" className="w-32 h-4 mx-auto mb-3" />
          <Skeleton variant="text" className="w-64 h-8 mx-auto mb-6" />
          <div className="flex justify-center gap-3">
            <Skeleton variant="rounded" className="w-32 h-16" />
          </div>
        </div>

        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton variant="text" className="w-40 h-6 mb-4" />
              <div className="space-y-4">
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className={`rounded-[2.2rem] p-6 border ${
                      theme === 'dark' ? 'bg-black/30 border-white/10' : 'bg-white/90 border-black/5'
                    }`}
                  >
                    <Skeleton variant="text" className="w-48 h-5 mb-3" />
                    <Skeleton variant="text" lines={2} className="mb-4" />
                    <div className="flex gap-2">
                      <Skeleton variant="rounded" className="w-20 h-6" />
                      <Skeleton variant="rounded" className="w-20 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
