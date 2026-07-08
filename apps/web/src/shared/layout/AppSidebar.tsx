import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardSidebarTopBrandBar } from '../../modules/dashboard/components/DashboardSections';

type SidebarIconName =
  | 'dashboard'
  | 'search'
  | 'alert'
  | 'spr'
  | 'leaf'
  | 'trash'
  | 'shield'
  | 'drop'
  | 'wind'
  | 'weather'
  | 'biohazard'
  | 'refresh'
  | 'waves'
  | 'clipboard'
  | 'settings'
  | 'sliders'
  | 'globe'
  | 'role'
  | 'more';

type SidebarTone = 'green' | 'gold';
type SidebarLineMode = 'single' | 'double';

type SidebarChildItem = {
  label: string;
  to?: string;
  end?: boolean;
  icon?: SidebarIconName;
  disabled?: boolean;
  lineMode?: SidebarLineMode;
  tone?: SidebarTone;
};

type SidebarItem = {
  label: string;
  icon: SidebarIconName;
  to?: string;
  end?: boolean;
  disabled?: boolean;
  badge?: string;
  children?: SidebarChildItem[];
};

const mainItems: SidebarItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/', end: true },
  {
    label: 'Inspecciones',
    icon: 'search',
    to: '/inspections',
    children: [
      { label: 'Dashboard', to: '/inspections/dashboard', end: true, lineMode: 'single' },
      { label: 'Gestión de inspecciones', to: '/inspections', end: true, lineMode: 'double' },
      { label: 'Historial', disabled: true, lineMode: 'single' },
      { label: 'Administración', to: '/inspections/admin', icon: 'sliders', disabled: true, lineMode: 'single', tone: 'gold' },
    ],
  },
  { label: 'Incidentes', icon: 'alert', disabled: true, badge: 'Próximo' },
  { label: 'SPR', icon: 'spr', disabled: true, badge: 'Próximo' },
  { label: 'Impuesto verde', icon: 'leaf', disabled: true, badge: 'Próximo' },
  { label: 'Residuos', icon: 'trash', disabled: true, badge: 'Próximo' },
  { label: 'Controles críticos', icon: 'shield', disabled: true, badge: 'Próximo' },
  { label: 'Monitoreo de agua', icon: 'drop', disabled: true, badge: 'Próximo' },
  { label: 'Material particulado', icon: 'wind', disabled: true, badge: 'Próximo' },
  { label: 'Meteorológico', icon: 'weather', disabled: true, badge: 'Próximo' },
  { label: 'Sustancias peligrosas', icon: 'biohazard', disabled: true, badge: 'Próximo' },
  { label: 'Gestión del cambio', icon: 'refresh', disabled: true, badge: 'Próximo' },
  { label: 'Catastro de agua', icon: 'waves', disabled: true, badge: 'Próximo' },
  { label: 'Incumplimientos', icon: 'clipboard', disabled: true, badge: 'Próximo' },
  { label: 'Workflow contratos', icon: 'clipboard', disabled: true, badge: 'Próximo' },
];

const configItems: SidebarItem[] = [{ label: 'Configuración', icon: 'settings', disabled: true }];

