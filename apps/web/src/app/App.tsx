import { Link, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/inspections', label: 'Inspecciones' },
  { to: '/app/incidents', label: 'Incidentes' },
  { to: '/app/critical-controls', label: 'Controles críticos' },
  { to: '/app/reports', label: 'Reportes' },
  { to: '/app/admin', label: 'Administración' },
];

export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: 220, padding: 16, borderRight: '1px solid #e2e8f0' }}>
        <h1 style={{ fontSize: 20 }}>Aurelia</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/">← Vista principal</Link>
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
