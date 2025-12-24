// frontend/src/pages/Shifts/components/WeeklyCalendar/ui/WeeklyCalendarUI.tsx

import { memo } from 'react';
import { Text, Badge, Button, Tabs, TabsList, TabsTrigger, IconButton } from '@/components/ui';
import { cn } from '@/utils/cn';
import { LayoutGrid, List, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { safeParseDate } from '@/utils/time';
import type { WeeklyCalendarUIProps } from '../../../types';

export const WeeklyCalendarUI = memo(function WeeklyCalendarUI({
  isDark,
  scrollRef,
  layout,
  setLayout,
  weekOffset,
  isAnimating,
  calendarDays,
  currentVerticalWeek,
  weekRangeLabel,
  onDragStart,
  onDragMove,
  onDragEnd,
  onGoToToday,
  onWeekChange,
  verticalContainerRef,
  isConstrained,
  onShiftClick
}: WeeklyCalendarUIProps) {
  return (
    <div className="relative group w-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .inner-scrollbar-hide::-webkit-scrollbar { display: none; }
        .inner-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .ease-apple { transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0); }
      `}} />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 px-4">
        <Tabs 
          value={layout} 
          onChange={(v) => setLayout(v as 'horizontal' | 'vertical')}
        >
          <TabsList variant="glass" className="p-1">
            <TabsTrigger value="horizontal" className="flex items-center gap-2 px-4 py-1.5">
              <LayoutGrid size={16} />
              <span>Carousel</span>
            </TabsTrigger>
            <TabsTrigger value="vertical" className="flex items-center gap-2 px-4 py-1.5">
              <List size={16} />
              <span>Column</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          {layout === 'vertical' && (
            <div className="flex items-center gap-2 mr-2">
              <IconButton 
                icon={<ChevronLeft size={20} />} 
                variant="glass" 
                size="sm"
                onClick={() => onWeekChange('prev')}
                disabled={weekOffset <= -52 || isAnimating}
              />
              <Text weight="bold" className={cn(
                "text-[14px] min-w-[180px] text-center",
                isDark ? "text-white" : "text-black"
              )}>
                {weekRangeLabel}
              </Text>
              <IconButton 
                icon={<ChevronRight size={20} />} 
                variant="glass" 
                size="sm"
                onClick={() => onWeekChange('next')}
                disabled={weekOffset >= 52 || isAnimating}
              />
            </div>
          )}
          <Button 
            variant="glass" 
            size="sm" 
            onClick={onGoToToday}
            className="rounded-full font-bold text-[13px]"
            disabled={isAnimating}
          >
            Go to Today
          </Button>
        </div>
      </div>

      {layout === 'horizontal' ? (
        <div className={cn(
          "relative",
          !isConstrained && "md:left-[calc(50%-(50vw-140px))] md:w-[calc(100vw-280px)] md:max-w-none"
        )}>
          <div 
            ref={scrollRef}
            onMouseDown={(e) => onDragStart(e.pageX, (e.currentTarget as HTMLElement).offsetLeft)}
            onMouseLeave={onDragEnd}
            onMouseUp={onDragEnd}
            onMouseMove={(e) => onDragMove(e.pageX, (e.currentTarget as HTMLElement).offsetLeft)}
            onTouchStart={(e) => onDragStart(e.touches[0].pageX, (e.currentTarget as HTMLElement).offsetLeft)}
            onTouchMove={(e) => onDragMove(e.touches[0].pageX, (e.currentTarget as HTMLElement).offsetLeft, 1.5)}
            onTouchEnd={onDragEnd}
            className={cn(
              "flex flex-col md:flex-row gap-4 overflow-y-auto md:overflow-x-auto max-h-[70vh] md:max-h-none pb-6 cursor-grab active:cursor-grabbing no-scrollbar select-none",
              !isConstrained && "md:px-8 min-[1024px]:px-16"
            )}
            style={{ 
              scrollSnapType: 'none',
              touchAction: 'pan-y'
            }}
          >
            {calendarDays.map((day, idx) => (
              <div 
                key={idx}
                data-today={day.isToday}
                className={cn(
                  "flex-shrink-0 w-full md:w-[260px] flex flex-col min-h-[280px] md:min-h-[340px] p-6 rounded-[2.2rem] transition-all duration-350 ease-apple",
                  "border backdrop-blur-[20px] saturate-[180%] scroll-snap-align-center",
                  day.isToday
                    ? (isDark 
                        ? "bg-apple-blue/20 border-apple-blue/40 border-white/20" 
                        : "bg-apple-blue/10 border-apple-blue/30 border-black/[0.08]")
                    : (isDark 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/80 border-black/[0.05]")
                )}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col">
                    <Text weight="bold" className={day.isToday ? "text-apple-blue" : (isDark ? "text-white/40" : "text-black/40")}>
                      {day.name}
                    </Text>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-[28px] font-bold leading-none",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {day.dayNumber}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className={cn(
                          "text-[12px] font-bold uppercase",
                          isDark ? "text-white/40" : "text-black/40"
                        )}>
                          {day.month}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium opacity-30",
                          isDark ? "text-white" : "text-black"
                        )}>
                          {day.date.getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {day.totalMinutes > 0 && (
                    <Badge variant={day.isToday ? "default" : "info"} size="sm" className="font-bold">
                      {(day.totalMinutes / 60).toFixed(1)}h
                    </Badge>
                  )}
                </div>

                <div 
                  className="flex-1 space-y-3 overflow-y-auto max-h-[180px] pr-1 inner-scrollbar-hide"
                  style={{ touchAction: 'pan-y' }}
                >
                  {day.shifts.length === 0 && day.scheduled.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <Text variant="caption" className={cn(
                        "italic font-medium",
                        isDark ? "text-white/20" : "text-black/20"
                      )}>No activity</Text>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Scheduled Shifts */}
                      {day.scheduled.map((s: any) => (
                        <div 
                          key={s.id}
                          onClick={() => onShiftClick?.(s, 'scheduled')}
                          className={cn(
                            "p-3 rounded-[1rem] border-l-4 transition-all hover:scale-[1.02] cursor-pointer",
                            isDark ? "bg-white/5 hover:bg-white/10" : "bg-black/[0.03] hover:bg-black/[0.06]"
                          )}
                          style={{ borderLeftColor: s.color || '#007AFF' }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider",
                              isDark ? "text-white/40" : "text-black/40"
                            )}>
                              {s.label || 'Scheduled'}
                            </span>
                            <CalendarIcon size={12} className="opacity-30" />
                          </div>
                          <div className={cn(
                            "font-bold text-[13px]",
                            isDark ? "text-white" : "text-black"
                          )}>
                            {new Date(s.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(s.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {s.notes && (
                            <Text variant="caption1" className="mt-1 text-[11px] opacity-60 line-clamp-1 italic">
                              &quot;{s.notes}&quot;
                            </Text>
                          )}
                        </div>
                      ))}

                      {/* Actual Shifts (History) */}
                      {day.shifts.map((shift: any) => (
                        <div 
                          key={shift.id}
                          onClick={() => onShiftClick?.(shift, 'history')}
                          className={cn(
                            "p-3 rounded-[1rem] transition-colors cursor-pointer",
                            isDark ? "bg-white/10 hover:bg-white/15" : "bg-black/5 hover:bg-black/[0.08]"
                          )}
                        >
                          <div className={cn(
                            "font-bold flex justify-between items-center text-[13px]",
                            isDark ? "text-white" : "text-black"
                          )}>
                            <span className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                              {safeParseDate(shift.punchInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={isDark ? "text-white/30" : "text-black/30"}>—</span>
                            <span>
                              {shift.punchOutAt 
                                ? safeParseDate(shift.punchOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Active'}
                            </span>
                          </div>
                          {shift.notes && (
                            <Text variant="caption1" className={cn(
                              "mt-1.5 text-[11px] leading-tight line-clamp-2",
                              isDark ? "text-white/60" : "text-black/60"
                            )} title={shift.notes}>
                              {shift.notes}
                            </Text>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pb-8 overflow-x-hidden">
          <div 
            ref={verticalContainerRef}
            className="w-full max-w-[480px] space-y-4"
          >
            {currentVerticalWeek.map((day, idx) => (
              <div 
                key={`${weekOffset}-${idx}`}
                className={cn(
                  "vertical-card w-full flex flex-col md:flex-row gap-4 p-5 rounded-[2rem] transition-all duration-300",
                  "border backdrop-blur-[20px] saturate-[180%]",
                  day.isToday
                    ? (isDark 
                        ? "bg-apple-blue/20 border-apple-blue/40" 
                        : "bg-apple-blue/10 border-apple-blue/30")
                    : (isDark 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/80 border-black/[0.05]")
                )}
              >
                <div className="flex md:flex-col justify-between md:justify-center items-center md:items-start min-w-[90px] border-b md:border-b-0 md:border-r border-white/10 md:pr-4 pb-2 md:pb-0">
                  <div>
                    <Text weight="bold" className={cn(
                      "text-[11px] uppercase tracking-widest",
                      day.isToday ? "text-apple-blue" : (isDark ? "text-white/40" : "text-black/40")
                    )}>
                      {day.name}
                    </Text>
                    <div className="flex items-baseline gap-1">
                      <span className={cn(
                        "text-[22px] font-bold leading-none",
                        isDark ? "text-white" : "text-black"
                      )}>
                        {day.dayNumber}
                      </span>
                      <span className={cn(
                        "text-[11px] font-semibold uppercase",
                        isDark ? "text-white/40" : "text-black/40"
                      )}>
                        {day.month}
                      </span>
                    </div>
                  </div>
                  {day.totalMinutes > 0 && (
                    <Badge variant={day.isToday ? "default" : "info"} size="sm" className="font-bold md:mt-1.5 py-0 px-2 h-5 text-[10px]">
                      {(day.totalMinutes / 60).toFixed(1)}h
                    </Badge>
                  )}
                </div>

                <div className="flex-1 py-1">
                  {day.shifts.length === 0 && day.scheduled.length === 0 ? (
                    <div className="h-full flex items-center">
                      <Text variant="caption" className={cn(
                        "italic font-medium",
                        isDark ? "text-white/20" : "text-black/20"
                      )}>No shifts recorded</Text>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Scheduled Shifts */}
                      {day.scheduled.map((s: any) => (
                        <div 
                          key={s.id}
                          onClick={() => onShiftClick?.(s, 'scheduled')}
                          className={cn(
                            "flex flex-col p-2.5 rounded-xl border-l-4 transition-all w-full cursor-pointer",
                            isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-black/[0.02] border-black/[0.02] hover:bg-black/[0.04]"
                          )}
                          style={{ borderLeftColor: s.color || '#007AFF' }}
                        >
                          <div className={cn(
                            "font-bold flex items-center gap-2 text-[12px]",
                            isDark ? "text-white" : "text-black"
                          )}>
                            <CalendarIcon size={12} className="text-apple-blue" />
                            <span className="flex-1">
                              {new Date(s.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' — '}
                              {new Date(s.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="opacity-40 text-[10px]">
                              {s.label || 'Scheduled'}
                            </span>
                          </div>
                          {s.notes && (
                            <Text variant="caption1" className={cn(
                              "mt-0.5 text-[10px] line-clamp-1 opacity-50 italic",
                              isDark ? "text-white" : "text-black"
                            )}>
                              &quot;{s.notes}&quot;
                            </Text>
                          )}
                        </div>
                      ))}

                      {/* History Shifts */}
                      {day.shifts.map((shift: any) => (
                        <div 
                          key={shift.id}
                          onClick={() => onShiftClick?.(shift, 'history')}
                          className={cn(
                            "flex flex-col p-2.5 rounded-xl border transition-colors w-full cursor-pointer",
                            isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-black/[0.02] border-black/[0.02] hover:bg-black/[0.04]"
                          )}
                        >
                          <div className={cn(
                            "font-bold flex items-center gap-2 text-[12px]",
                            isDark ? "text-white" : "text-black"
                          )}>
                            <Clock size={12} className="text-apple-blue" />
                            <span className="flex-1">
                              {safeParseDate(shift.punchInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {' — '}
                              {shift.punchOutAt 
                                ? safeParseDate(shift.punchOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Active'}
                            </span>
                            {shift.totalMinutes && (
                              <span className="opacity-40 text-[10px]">
                                {((shift.totalMinutes)/60).toFixed(1)}h
                              </span>
                            )}
                          </div>
                          {shift.notes && (
                            <Text variant="caption1" className={cn(
                              "mt-0.5 text-[10px] line-clamp-1 opacity-50 italic",
                              isDark ? "text-white" : "text-black"
                            )}>
                              &quot;{shift.notes}&quot;
                            </Text>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
