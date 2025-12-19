import { useAtomValue, useSetAtom } from 'jotai';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { sidebarOpenAtom, toggleSidebarAtom } from '@/atoms/layoutAtoms';
import { useViewport } from '@/hooks/useViewport';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/utils/permissions';
import { currentWorkspaceAtom } from '@/atoms/workspaceAtoms';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: bigint;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: 'dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    label: 'Orders',
    path: 'orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    permission: PERMISSIONS.VIEW_ORDERS,
  },
  {
    label: 'Tables',
    path: 'tables',
    icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    permission: PERMISSIONS.VIEW_TABLES,
  },
  {
    label: 'Menu',
    path: 'menu',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    permission: PERMISSIONS.VIEW_MENU,
  },
  {
    label: 'Inventory',
    path: 'inventory',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    permission: PERMISSIONS.VIEW_INVENTORY,
  },
  {
    label: 'Reports',
    path: 'reports',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    permission: PERMISSIONS.VIEW_REPORTS,
  },
  {
    label: 'Members',
    path: 'members',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    permission: PERMISSIONS.VIEW_MEMBERS,
  },
  {
    label: 'Settings',
    path: 'settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    permission: PERMISSIONS.VIEW_SETTINGS,
  },
  {
    label: 'Billing',
    path: 'billing',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    permission: PERMISSIONS.VIEW_BILLING,
  },
];

export function Sidebar() {
  const sidebarOpen = useAtomValue(sidebarOpenAtom);
  const toggleSidebar = useSetAtom(toggleSidebarAtom);
  const { isMobile } = useViewport();
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const workspace = useAtomValue(currentWorkspaceAtom);
  const { hasPermission } = usePermissions();

  const handleNavigation = (path: string) => {
    navigate(`/w/${workspaceId}/${path}`);
    if (isMobile) {
      toggleSidebar();
    }
  };

  const isActive = (path: string) => {
    return location.pathname.includes(`/${path}`);
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  if (isMobile && !sidebarOpen) {
    return null;
  }

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => toggleSidebar()}
        />
      )}

      <aside
        className={`
          ${isMobile ? 'fixed' : 'relative'}
          ${isMobile ? 'z-50' : ''}
          w-[280px] h-screen glass border-r border-gray-200/50 dark:border-gray-700/50
          flex flex-col
        `}
      >
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {workspace?.name || 'Workspace'}
            </h2>
            {isMobile && (
              <button
                onClick={() => toggleSidebar()}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {workspace?.slug || 'workspace'}
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive(item.path)
                        ? 'glass-solid text-blue-600 dark:text-blue-400'
                        : 'hover:glass-subtle text-gray-700 dark:text-gray-200'
                    }
                  `}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            HeroRestaurant v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}
