import { Outlet } from 'react-router-dom';

const RouterOutlet = Outlet as unknown as () => JSX.Element | null;

export function App() {
  return (
    <RouterOutlet />
  );
}
