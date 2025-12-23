// src/pages/MenuCreator/components/MenuOnboarding/Steps/Step2Structure.tsx
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../../../../atoms/themeAtoms';
import { useStep2Structure } from '../../../hooks/useStep2Structure';
import { cn } from '@/utils/cn';
import { Heading, Text, Label } from '../../../../../components/ui/Text/Text';
import { Card, CardContent } from '../../../../../components/ui/Card/Card';
import { Button } from '../../../../../components/ui/Button/Button';
import { Input } from '../../../../../components/ui/Input/Input';
import { CustomToggle } from '../../../../../components/ui/Toggle/CustomToggle';
import { SortableSection } from './ui/SortableSection';

export function Step2Structure() {
  // ✅ Layer 2: Business logic in custom hook
  const {
    menu,
    addSection,
    removeSection,
    moveSection,
    updateSectionName,
    handleDragEnd,
    updateInclusions,
  } = useStep2Structure();

  const theme = useAtomValue(themeAtom);
  const isDark = theme === 'dark';

  const [newSectionName, setNewSectionName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddSection = () => {
    addSection(newSectionName);
    setNewSectionName('');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Heading level={2} className="text-3xl font-bold tracking-tight">Menu Structure</Heading>
        <Text color="primary" className="text-lg opacity-80">Define the sections of your menu and what's included.</Text>
      </div>

      <Card className="border-2 border-apple-gray-100 bg-surface-primary rounded-[2.2rem] shadow-sm">
        <CardContent className="p-10 space-y-8">
          <CustomToggle 
            label="Drink Included"
            description="Is a drink (water, wine, soda) included in the price?"
            checked={menu?.drinkIncluded || false} 
            onChange={(checked) => updateInclusions({ drinkIncluded: checked })}
          />
          <CustomToggle 
            label="Coffee Included"
            description="Is coffee or tea included after the meal?"
            checked={menu?.coffeeIncluded || false} 
            onChange={(checked) => updateInclusions({ coffeeIncluded: checked })}
          />
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-10 bg-apple-blue rounded-full shadow-[0_0_15px_rgba(0,122,255,0.3)]" />
            <Label className="text-3xl font-bold tracking-tight">Menu Sections</Label>
          </div>
          <div className={cn(
            "px-5 py-2 rounded-full border shadow-sm",
            isDark ? "bg-apple-gray-800 border-apple-gray-700" : "bg-apple-gray-100 border-apple-gray-200"
          )}>
            <Text variant="footnote" color="tertiary" className="text-base font-bold">{menu?.sections?.length || 0} sections</Text>
          </div>
        </div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            <SortableContext
              items={menu?.sections?.map(s => s.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {menu?.sections?.map((section, index) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  index={index}
                  total={menu.sections?.length || 0}
                  onRemove={removeSection}
                  onUpdateName={updateSectionName}
                  onMove={moveSection}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        <div className={cn(
          "flex gap-6 p-6 rounded-[2.2rem] border-2 border-dashed mt-12 shadow-sm transition-all hover:border-apple-blue/40 group/add",
          isDark ? "bg-surface-primary/50 border-apple-gray-800 hover:bg-surface-primary" : "bg-surface-primary/50 border-apple-gray-200 hover:bg-surface-primary"
        )}>
          <Input 
            placeholder="Add new section (e.g. Salads, To share...)" 
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
            className={cn(
              "bg-transparent border-none focus:ring-0 text-2xl font-bold h-16 px-4",
              isDark ? "placeholder:text-apple-gray-600" : "placeholder:text-apple-gray-300"
            )}
          />
          <Button 
            onClick={handleAddSection} 
            disabled={!newSectionName.trim()}
            className="rounded-full px-10 h-16 bg-apple-blue text-white font-bold text-lg shadow-apple-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            Add Section
          </Button>
        </div>
      </div>
    </div>
  );
}
