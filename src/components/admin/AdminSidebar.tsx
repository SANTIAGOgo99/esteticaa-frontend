// src/components/admin/AdminSidebar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Scissors, CalendarDays, FileText, UsersRound,
  LogOut, Database, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import logoImg from '../../assets/images/LogoImagen.png';
import './AdminSidebar.css';

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/admin/citas',      icon: CalendarDays,     label: 'Citas'      },
  { to: '/admin/productos',  icon: Package,         label: 'Inventario' },
  { to: '/admin/servicios',  icon: Scissors,        label: 'Servicios'  },
  { to: '/admin/clientes',   icon: UsersRound,      label: 'Clientes'   },
  { to: '/admin/sitio-web',  icon: FileText,        label: 'Sitio web' },
  { to: '/admin/base-datos', icon: Database,        label: 'Base de datos' },
];

const AdminSidebar = ({ isCollapsed, toggleSidebar }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const open     = !isCollapsed;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 bg-[#1E1108] border-r border-[#C9A050]/10 z-50 overflow-hidden"
      style={{
        width: open ? '240px' : '72px',
        minWidth: open ? '240px' : '72px',
        transition: 'width .3s cubic-bezier(.4,0,.2,1), min-width .3s cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* ── LOGO ── */}
      <div className="flex items-center h-[80px] border-b border-[#C9A050]/10 flex-shrink-0 overflow-hidden px-[16px] gap-4">
        <Link to="/" className="flex-shrink-0 outline-none no-underline">
          <div className="w-[42px] h-[42px] rounded-full bg-[#FAF6F0] border-[2px] border-[#C9A050]/40 flex items-center justify-center shadow-[0_0_15px_rgba(201,160,80,.15)] transition-transform hover:scale-105">
            <img src={logoImg} alt="Logo" className="w-7 h-7 object-contain" />
          </div>
        </Link>

        <div
          className="overflow-hidden whitespace-nowrap"
          style={{
            maxWidth: open ? '160px' : '0',
            opacity: open ? 1 : 0,
            transition: 'max-width .3s cubic-bezier(.4,0,.2,1), opacity .25s',
          }}
        >
          <span className="block font-serif font-bold text-white leading-tight tracking-wide" style={{ fontSize: '1rem' }}>
            Ezequiel Castillo
          </span>
          <span className="block text-[#C9A050] font-semibold uppercase" style={{ fontSize: '.55rem', letterSpacing: '2.5px', marginTop: '2px' }}>
            Estetica
          </span>
        </div>
      </div>

      {/* Section label */}
      <div
        className="overflow-hidden whitespace-nowrap px-[16px]"
        style={{
          maxHeight: open ? '32px' : '0',
          opacity: open ? 1 : 0,
          paddingTop: open ? '16px' : '0',
          paddingBottom: open ? '4px' : '0',
          transition: 'all .25s',
          fontSize: '.5rem',
          letterSpacing: '3px',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,.25)',
          fontWeight: 600,
        }}
      >
        Módulos
      </div>

      {/* ── NAV ── */}
      <nav className="flex-1 px-[12px] py-[8px] flex flex-col gap-[4px] overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const Icon   = item.icon;
          const active = isActive(item.to);

          return (
            <Link key={item.to} to={item.to} className="block no-underline outline-none">
              <div
                className={`
                  flex items-center h-[46px] rounded-[12px] cursor-pointer
                  border overflow-hidden transition-all duration-200
                  ${active ? 'bg-[#C9A050]/15 border-[#C9A050]/30 shadow-sm' : 'border-transparent bg-transparent hover:bg-[#C9A050]/10'}
                  ${open ? 'px-[12px] gap-[12px] w-full justify-start' : 'px-0 gap-0 justify-center'}
                `}
                style={{ width: open ? '100%' : '46px', margin: open ? '0' : '0 auto' }}
                title={!open ? item.label : undefined}
              >
                <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '22px', height: '22px' }}>
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                    style={{ color: active ? '#E8C878' : 'rgba(255,255,255,.6)', display: 'block', flexShrink: 0 }}
                  />
                </div>

                <span
                  className="whitespace-nowrap overflow-hidden"
                  style={{
                    fontSize: '.85rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#E8C878' : 'rgba(255,255,255,.6)',
                    maxWidth: open ? '160px' : '0',
                    opacity: open ? 1 : 0,
                    transition: 'max-width .3s cubic-bezier(.4,0,.2,1), opacity .2s',
                  }}
                >
                  {item.label}
                </span>

                {active && open && (
                  <div className="ml-auto flex-shrink-0 w-[6px] h-[6px] rounded-full bg-[#E8C878] shadow-[0_0_8px_rgba(232,200,120,0.8)]" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── FOOTER ── */}
      <div className="admin-sidebar-footer px-[12px] pb-[16px] pt-[12px] border-t border-[#C9A050]/10 flex flex-col gap-[4px] flex-shrink-0">

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`admin-sidebar-footer-btn admin-sidebar-footer-btn--logout flex items-center h-[42px] rounded-[10px] border border-transparent overflow-hidden group transition-all duration-200 cursor-pointer ${open ? 'px-[12px] gap-[10px] w-full justify-start' : 'px-0 gap-0 justify-center'}`}
          style={{ width: open ? '100%' : '46px', margin: open ? '0' : '0 auto' }}
          title={!open ? 'Cerrar sesión' : undefined}
        >
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '20px', height: '20px' }}>
            <LogOut size={18} strokeWidth={2} className="admin-sidebar-footer-icon transition-colors" style={{ display: 'block' }} />
          </div>
          <span
            className="admin-sidebar-footer-label whitespace-nowrap overflow-hidden transition-colors font-medium"
            style={{ fontSize: '.8rem', maxWidth: open ? '140px' : '0', opacity: open ? 1 : 0, transition: 'max-width .3s cubic-bezier(.4,0,.2,1), opacity .2s, color .2s' }}
          >
            Cerrar sesión
          </span>
        </button>

        {/* Toggle */}
        <button
          onClick={toggleSidebar}
          className={`admin-sidebar-footer-btn admin-sidebar-footer-btn--toggle flex items-center h-[42px] rounded-[10px] border border-transparent overflow-hidden group transition-all duration-200 cursor-pointer ${open ? 'px-[12px] gap-[10px] w-full justify-start' : 'px-0 gap-0 justify-center'}`}
          style={{ width: open ? '100%' : '46px', margin: open ? '0' : '0 auto' }}
          title={open ? 'Contraer panel' : 'Expandir panel'}
        >
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '20px', height: '20px' }}>
            {open
              ? <ChevronsLeft  size={18} strokeWidth={2} className="admin-sidebar-footer-icon transition-colors" style={{ display: 'block' }} />
              : <ChevronsRight size={18} strokeWidth={2} className="admin-sidebar-footer-icon transition-colors" style={{ display: 'block' }} />
            }
          </div>
          <span
            className="admin-sidebar-footer-label whitespace-nowrap overflow-hidden transition-colors font-medium"
            style={{ fontSize: '.78rem', maxWidth: open ? '140px' : '0', opacity: open ? 1 : 0, transition: 'max-width .3s cubic-bezier(.4,0,.2,1), opacity .2s' }}
          >
            Contraer panel
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
