export function safeParseDate(dateStr: string | Date | number): Date {
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === 'number') return new Date(dateStr);
  
  const normalizedStr = typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') 
    ? `${dateStr.replace(' ', 'T')}Z` 
    : dateStr;
    
  return new Date(normalizedStr);
}

export function formatDuration(startTime: string | Date | number, includeSeconds: boolean = true): string {
  const start = safeParseDate(startTime).getTime();
  const now = Date.now();
  const diffInSeconds = Math.floor((now - start) / 1000);

  if (diffInSeconds < 0) return includeSeconds ? '00:00:00' : '00:00';

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (includeSeconds) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  
  return `${pad(hours)}:${pad(minutes)}`;
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTime(date: string | Date | number, use24h: boolean = true): string {
  const d = safeParseDate(date);
  return d.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: !use24h 
  });
}

