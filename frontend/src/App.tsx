import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/guards/AuthGuard';
import { GuestGuard } from '@/guards/GuestGuard';
import { AclGuard } from '@/guards/AclGuard';
import { GlobalFlagGuard } from '@/guards/GlobalFlagGuard';
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout';
import { Login } from '@/pages/Login/Login';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { MenuCreator } from '@/pages/MenuCreator/MenuCreator';
import { Members } from '@/pages/Members/Members';
import { PERMISSIONS, USER_ACCESS_FLAGS } from '@/utils/permissions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<GuestGuard />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route
          path="/w/:workspaceId"
          element={
            <AuthGuard>
              <AuthenticatedLayout />
            </AuthGuard>
          }
        >
          <Route
            path="dashboard"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_DASHBOARD]}>
                <Dashboard />
              </AclGuard>
            }
          />

          <Route
            path="orders"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_ORDERS]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Orders Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          <Route
            path="tables"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_TABLES]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Tables Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          <Route
            path="menu"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_MENU]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Menu Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          <Route
            path="menu-creator"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.EDIT_MENU]}>
                <MenuCreator />
              </AclGuard>
            }
          />

          <Route
            path="inventory"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_INVENTORY]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Inventory Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          <Route
            path="reports"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_REPORTS]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Reports Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          <Route
            path="members"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_MEMBERS]}>
                <Members />
              </AclGuard>
            }
          />

          <Route
            path="settings"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_SETTINGS]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Settings Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          <Route
            path="billing"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_BILLING]}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Billing Page
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Coming soon...
                  </p>
                </div>
              </AclGuard>
            }
          />

          {/* System Admin Routes */}
          <Route
            path="system/config"
            element={
              <GlobalFlagGuard requiredFlag={USER_ACCESS_FLAGS.ROOT}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    System Configuration
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Global system settings and configuration.
                  </p>
                </div>
              </GlobalFlagGuard>
            }
          />

          <Route
            path="system/audit"
            element={
              <GlobalFlagGuard requiredFlag={USER_ACCESS_FLAGS.ROOT}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    System Audit Logs
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Global audit logs for all system activities.
                  </p>
                </div>
              </GlobalFlagGuard>
            }
          />

          {/* Default redirect to dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                  404
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
                  Page not found
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
