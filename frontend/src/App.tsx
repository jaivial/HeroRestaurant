import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/guards/AuthGuard';
import { GuestGuard } from '@/guards/GuestGuard';
import { AclGuard } from '@/guards/AclGuard';
import { AuthenticatedLayout } from '@/layouts/AuthenticatedLayout';
import { Login } from '@/pages/Login/Login';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { MenuCreator } from '@/pages/MenuCreator/MenuCreator';
import { Members } from '@/pages/Members/Members';
import { Shifts } from '@/pages/Shifts/Shifts';
import { WorkspaceArea } from '@/pages/WorkspaceArea/WorkspaceArea';
import { Settings } from '@/pages/Settings/Settings';
import { PERMISSIONS } from '@/utils/permissions';
import { useAuthInit } from '@/hooks/useAuthInit';

function AuthInit() {
  useAuthInit();
  return null;
}

function App() {
  return (
    <>
      <AuthInit />
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
            path="menu-creator"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.EDIT_MENU]}>
                <MenuCreator />
              </AclGuard>
            }
          />

          <Route
            path="shifts"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_TIMESHEETS]}>
                <Shifts />
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
            path="workspace"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_SETTINGS]}>
                <WorkspaceArea />
              </AclGuard>
            }
          />

          <Route
            path="settings"
            element={
              <AclGuard requiredPermissions={[PERMISSIONS.VIEW_SETTINGS]}>
                <Settings />
              </AclGuard>
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
    </>
  );
}

export default App;