function isRouteActive(pathname: string, to: string, end?: boolean) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function iconPath(name: SidebarIconName) {
  switch (name) {
    case 'dashboard':
      return 'M4 11a7 7 0 0 1 7-7v7H4Zm9-7a7 7 0 0 1 7 7h-7V4ZM4.6 13H11v6.4A7 7 0 0 1 4.6 13Zm8.4 0h6.4A7 7 0 0 1 13 19.4V13Z';
    case 'search':
      return 'M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Zm5-1.5L20 20';
    case 'alert':
      return 'M12 4 21 20H3L12 4Zm0 5v5m0 3h.01';
    case 'spr':
      return 'M6 3h8l4 4v14H6V3Zm8 0v5h5M8 15c2-4 5-4 8-2';
    case 'leaf':
      return 'M19 5c-8 0-13 4-13 10 0 3 2 5 5 5 6 0 9-6 8-15ZM6 19c2-4 5-7 10-10';
    case 'trash':
      return 'M4 7h16M9 7V4h6v3m-8 3v10m5-10v10m5-10v10M6 7l1 14h10l1-14';
    case 'shield':
      return 'M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z';
    case 'drop':
      return 'M12 3s7 7.2 7 12a7 7 0 0 1-14 0c0-4.8 7-12 7-12Z';
    case 'wind':
      return 'M4 8h10a3 3 0 1 0-3-3M4 13h15a3 3 0 1 1-3 3M4 18h8';
    case 'weather':
      return 'M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18Z';
    case 'biohazard':
      return 'M12 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm0-1c0-4 2-6 5-5 1.5 3-.2 5-3 6m-4 0C7.2 9 5.5 7 7 4c3-1 5 1 5 5m2 5c3.5 2 4 4.5 1.5 6.5-3.5 0-4.5-2.5-3.5-5.5m-2 0c1 3-.1 5.5-3.5 5.5C4 18.5 4.5 16 8 14';
    case 'refresh':
      return 'M20 7v5h-5M4 17v-5h5m10-1a7 7 0 0 0-12-4M5 13a7 7 0 0 0 12 4';
    case 'waves':
      return 'M3 8c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M3 13c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M3 18c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1';
    case 'clipboard':
      return 'M8 4h8v3H8V4Zm-2 2H5v15h14V6h-1M8 11h8M8 15h8';
    case 'settings':
      return 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm8 4h2M2 12h2m14.4-6.4 1.4-1.4M4.2 19.8l1.4-1.4m0-12.8L4.2 4.2m15.6 15.6-1.4-1.4';
    case 'sliders':
      return 'M4 7h7M15 7h5M13 5v4M4 12h3M11 12h9M9 10v4M4 17h10M18 17h2M16 15v4';
    case 'globe':
      return 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm-9-9h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18';
    case 'role':
      return 'M12 4 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-3Z';
    case 'more':
      return 'M12 5h.01M12 12h.01M12 19h.01';
    default:
      return '';
  }
}

function SidebarIcon({ name, active = false, className = '' }: { name: SidebarIconName; active?: boolean; className?: string }) {
  const strokeIcon = name !== 'dashboard';
  return (
    <svg aria-hidden className={`shrink-0 ${className}`} fill={strokeIcon ? 'none' : 'currentColor'} stroke={strokeIcon ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d={iconPath(name)} opacity={active ? 1 : undefined} />
    </svg>
  );
}

function SidebarSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full items-center gap-[6px] px-[8px] pb-[4px] pt-[10px]">
      <p className="shrink-0 font-['Inter:Bold',sans-serif] text-[9px] font-bold uppercase leading-none tracking-[1.08px] text-[rgba(255,255,255,0.25)]">{children}</p>
      <div className="h-px min-w-0 flex-1 bg-[rgba(255,255,255,0.06)]" />
    </div>
  );
}

function ComingSoonBadge() {
  return <span className="flex h-[14px] shrink-0 items-center rounded-[4px] bg-[rgba(255,255,255,0.07)] px-[6px] font-['Inter:Semi_Bold',sans-serif] text-[8.5px] font-semibold leading-none text-[rgba(255,255,255,0.32)]">Próximo</span>;
}

function SidebarModuleItem({ item }: { item: SidebarItem }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasChildren = Boolean(item.children?.length);
  const activeByRoute = item.to ? isRouteActive(location.pathname, item.to, item.end) : false;
  const activeByChild = item.children?.some((child) => child.to && isRouteActive(location.pathname, child.to, child.end)) ?? false;
  const isActive = activeByRoute || activeByChild;
  const baseClass = `group flex h-[32px] w-full items-center gap-[9px] rounded-[7px] px-[10px] py-[7px] text-left transition-colors duration-150 ${isActive ? 'bg-[rgba(255,255,255,0.1)]' : item.disabled ? '' : 'hover:bg-[rgba(255,255,255,0.055)]'}`;

  function handleClick() {
    if (item.to && !item.disabled) navigate(item.to);
  }

  return (
    <button aria-current={isActive ? 'page' : undefined} className={baseClass} disabled={item.disabled && !item.to} onClick={handleClick} type="button">
      <SidebarIcon name={item.icon} active={isActive} className={`h-[17px] w-[18px] ${isActive ? 'text-[#00b398]' : 'text-[rgba(255,255,255,0.38)]'}`} />
      <span className={`min-w-0 flex-1 truncate font-['Inter:Medium',sans-serif] text-[12.5px] font-medium leading-[15px] ${isActive ? 'text-white' : 'text-[rgba(255,255,255,0.55)]'}`}>{item.label}</span>
      {item.badge ? <ComingSoonBadge /> : null}
      {hasChildren ? <svg aria-hidden className="h-[10px] w-[12.5px] shrink-0 rotate-90 text-[rgba(255,255,255,0.4)]" fill="currentColor" viewBox="0 0 12.5 10"><path d="M3.2 1.2 8.1 5 3.2 8.8" /></svg> : null}
    </button>
  );
}

