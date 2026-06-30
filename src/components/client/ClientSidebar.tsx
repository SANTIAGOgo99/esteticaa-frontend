import { ShoppingBag, Scissors, Calendar, User, LogOut, ChevronRight, ShoppingCart } from 'lucide-react';
import logoImagen from '../../assets/images/LogoImagen.png';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleLogout: () => void;
  userData: { full_name: string; email: string; } | null;
  cartCount?: number;
}

const navItems = [
  { tab: 'productos', icon: <ShoppingBag size={20} />, label: 'Boutique' },
  { tab: 'servicios', icon: <Scissors size={20} />,    label: 'Tratamientos' },
  { tab: 'citas',     icon: <Calendar size={20} />,    label: 'Mis Citas' },
  { tab: 'carrito',   icon: <ShoppingCart size={20} />, label: 'Carrito' },
  { tab: 'perfil',    icon: <User size={20} />,        label: 'Mi Perfil' },
];

const ClientSidebar = ({ activeTab, setActiveTab, handleLogout, userData, cartCount = 0 }: Props) => {
  return (
    <aside className="w-72 h-screen bg-gradient-to-b from-[#2c241a] to-[#1f1912] text-white flex flex-col shrink-0 shadow-2xl z-20 transition-all duration-300">
      {/* Logo y título */}
      <div className="p-6 border-b border-[#c9a87c]/20 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#fef9f2] border-2 border-[#c9a87c] flex items-center justify-center shadow-md">
          <img src={logoImagen} alt="Nova Luxe" className="w-8 h-8 object-contain" />
        </div>
        <div>
          <span className="block text-sm font-black tracking-wider uppercase text-[#f5e6d3]">Ezequiel Castillo</span>
          <span className="text-[10px] text-[#c9a87c] font-bold tracking-[0.2em] uppercase">Estética</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map(item => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm tracking-wide group
              ${activeTab === item.tab
                ? 'bg-[#c9a87c]/20 text-[#f5e6d3] shadow-md border-l-4 border-[#c9a87c]'
                : 'text-[#b8a48c] hover:bg-[#c9a87c]/10 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`transition-colors ${activeTab === item.tab ? 'text-[#c9a87c]' : 'text-[#b8a48c] group-hover:text-[#c9a87c]'}`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
              {item.tab === 'carrito' && cartCount > 0 && (
                <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-[#c9a87c] text-[#1f1912] text-[11px] font-black flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            {activeTab === item.tab && <ChevronRight size={16} className="text-[#c9a87c]" />}
          </button>
        ))}
      </nav>

      {/* Perfil del usuario y logout */}
      <div className="p-5 border-t border-[#c9a87c]/20 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a87c] to-[#a07e4e] text-white flex items-center justify-center font-bold text-lg shadow-md">
            {userData?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userData?.full_name || 'Cargando...'}</p>
            <p className="text-xs text-[#c9a87c] truncate">{userData?.email || '...'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-lg transition-all"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default ClientSidebar;
