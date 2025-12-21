// src/pages/MenuCreator/components/MenuOnboarding/Steps/ui/SortableDish.tsx
import { memo, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAtomValue } from 'jotai';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { themeAtom } from '../../../../../../atoms/themeAtoms';
import { Card, CardContent } from '../../../../../../components/ui/Card/Card';
import { Button } from '../../../../../../components/ui/Button/Button';
import { Input } from '../../../../../../components/ui/Input/Input';
import { IconButton } from '../../../../../../components/ui/IconButton/IconButton';
import { Toggle } from '../../../../../../components/ui/Toggle/Toggle';
import { Text } from '../../../../../../components/ui/Text/Text';
import { cn } from '../../../../../../utils/cn';
import { ALLERGENS } from '../../../../types';
import type { SortableDishProps } from '../../../../types';

export const SortableDish = memo(function SortableDish({
  dish,
  index,
  sectionId,
  total,
  onUpdate,
  onRemove,
  onMove,
  onEditAllergens,
  onImageUpload,
  uploadingDishId
}: SortableDishProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id });

  const theme = useAtomValue(themeAtom);
  const supplementRef = useRef<HTMLDivElement>(null);

  const isFirstRender = useRef(true);

  useGSAP(() => {
    const el = supplementRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (dish.hasSupplement) {
        gsap.set(el, { display: 'block', opacity: 1, x: 0, width: 'auto', marginLeft: 24 });
      } else {
        gsap.set(el, { display: 'none', opacity: 0, x: 30, width: 0, marginLeft: 0 });
      }
      return;
    }

    if (dish.hasSupplement) {
      gsap.killTweensOf(el);
      
      // Measure the exact width it needs to be
      gsap.set(el, { display: 'block', width: 'auto', opacity: 1, marginLeft: 24 });
      const targetWidth = el.offsetWidth;
      
      // Set initial state for the show animation
      gsap.set(el, { opacity: 0, x: 30, width: 0, marginLeft: 0, overflow: 'hidden' });

      gsap.to(el, {
        opacity: 1,
        x: 0,
        width: targetWidth,
        marginLeft: 24,
        duration: 0.7, // Slower and more intentional
        ease: 'expo.out',
        onComplete: () => {
          gsap.set(el, { width: 'auto', overflow: 'visible' });
        }
      });
    } else {
      gsap.killTweensOf(el);
      
      // Ensure we start from the current visual state before shrinking
      const currentWidth = el.offsetWidth;
      gsap.set(el, { width: currentWidth, overflow: 'hidden' });

      gsap.to(el, {
        opacity: 0,
        x: 30,
        width: 0,
        marginLeft: 0,
        duration: 0.6, // Slower hide animation
        ease: 'expo.inOut',
        onComplete: () => {
          gsap.set(el, { display: 'none' });
        }
      });
    }
  }, { dependencies: [dish.hasSupplement] });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative", isDragging && "z-50")}>
      <Card 
        className={cn(
          "group transition-all duration-500 border-2 rounded-[2.2rem] overflow-hidden relative",
          isDragging
            ? "shadow-apple-xl scale-[1.02] ring-2 ring-apple-blue/20 border-apple-blue"
            : "border-apple-gray-400 dark:border-apple-gray-600 hover:shadow-apple-xl"
        )}
        style={{ backgroundColor: theme === 'dark' ? '#121212' : '#c7baaa' }}
      >
        {/* Absolute Controls Wrapper */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          {/* Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className="bg-apple-gray-100 dark:bg-apple-gray-800 p-2.5 rounded-xl border border-apple-gray-200 dark:border-apple-gray-700 cursor-grab active:cursor-grabbing text-content-primary hover:text-apple-blue transition-all hover:scale-105 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="8" r="1.5" />
              <circle cx="15" cy="8" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="16" r="1.5" />
              <circle cx="15" cy="16" r="1.5" />
            </svg>
          </div>

          {/* Move Controls */}
          <div className="flex items-center gap-1 bg-apple-gray-100 dark:bg-apple-gray-800 p-1.5 rounded-xl border border-apple-gray-200 dark:border-apple-gray-700 shadow-sm">
            <IconButton
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 15l7-7 7 7" strokeWidth={3} /></svg>}
              size="sm"
              variant="ghost"
              className="h-7 w-7 hover:bg-apple-blue/10 hover:text-apple-blue"
              onClick={() => onMove(sectionId, index, 'up')}
              disabled={index === 0}
            />
            <IconButton
              icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 9l-7 7-7-7" strokeWidth={3} /></svg>}
              size="sm"
              variant="ghost"
              className="h-7 w-7 hover:bg-apple-blue/10 hover:text-apple-blue"
              onClick={() => onMove(sectionId, index, 'down')}
              disabled={index === total - 1}
            />
          </div>
        </div>

        <CardContent className="p-8 pt-20">
          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <Input
                    placeholder="Dish title"
                    className="font-bold text-2xl h-14 px-6 rounded-2xl bg-surface-secondary border-2 border-apple-gray-300 dark:border-apple-gray-700 focus:border-apple-blue transition-all"
                    value={dish.title}
                    onChange={(e) => onUpdate(sectionId, dish.id, { title: e.target.value })}
                  />
                  <div className="flex items-center justify-end">
                    <div
                      className="flex items-center gap-3 cursor-pointer bg-surface-secondary p-3 rounded-2xl border-2 border-apple-gray-300 dark:border-apple-gray-700"
                      onClick={() => onUpdate(sectionId, dish.id, { hasSupplement: !dish.hasSupplement })}
                    >
                      <Text weight="bold" className="text-base">Supplement</Text>
                      <div className={cn(
                        "relative w-12 h-6 rounded-full transition-colors duration-300 border-2",
                        dish.hasSupplement ? "bg-apple-blue border-apple-blue" : "bg-apple-gray-300 dark:bg-apple-gray-700 border-apple-gray-400 dark:border-apple-gray-600"
                      )}>
                        <div className={cn(
                          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300",
                          dish.hasSupplement ? "translate-x-6" : "translate-x-0"
                        )} />
                      </div>
                    </div>
                    <div 
                      ref={supplementRef}
                      className="relative whitespace-nowrap"
                      style={{ 
                        opacity: 0, // Initial state, GSAP will take over
                        overflow: 'hidden',
                        display: 'none' // Default to none, GSAP set will fix on mount
                      }}
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="w-32 h-12 pl-10 rounded-2xl bg-surface-primary border-2 border-apple-blue"
                        value={dish.supplementPrice ?? 0}
                        onChange={(e) => onUpdate(sectionId, dish.id, { supplementPrice: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue font-bold text-lg">+</span>
                    </div>
                  </div>
                </div>

                {dish.showDescription && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Input
                      placeholder="Describe this delicious dish..."
                      className="text-lg text-content-secondary h-14 px-6 rounded-2xl bg-surface-secondary border-2 border-apple-gray-300 dark:border-apple-gray-700 focus:border-apple-blue transition-all italic"
                      value={dish.description || ''}
                      onChange={(e) => onUpdate(sectionId, dish.id, { description: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-2 border-t border-apple-gray-100 dark:border-apple-gray-800">
                <div className="flex items-center gap-6">
                  <div className="relative group/avatar">
                    <div
                      className={cn(
                        "cursor-pointer transition-all duration-300 hover:scale-105 ring-4 ring-transparent hover:ring-apple-blue/20 border-2 border-apple-gray-200 rounded-[2.2rem] w-24 h-24 overflow-hidden bg-surface-tertiary flex items-center justify-center",
                        uploadingDishId === dish.id && "opacity-50"
                      )}
                      onClick={() => document.getElementById(`file-input-${dish.id}`)?.click()}
                    >
                      {dish.imageUrl ? (
                        <img
                          src={dish.imageUrl}
                          alt={dish.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-semibold text-content-secondary select-none">
                          {dish.title ? dish.title.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'}
                        </span>
                      )}
                    </div>
                    {uploadingDishId === dish.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-3 border-apple-blue border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    <input
                      id={`file-input-${dish.id}`}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onImageUpload(sectionId, dish.id, file);
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-apple-blue text-white rounded-full p-2 shadow-apple-md opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 4v16m8-8H4" strokeWidth={3} strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-full px-4 h-9 text-xs font-bold"
                      onClick={() => document.getElementById(`file-input-${dish.id}`)?.click()}
                    >
                      Upload Image
                    </Button>
                    <Toggle
                      size="sm"
                      label="Show Image"
                      checked={dish.showImage}
                      onChange={(checked) => onUpdate(sectionId, dish.id, { showImage: checked })}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <Toggle
                    size="sm"
                    label="Description"
                    checked={dish.showDescription}
                    onChange={(checked) => onUpdate(sectionId, dish.id, { showDescription: checked })}
                  />
                  
                  <Toggle
                    size="sm"
                    label="Modal View"
                    checked={dish.openModal}
                    onChange={(checked) => onUpdate(sectionId, dish.id, { openModal: checked })}
                  />
                </div>

                <div className="flex-1 flex items-center justify-end gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {dish.allergens.length > 0 ? (
                      dish.allergens.map(aId => {
                        const allergen = ALLERGENS.find(a => a.id === aId);
                        return (
                          <div key={aId} className="w-11 h-11 rounded-full bg-surface-primary border-2 border-apple-gray-200 flex items-center justify-center text-xl shadow-apple-sm" title={allergen?.name}>
                            {allergen?.icon}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center gap-2 bg-info-bg-red-light dark:bg-info-bg-red-dark px-4 py-2 rounded-full border-2 border-info-border-red-light dark:border-info-border-red-dark">
                        <svg className="w-5 h-5 text-info-text-red-light dark:text-info-text-red-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth={2} strokeLinecap="round" />
                        </svg>
                        <Text variant="caption2" weight="bold" className="text-info-text-red-light dark:text-info-text-red-dark">No allergens selected</Text>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={dish.allergens.length === 0 ? 'danger' : 'secondary'}
                    className={cn(
                      "rounded-full px-6 h-11 font-bold transition-all border-2",
                      dish.allergens.length === 0
                        ? "bg-apple-red text-white hover:bg-apple-red-hover shadow-apple-md"
                        : "border-apple-gray-300 dark:border-apple-gray-700 hover:border-apple-blue hover:text-apple-blue",
                      dish.allergens.length === 0 && theme === 'light' && "text-black"
                    )}
                    onClick={() => onEditAllergens(sectionId, dish)}
                  >
                    {dish.allergens.length === 0 ? 'Select Allergens' : 'Edit Allergens'}
                  </Button>
                </div>
              </div>
            </div>

            <IconButton
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14" strokeWidth={2} /></svg>}
              variant="ghost"
              className="text-apple-red opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-apple-red/10 mt-2"
              onClick={() => onRemove(sectionId, dish.id)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

