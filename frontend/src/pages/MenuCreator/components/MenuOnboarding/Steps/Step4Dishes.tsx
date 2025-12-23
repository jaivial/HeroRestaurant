// src/pages/MenuCreator/components/MenuOnboarding/Steps/Step4Dishes.tsx
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
import { useStep4Dishes } from '../../../hooks/useStep4Dishes';
import { Heading, Text } from '../../../../../components/ui/Text/Text';
import { Button } from '../../../../../components/ui/Button/Button';
import { SortableDish } from './ui/SortableDish';
import { AllergenModal } from './ui/AllergenModal';
import type { Dish } from '../../../types';

export function Step4Dishes() {
  // ✅ Layer 2: Business logic in custom hook
  const {
    menu,
    showAllergenModal,
    uploadingDishId,
    setShowAllergenModal,
    setEditingDishInfo,
    addDish,
    updateDish,
    removeDish,
    moveDish,
    toggleAllergen,
    handleImageUpload,
    handleDragEnd,
    currentEditingDish,
  } = useStep4Dishes();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <Heading level={2} className="text-3xl font-bold tracking-tight">Dishes</Heading>
        <Text color="primary" className="text-lg opacity-80">Add dishes to each section and configure their details.</Text>
      </div>

      <div className="space-y-16">
        {menu?.sections?.map((section) => (
          <div key={section.id} className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-apple-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-3 h-10 bg-apple-blue rounded-full shadow-sm" />
                <Heading level={3} className="text-3xl font-bold text-content-primary">{section.name}</Heading>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => addDish(section.id)}
                className="rounded-full px-6 bg-apple-blue/10 text-apple-blue hover:bg-apple-blue hover:text-white transition-all"
              >
                Add Dish
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 gap-6">
                {section.dishes.length === 0 ? (
                  <div className="p-12 text-center bg-surface-secondary/50 rounded-[2.2rem] border-2 border-dashed">
                    <Text color="primary" className="text-lg opacity-70">No dishes in this section yet.</Text>
                  </div>
                ) : (
                  <SortableContext
                    items={section.dishes.map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {section.dishes.map((dish, index) => (
                      <SortableDish
                        key={dish.id}
                        dish={dish}
                        index={index}
                        sectionId={section.id}
                        total={section.dishes.length}
                        onUpdate={updateDish}
                        onRemove={removeDish}
                        onMove={moveDish}
                        onEditAllergens={(sId: string, d: Dish) => {
                          setEditingDishInfo({ sectionId: sId, dishId: d.id });
                          setShowAllergenModal(true);
                        }}
                        onImageUpload={handleImageUpload}
                        uploadingDishId={uploadingDishId}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>
            </DndContext>
          </div>
        ))}
      </div>

      {/* Allergens Modal (Layer 3) */}
      <AllergenModal 
        isOpen={showAllergenModal} 
        onClose={() => setShowAllergenModal(false)}
        onToggleAllergen={toggleAllergen}
        selectedAllergens={currentEditingDish?.allergens || []}
      />
    </div>
  );
}
