// src/pages/MenuCreator/components/MenuOnboarding/Steps/ui/SortableDish.tsx
import { memo, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAtomValue } from 'jotai';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  MoreVertical, 
  Image as ImageIcon, 
  FileText, 
  DollarSign, 
  Maximize2,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { themeAtom } from '../../../../../../atoms/themeAtoms';
import { Card, CardContent } from '../../../../../../components/ui/Card/Card';
import { Button } from '../../../../../../components/ui/Button/Button';
import { Input } from '../../../../../../components/ui/Input/Input';
import { IconButton } from '../../../../../../components/ui/IconButton/IconButton';
import { Toggle } from '../../../../../../components/ui/Toggle/Toggle';
import { Text } from '../../../../../../components/ui/Text/Text';
import { Textarea } from '../../../../../../components/ui/Textarea/Textarea';
import { Tooltip } from '../../../../../../components/ui/Tooltip/Tooltip';
import { Badge } from '../../../../../../components/ui/Badge/Badge';
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
  const isDark = theme === 'dark';
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
            : cn(
                "hover:shadow-apple-xl",
                isDark ? "border-apple-gray-600" : "border-apple-gray-400"
              )
        )}
        style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}
      >
        {/* Absolute Controls Wrapper */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          {/* Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className={cn(
              "p-2.5 rounded-xl border cursor-grab active:cursor-grabbing text-content-primary hover:text-apple-blue transition-all hover:scale-105 shadow-sm flex items-center justify-center",
              isDark ? "bg-apple-gray-800 border-apple-gray-700" : "bg-apple-gray-100 border-apple-gray-200"
            )}
          >
            <GripVertical size={20} />
          </div>

          {/* Move Controls */}
          <div className={cn(
            "flex items-center gap-1 p-1.5 rounded-xl border shadow-sm",
            isDark ? "bg-apple-gray-800 border-apple-gray-700" : "bg-apple-gray-100 border-apple-gray-200"
          )}>
            <IconButton
              icon={<ChevronUp size={16} strokeWidth={3} />}
              size="sm"
              variant="ghost"
              className="h-7 w-7 hover:bg-apple-blue/10 hover:text-apple-blue flex items-center justify-center"
              onClick={() => onMove(sectionId, index, 'up')}
              disabled={index === 0}
            />
            <IconButton
              icon={<ChevronDown size={16} strokeWidth={3} />}
              size="sm"
              variant="ghost"
              className="h-7 w-7 hover:bg-apple-blue/10 hover:text-apple-blue flex items-center justify-center"
              onClick={() => onMove(sectionId, index, 'down')}
              disabled={index === total - 1}
            />
          </div>
        </div>

        {/* Top Right Controls (Tooltip + Delete) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <Tooltip 
            openOnClick 
            position="bottom"
            className="w-72"
            trigger={
              <IconButton
                icon={<MoreVertical size={20} strokeWidth={2.5} />}
                variant="gray"
                size="sm"
                className="hover:bg-apple-blue/10 hover:text-apple-blue border-none shadow-apple-sm flex items-center justify-center"
              />
            }
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <Text weight="bold" variant="caption2" className="opacity-50 uppercase tracking-widest text-[10px]">Dish Options</Text>
                <div className="w-1.5 h-1.5 rounded-full bg-apple-blue shadow-[0_0_8px_rgba(10,132,255,0.5)]" />
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Show Image', key: 'showImage', icon: <ImageIcon size={18} /> },
                  { label: 'Show Description', key: 'showDescription', icon: <FileText size={18} /> },
                  { label: 'Has Supplement', key: 'hasSupplement', icon: <DollarSign size={18} /> },
                  { label: 'Modal View', key: 'openModal', icon: <Maximize2 size={18} /> }
                ].map((item) => (
                  <div 
                    key={item.key}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer group/item",
                      isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                    )}
                    onClick={() => onUpdate(sectionId, dish.id, { [item.key]: !dish[item.key as keyof typeof dish] })}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "transition-transform group-hover/item:scale-110",
                        isDark ? "text-white/60 group-hover/item:text-apple-blue" : "text-black/60 group-hover/item:text-apple-blue"
                      )}>
                        {item.icon}
                      </span>
                      <Text weight="semibold" className="text-[15px]">{item.label}</Text>
                    </div>
                    <div className={cn(
                      "relative w-10 h-5 rounded-full transition-all duration-300 border-2",
                      dish[item.key as keyof typeof dish]
                        ? "bg-apple-blue border-apple-blue shadow-[0_0_10px_rgba(10,132,255,0.3)]"
                        : isDark ? "bg-white/10 border-white/10" : "bg-black/10 border-black/10"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 shadow-sm",
                        dish[item.key as keyof typeof dish] ? "translate-x-5" : "translate-x-0"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tooltip>

          <IconButton
            icon={<Trash2 size={20} />}
            variant="ghost"
            className="text-apple-red opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-apple-red/10 flex items-center justify-center"
            onClick={() => onRemove(sectionId, dish.id)}
          />
        </div>

        <CardContent className="p-8 pt-20">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Left: Image (if enabled and set) */}
            {dish.showImage && (
              <div className="relative group/avatar shrink-0 self-center md:self-stretch">
                <div
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 ring-4 ring-transparent hover:ring-apple-blue/20 border-2 border-apple-gray-200 rounded-[2.2rem] w-32 md:w-40 h-32 md:h-full min-h-[160px] overflow-hidden bg-surface-tertiary flex items-center justify-center",
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
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <ImageIcon className={cn("w-8 h-8", isDark ? "text-white/40" : "text-black/40")} />
                      <Text variant="caption2" className="opacity-40 font-semibold">Click to upload photo</Text>
                    </div>
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
              </div>
            )}

            <div className="flex-1 w-full space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Input
                    placeholder="Dish title"
                    className={cn(
                      "flex-1 font-bold text-2xl h-14 px-6 rounded-2xl bg-surface-secondary border-2 focus:border-apple-blue transition-all",
                      isDark ? "border-apple-gray-700" : "border-apple-gray-300"
                    )}
                    value={dish.title}
                    onChange={(e) => onUpdate(sectionId, dish.id, { title: e.target.value })}
                  />
                  
                  {dish.hasSupplement && (
                    <div 
                      ref={supplementRef}
                      className="relative whitespace-nowrap animate-in slide-in-from-right-4 duration-500"
                    >
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="w-full sm:w-32 h-14 pl-10 rounded-2xl bg-surface-primary border-2 border-apple-blue font-bold text-lg"
                        value={dish.supplementPrice ?? 0}
                        onChange={(e) => onUpdate(sectionId, dish.id, { supplementPrice: parseFloat(e.target.value) || 0 })}
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue font-bold text-lg">+</span>
                    </div>
                  )}
                </div>

                {dish.showDescription && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Textarea
                      placeholder="Describe this delicious dish..."
                      className={cn(
                        "text-lg min-h-[80px] px-6 py-4 rounded-2xl bg-surface-secondary border-2 focus:border-apple-blue transition-all italic resize-none",
                        isDark ? "border-apple-gray-700 text-white/70" : "border-apple-gray-300 text-black/70"
                      )}
                      value={dish.description || ''}
                      onChange={(e) => onUpdate(sectionId, dish.id, { description: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className={cn(
                "flex flex-wrap items-center justify-between gap-6 pt-6 border-t",
                isDark ? "border-apple-gray-800" : "border-apple-gray-100"
              )}>
                <div className="flex items-center gap-3">
                  <Text weight="bold" variant="caption2" className="opacity-50 uppercase tracking-wider">Allergens</Text>
                  <div className="flex flex-wrap items-center gap-2">
                    {dish.allergens.length > 0 ? (
                      dish.allergens.map(aId => {
                        const allergen = ALLERGENS.find(a => a.id === aId);
                        return (
                          <div key={aId} className={cn(
                            "w-10 h-10 rounded-full border flex items-center justify-center text-lg shadow-apple-sm transition-transform hover:scale-110",
                            isDark ? "bg-surface-primary border-apple-gray-700" : "bg-surface-primary border-apple-gray-200"
                          )} title={allergen?.name}>
                            {allergen?.icon}
                          </div>
                        );
                      })
                    ) : (
                      <Badge variant="error" size="sm" icon={<AlertTriangle size={12} />} dot>No allergens</Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant={dish.allergens.length === 0 ? 'danger' : 'secondary'}
                  className={cn(
                    "rounded-full px-6 h-11 font-bold transition-all border-2",
                    dish.allergens.length === 0
                      ? "bg-apple-red text-white hover:bg-apple-red-hover shadow-apple-md"
                      : cn(
                          "hover:border-apple-blue hover:text-apple-blue",
                          isDark ? "border-apple-gray-700" : "border-apple-gray-300"
                        ),
                    dish.allergens.length === 0 && !isDark && "text-black"
                  )}
                  onClick={() => onEditAllergens(sectionId, dish)}
                >
                  <Plus size={18} className="mr-2" />
                  {dish.allergens.length === 0 ? 'Select Allergens' : 'Edit Allergens'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
