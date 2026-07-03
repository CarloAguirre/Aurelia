import { NavLink, useLocation } from 'react-router-dom';

type SidebarSubmenuLinkProps = {
  to: string;
  top: number;
  label: string;
  multiline?: boolean;
  end?: boolean;
};

function SidebarSubmenuLink({ to, top, label, multiline = false, end = false }: SidebarSubmenuLinkProps) {
  return (
    <NavLink
      aria-label={`Ir a ${label}`}
      className={({ isActive }) => `absolute left-[10px] h-[30px] w-[200px] rounded-[6px] pointer-events-auto transition-all duration-150 ease-out ${isActive ? 'bg-[rgba(0,179,152,0.09)]' : 'hover:bg-[rgba(255,255,255,0.055)] hover:translate-x-[1px]'}`}
      end={end}
      style={{ top }}
      to={to}
    >
      {({ isActive }) => (
        <div className="relative h-full w-full">
          {isActive ? <div className="absolute left-[23px] top-[7px] h-[14px] w-[2.5px] rounded-[2px] bg-[#00b398]" /> : null}
          <div className={`absolute left-[39.5px] top-[13px] size-[4px] rounded-[2px] ${isActive ? 'bg-[#00b398]' : 'bg-[rgba(255,255,255,0.2)]'}`} />
          <span className={`absolute left-[50.5px] top-[6px] max-w-[138px] font-['Inter:Semi_Bold',sans-serif] text-[12px] leading-[14px] ${isActive ? 'font-semibold text-[#00b398]' : 'font-normal text-[rgba(255,255,255,0.44)]'} ${multiline ? 'whitespace-normal' : 'whitespace-nowrap'}`}>{label}</span>
        </div>
      )}
    </NavLink>
  );
}

function DashboardCover({ active }: { active: boolean }) {
  return (
    <div className={`absolute left-[10px] top-[178px] h-[30px] w-[200px] rounded-[6px] pointer-events-none transition-colors duration-150 ${active ? 'bg-[rgba(0,179,152,0.09)]' : 'bg-[#003154]'}`}>
      <div className="relative h-full w-full">
        {active ? <div className="absolute left-[23px] top-[7px] h-[14px] w-[2.5px] rounded-[2px] bg-[#00b398]" /> : null}
        <div className={`absolute left-[39.5px] top-[13px] size-[4px] rounded-[2px] ${active ? 'bg-[#00b398]' : 'bg-[rgba(255,255,255,0.2)]'}`} />
        <span className={`absolute left-[50.5px] top-[6px] font-['Inter:Semi_Bold',sans-serif] text-[12px] leading-[14px] ${active ? 'font-semibold text-[#00b398]' : 'font-normal text-[rgba(255,255,255,0.44)]'}`}>Dashboard</span>
      </div>
    </div>
  );
}

export function DashboardSidebarNavigationOverlay() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="fixed left-0 top-0 z-[90] h-screen w-[220px] pointer-events-none" aria-label="Navegación lateral">
      <NavLink className="absolute left-[10px] top-[101px] h-[32px] w-[200px] rounded-[7px] pointer-events-auto transition-colors duration-150 hover:bg-[rgba(255,255,255,0.055)]" end to="/" aria-label="Ir a Dashboard" />
      <DashboardCover active={isDashboard} />
      <SidebarSubmenuLink to="/" top={178} label="Dashboard" end />
      <SidebarSubmenuLink to="/inspections" top={209} label="Gestión de inspecciones" multiline />
      <div className="absolute left-[10px] top-[246px] h-[30px] w-[200px] rounded-[6px] pointer-events-auto transition-all duration-150 hover:bg-[rgba(255,255,255,0.055)] hover:translate-x-[1px]">
        <div className="absolute left-[39.5px] top-[13px] size-[4px] rounded-[2px] bg-[rgba(255,255,255,0.2)]" />
        <span className="absolute left-[50.5px] top-[6px] font-['Inter:Regular',sans-serif] text-[12px] leading-[14px] text-[rgba(255,255,255,0.44)]">Historial</span>
      </div>
    </div>
  );
}
