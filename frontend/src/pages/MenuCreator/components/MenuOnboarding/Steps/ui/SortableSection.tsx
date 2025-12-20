// src/pages/MenuCreator/components/MenuOnboarding/Steps/ui/SortableSection.tsx
import { memo, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '../../../../../../components/ui/Card/Card';
import { Input } from '../../../../../../components/ui/Input/Input';
import { IconButton } from '../../../../../../components/ui/IconButton/IconButton';
import { cn } from '../../../../../../utils/cn';
import type { SortableSectionProps } from '../../../../types';

export const SortableSection = memo(function SortableSection({ 
  section, 
  index, 
  total, 
  onRemove, 
  onUpdateName, 
  onMove 
}: SortableSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative", isDragging && "z-50")}>
      <Card 
        className={cn(
          "group overflow-hidden transition-all duration-300 border-2 rounded-[2.2rem]",
          isDragging 
            ? "shadow-apple-xl scale-[1.02] ring-2 ring-apple-blue/20 border-apple-blue bg-surface-primary" 
            : "border-apple-gray-100 dark:border-apple-gray-800 bg-surface-primary hover:border-apple-blue/30 hover:shadow-apple-md"
        )}
      >
        <div className="flex items-center gap-6 p-6">
          <div className="flex items-center gap-2 bg-apple-gray-50 dark:bg-apple-gray-900/50 p-2.5 rounded-[1.2rem] border border-apple-gray-100 dark:border-apple-gray-800">
            <div 
              {...attributes} 
              {...listeners}
              className="p-2 cursor-grab active:cursor-grabbing text-apple-gray-400 hover:text-apple-blue transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="9" cy="8" r="1.5" />
                <circle cx="15" cy="8" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="16" r="1.5" />
                <circle cx="15" cy="16" r="1.5" />
              </svg>
            </div>
            <div className="flex items-center gap-1 border-l pl-1">
              <IconButton 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 15l7-7 7 7" strokeWidth={2.5} /></svg>}
                variant="ghost"
                size="sm"
                className="h-8 w-8 hover:bg-apple-blue/10 hover:text-apple-blue"
                onClick={() => onMove(index, 'up')}
                disabled={index === 0}
              />
              <IconButton 
                icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={2.5} /></svg>}
                variant="ghost"
                size="sm"
                className="h-8 w-8 hover:bg-apple-blue/10 hover:text-apple-blue"
                onClick={() => onMove(index, 'down')}
                disabled={index === total - 1}
              />
            </div>
          </div>

          <div className="flex-1">
            <Input 
              ref={inputRef}
              variant="ghost" 
              wrapperClassName="group/input-wrap rounded-2xl transition-all duration-300 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800 focus-within:bg-apple-gray-100 dark:focus-within:bg-apple-gray-800 focus-within:ring-4 focus-within:ring-apple-blue/15"
              className={cn(
                "font-bold text-2xl h-auto border-none placeholder:text-apple-gray-300 cursor-text w-full bg-transparent"
              )}
              value={section.name}
              placeholder="Section Name"
              onChange={(e) => onUpdateName(section.id, e.target.value)}
              rightIcon={
                <div 
                  className="text-apple-gray-400 mr-2 cursor-pointer hover:text-apple-blue transition-colors p-1.5 rounded-lg hover:bg-apple-blue/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.focus();
                  }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              }
            />
          </div>

          <IconButton 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14" strokeWidth={2} /></svg>}
            variant="ghost"
            className="text-apple-red transition-all duration-300 hover:bg-apple-red/10"
            onClick={() => onRemove(section.id)}
          />
        </div>
      </Card>
    </div>
  );
});

