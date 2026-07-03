export function DashboardSidebarNavigationOverlay() {
  return (
    <div className="fixed left-0 top-0 z-[90] h-screen w-[220px] pointer-events-none" aria-label="Navegación lateral">
      <a className="absolute left-[10px] top-[101px] h-[32px] w-[200px] rounded-[7px] pointer-events-auto" href="/" aria-label="Ir a Dashboard" />
      <a className="absolute left-[28px] top-[177px] h-[28px] w-[170px] rounded-[6px] pointer-events-auto" href="/" aria-label="Ir a Dashboard de inspecciones" />
      <a className="absolute left-[28px] top-[205px] h-[42px] w-[170px] rounded-[6px] pointer-events-auto" href="/inspections" aria-label="Ir a Gestión de inspecciones" />
    </div>
  );
}
