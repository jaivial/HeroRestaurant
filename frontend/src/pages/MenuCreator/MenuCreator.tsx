// src/pages/MenuCreator/MenuCreator.tsx
import { useMenuData } from './hooks/useMenuData';
import { useMenuActions } from './hooks/useMenuActions';
import { useMenuOnboarding } from './hooks/useMenuOnboarding';
import { MenuDashboard } from './components/MenuDashboard/MenuDashboard';
import { MenuOnboarding } from './components/MenuOnboarding/MenuOnboarding';
import { Container } from '../../components/ui/Container';

export function MenuCreator() {
  // ✅ Layer 1: Hooks only
  const { menus, stats, isAdding, onboardingStep } = useMenuData();
  const { startNewMenu, startEditMenu, cancelNewMenu, toggleMenuStatus, deleteMenu, copyMenuLink } = useMenuActions();
  const { nextStep, prevStep, isValid, finishOnboarding } = useMenuOnboarding();

  // ✅ Layer 1: Minimal JSX
  return (
    <Container className="py-8">
      {isAdding ? (
        <MenuOnboarding 
          step={onboardingStep} 
          onCancel={cancelNewMenu} 
          onNext={onboardingStep === 5 ? finishOnboarding : nextStep}
          onBack={prevStep}
          isValid={isValid}
        />
      ) : (
        <MenuDashboard 
          menus={menus} 
          stats={stats}
          onAddMenu={startNewMenu}
          onEdit={startEditMenu}
          onToggleStatus={toggleMenuStatus}
          onDelete={deleteMenu}
          onCopyLink={copyMenuLink}
          onPreview={() => {}}
          onGenerateQR={() => {}}
        />
      )}
    </Container>
  );
}

export default MenuCreator;
