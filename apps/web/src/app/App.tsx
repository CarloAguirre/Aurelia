import { Outlet } from 'react-router-dom';
import { NewInspectionIframeModalController } from '../modules/inspections/components/NewInspectionIframeModalController';

const RouterOutlet = Outlet as unknown as () => JSX.Element | null;

export function App() {
  return (
    <>
      <RouterOutlet />
      <NewInspectionIframeModalController />
    </>
  );
}
