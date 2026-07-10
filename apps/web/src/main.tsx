import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ApproveCloseConfirmBridge } from './modules/inspections/components/ApproveCloseConfirmBridge';
import { DraftProgressBridge } from './modules/inspections/components/DraftProgressBridge';
import { IncompleteInspectionDraftBridge } from './modules/inspections/components/IncompleteInspectionDraftBridge';
import { InspectionAreaSectorFilterBridge } from './modules/inspections/components/InspectionAreaSectorFilterBridge';
import { router } from './routes/router';
import './modules/dashboard/dashboard-figma-alignment.css';

const queryClient = new QueryClient();
const bridgeKey = 'aurelia';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <InspectionAreaSectorFilterBridge key={bridgeKey} />
      <IncompleteInspectionDraftBridge />
      <DraftProgressBridge />
      <ApproveCloseConfirmBridge />
    </QueryClientProvider>
  </React.StrictMode>,
);
