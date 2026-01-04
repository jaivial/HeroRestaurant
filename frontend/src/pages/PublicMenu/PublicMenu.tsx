import { useParams } from 'react-router-dom';
import { usePublicMenu } from './hooks/usePublicMenu';
import { MenuContent } from './components/MenuContent';
import { MenuLoading } from './components/ui/MenuLoading';
import { MenuError } from './components/ui/MenuError';
import { MenuNotFound } from './components/ui/MenuNotFound';
import { MenuInactive } from './components/ui/MenuInactive';
import type { PublicMenuProps } from './types';

export function PublicMenu(_props: PublicMenuProps) {
  const { menuId } = useParams<{ menuId: string }>();

  const { menu, isLoading, error, isNotFound, isInactive, retry } = usePublicMenu(
    menuId || ''
  );

  if (isLoading) {
    return <MenuLoading />;
  }

  if (isNotFound) {
    return <MenuNotFound />;
  }

  if (error && !menu) {
    return <MenuError error={error} onRetry={retry} />;
  }

  if (isInactive && menu) {
    return <MenuInactive restaurantName={menu.restaurant.name} />;
  }

  if (!menu) {
    return <MenuError error="Menu data unavailable" onRetry={retry} />;
  }

  return <MenuContent menu={menu} />;
}