function SidebarSubItem({ item }: { item: SidebarChildItem }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = item.to ? isRouteActive(location.pathname, item.to, item.end) : false;
  const hasIcon = Boolean(item.icon);
  const isDoubleLine = item.lineMode === 'double';
  const tone = item.tone ?? 'green';
  const activeColor = tone === 'gold' ? '#c8a064' : '#00b398';
  const activeBg = tone === 'gold' ? 'bg-[rgba(255,255,255,0.055)]' : 'bg-[rgba(0,179,152,0.09)]';
  const activeHeight = hasIcon ? 'h-[32px]' : isDoubleLine ? 'h-[41px]' : 'h-[26.5px]';
  const inactiveHeight = hasIcon ? 'h-[22px]' : 'h-[26.5px]';
  const className = `relative w-full rounded-[6px] text-left transition-colors duration-150 ${isActive ? `${activeHeight} ${activeBg}` : `${inactiveHeight} hover:bg-[rgba(255,255,255,0.04)]`}`;

  function handleClick() {
    if (item.to && !item.disabled) navigate(item.to);
  }

  if (hasIcon) {
    return (
      <button aria-current={isActive ? 'page' : undefined} className={className} disabled={item.disabled} onClick={handleClick} type="button">
        {isActive ? <span className="absolute left-[23px] top-[9.5px] h-[13px] w-[2.5px] rounded-[2px]" style={{ backgroundColor: activeColor }} /> : null}
        <SidebarIcon name={item.icon as SidebarIconName} active={isActive} className={`absolute left-[38px] ${isActive ? 'top-[11px]' : 'top-[6px]'} h-[10px] w-[12px] ${isActive ? 'text-[#c8a064]' : 'text-[rgba(255,255,255,0.22)]'}`} />
        <span className={`absolute left-[58px] ${isActive ? 'top-[14px]' : 'top-[9px]'} size-[4px] rounded-[2px]`} style={{ backgroundColor: isActive ? activeColor : 'rgba(255,255,255,0.12)' }} />
        <span className={`absolute left-[70px] ${isActive ? 'top-[8.5px] text-[12px] font-semibold text-[#c8a064]' : 'top-[4px] text-[11px] font-medium text-[rgba(255,255,255,0.32)]'} truncate font-['Inter:Semi_Bold',sans-serif] leading-[14px]`}>{item.label}</span>
      </button>
    );
  }

  const barTop = isDoubleLine ? 'top-[14px]' : 'top-[6.75px]';
  const dotTop = isDoubleLine ? 'top-[18.5px]' : 'top-[11.25px]';
  return (
    <button aria-current={isActive ? 'page' : undefined} className={className} disabled={item.disabled} onClick={handleClick} type="button">
      {isActive ? <span className={`absolute left-[23px] ${barTop} h-[13px] w-[2.5px] rounded-[2px] bg-[#00b398]`} /> : null}
      <span className={`absolute left-[39.5px] ${isActive ? dotTop : 'top-[11.25px]'} size-[4px] rounded-[2px] ${isActive ? 'bg-[#00b398]' : 'bg-[rgba(255,255,255,0.2)]'}`} />
      <span className={`absolute left-[50.5px] top-[6px] max-w-[140px] font-['Inter:Semi_Bold',sans-serif] text-[12px] leading-[14px] ${isActive ? 'font-semibold text-[#00b398]' : 'font-normal text-[rgba(255,255,255,0.44)]'} ${isDoubleLine ? 'whitespace-normal' : 'whitespace-nowrap'}`}>{item.label}</span>
    </button>
  );
}

function SidebarChildren({ children }: { children: SidebarChildItem[] }) {
  return (
    <div className="flex max-h-[400px] w-full flex-col overflow-hidden">
      {children.slice(0, 3).map((item) => <SidebarSubItem key={item.label} item={item} />)}
      <div className="w-full pl-[38px] pr-[10px] pt-[4px]"><div className="h-px w-full bg-[rgba(255,255,255,0.06)]" /></div>
      {children.slice(3).map((item) => <div key={item.label} className="w-full pt-[4px]"><SidebarSubItem item={item} /></div>)}
    </div>
  );
}

