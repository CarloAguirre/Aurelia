import { createBrowserRouter } from 'react-router-dom';
import { App } from '../app/App';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { InspectionsPage } from '../modules/inspections/InspectionsPage';
import { IncidentsPage } from '../modules/incidents/IncidentsPage';
import { CriticalControlsPage } from '../modules/critical-controls/CriticalControlsPage';
import { ReportsPage } from '../modules/reports/ReportsPage';
import { AdminPage } from '../modules/admin/AdminPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'inspections', element: <InspectionsPage /> },
      { path: 'incidents', element: <IncidentsPage /> },
      { path: 'critical-controls', element: <CriticalControlsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'admin', element: <AdminPage /> },
    ],
  },
]);
