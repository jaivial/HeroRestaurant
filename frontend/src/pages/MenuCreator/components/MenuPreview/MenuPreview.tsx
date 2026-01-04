import { SlideOut } from '@/components/ui';
import { usePublicMenu } from '../../../PublicMenu/hooks/usePublicMenu';
import { MenuContent } from '../../../PublicMenu/components/MenuContent';
import { MenuLoading } from '../../../PublicMenu/components/ui/MenuLoading';
import { MenuError } from '../../../PublicMenu/components/ui/MenuError';
import { MenuInactive } from '../../../PublicMenu/components/ui/MenuInactive';
import type { MenuPreviewProps } from './types';

export function MenuPreview({ isOpen, onClose, menuId }: MenuPreviewProps) {
  const { menu, isLoading, error, isInactive, retry } = usePublicMenu(menuId || '');

  return (
    <SlideOut
      isOpen={isOpen}
      onClose={onClose}
      title="Menu Preview"
      width="xl"
      closeOnBackdrop
      closeOnEscape
    >
      {isLoading && <MenuLoading />}

      {error && !menu && (
        <div className="p-8">
          <MenuError error={error} onRetry={retry} />
        </div>
      )}

      {isInactive && menu && (
        <div className="p-8">
          <MenuInactive restaurantName={menu.restaurant.name} />
        </div>
      )}

      {menu && !isInactive && <MenuContent menu={menu} />}
    </SlideOut>
  );
}