function SidebarLanguage() {
  return (
    <div className="relative w-full shrink-0" data-name="Container">
      <div className="flex size-full items-center justify-between px-[8px] pb-[6px] pt-[2px]">
        <div className="relative h-[13px] w-[52.516px] shrink-0">
          <SidebarIcon name="globe" className="absolute left-0 top-[0.88px] h-[11px] w-[13.75px] text-[rgba(255,255,255,0.28)]" />
          <p className="absolute left-[17.75px] top-0 whitespace-nowrap font-['Inter:Regular',sans-serif] text-[11px] font-normal leading-[normal] text-[rgba(255,255,255,0.28)]">Idioma</p>
        </div>
        <div className="relative h-[18px] w-[60.32px] shrink-0 rounded-[20px] border border-[rgba(255,255,255,0.1)]">
          <div className="flex size-full items-start overflow-hidden rounded-[inherit] p-px">
            <div className="relative h-full w-[29.695px] shrink-0"><p className="absolute left-[8px] top-[2px] whitespace-nowrap font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-[normal] text-[rgba(255,255,255,0.3)]">EN</p></div>
            <div className="relative h-full w-[28.625px] shrink-0 bg-[#00b398]"><p className="absolute left-[8px] top-[2px] whitespace-nowrap font-['Inter:Bold',sans-serif] text-[10px] font-bold leading-[normal] text-white">ES</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarUser() {
  return (
    <div className="relative w-full shrink-0 rounded-[7px]" data-name="Container">
      <div className="flex size-full items-center gap-[8px] px-[8px] py-[6px]">
        <div className="flex size-[28px] shrink-0 items-center justify-center rounded-[14px] bg-[#c8a064]">
          <p className="whitespace-nowrap font-['Inter:Bold',sans-serif] text-[11px] font-bold leading-[normal] text-[#001e39]">KO</p>
        </div>
        <div className="w-[85.813px] shrink-0">
          <div className="flex w-full flex-col items-start">
            <p className="w-full whitespace-nowrap font-['Inter:Semi_Bold',sans-serif] text-[11.5px] font-semibold leading-[normal] text-[rgba(255,255,255,0.75)]">Karen Opazo S.</p>
            <div className="flex w-full items-center gap-[4px]">
              <SidebarIcon name="role" className="h-[8px] w-[10px] text-[rgba(255,255,255,0.32)]" />
              <p className="whitespace-nowrap font-['Inter:Regular',sans-serif] text-[10px] font-normal leading-[normal] text-[rgba(255,255,255,0.32)]">Admin GF HSE</p>
            </div>
          </div>
        </div>
        <div className="min-w-px flex-[1_0_0]">
          <div className="flex size-full items-start justify-end">
            <SidebarIcon name="more" className="h-[11px] w-[13.75px] text-[rgba(255,255,255,0.2)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <>
      <DashboardSidebarTopBrandBar />
      <aside aria-label="Navegación lateral" className="fixed bottom-0 left-0 top-[56px] z-[80] flex w-[220px] flex-col overflow-hidden bg-gradient-to-b from-[#002659] to-[#004a3a]">
        <div className="min-h-0 flex-1 overflow-hidden pb-[4px]">
          <div className="flex w-full flex-col items-start px-[10px] pb-[6px] pt-[8px]">
            <SidebarSectionTitle>Módulos</SidebarSectionTitle>
            <div className="flex w-full flex-col items-start">
              {mainItems.map((item) => <div key={item.label} className="w-full"><SidebarModuleItem item={item} />{item.children ? <SidebarChildren>{item.children}</SidebarChildren> : null}</div>)}
            </div>
          </div>
          <div className="flex w-full flex-col items-start px-[10px] py-[6px]">
            <SidebarSectionTitle>Configuración general</SidebarSectionTitle>
            {configItems.map((item) => <SidebarModuleItem key={item.label} item={item} />)}
          </div>
        </div>
        <div className="flex w-[220px] shrink-0 flex-col items-start border-t border-[rgba(255,255,255,0.08)] bg-[rgba(0,38,89,0.6)] px-[10px] pb-[10px] pt-[9px]">
          <SidebarLanguage />
          <SidebarUser />
        </div>
      </aside>
    </>
  );
}
