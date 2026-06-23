import DashboardInspecciones from '@/imports/DashboardInspecciones/index';

export function DashboardInspeccionesPage() {
  return (
    <div className="fixed inset-0 overflow-auto bg-[#f7f7f7]">
      <div style={{ width: '100vw', minHeight: '100vh' }}>
        <DashboardInspecciones />
      </div>
    </div>
  );
}
