import { useAtomValue } from 'jotai';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { wsClient } from '@/websocket';
import { authStatusAtom } from '@/atoms/authAtoms';
import { cn } from '@/utils/cn';

/**
 * Connection status indicator component
 * Shows when connection is lost or reconnecting for authenticated users
 * Hides on public pages (login, signup) and when connection is healthy
 */
export function ConnectionStatus() {
  const { status, statusMessage, canRetry, isHealthy, isUnhealthy } = useConnectionStatus();
  const authStatus = useAtomValue(authStatusAtom);

  // Don't show on public pages (when user is not authenticated)
  // WebSocket is only connected after authentication
  if (authStatus !== 'authenticated') return null;

  // Don't show when healthy
  if (isHealthy) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50',
        'px-4 py-2 rounded-lg shadow-lg',
        'flex items-center gap-2',
        'transition-all duration-300',
        'backdrop-blur-sm',
        isUnhealthy
          ? 'bg-red-500/90 text-white dark:bg-red-600/90'
          : 'bg-amber-500/90 text-black dark:bg-amber-600/90 dark:text-white'
      )}
    >
      {/* Status indicator */}
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          status === 'reconnecting' && 'animate-pulse bg-white',
          status === 'connecting' && 'animate-pulse bg-white',
          status === 'authenticating' && 'animate-pulse bg-white',
          status === 'connected' && 'bg-green-400',
          status === 'disconnected' && 'bg-red-300'
        )}
      />

      <span className="text-sm font-medium">{statusMessage}</span>

      {canRetry && (
        <button
          onClick={() => wsClient.connect()}
          className={cn(
            'ml-2 px-2 py-1 text-xs rounded',
            'bg-white/20 hover:bg-white/30',
            'transition-colors duration-150'
          )}
        >
          Retry
        </button>
      )}
    </div>
  );
}
