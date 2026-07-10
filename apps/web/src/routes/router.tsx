import { createBrowserRouter } from 'react-router-dom';
import { App } from '../app/App';
import { LoginPage } from '../modules/auth/LoginPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { InspectionsPage } from '../modules/inspections/InspectionsPage';
import { SprPage } from '../modules/spr/SprPage';
import { IncidentsPage } from '../modules/incidents/IncidentsPage';
import { CriticalControlsPage } from '../modules/critical-controls/CriticalControlsPage';
import { ReportsPage } from '../modules/reports/ReportsPage';
import { AdminPage } from '../modules/admin/AdminPage';
import { RequireAuth } from '../shared/components/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'inspections/dashboard', element: <DashboardPage /> },
      { path: 'inspections', element: <InspectionsPage /> },
      { path: 'spr', element: <SprPage /> },
      { path: 'incidents', element: <IncidentsPage /> },
      { path: 'critical-controls', element: <CriticalControlsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);
