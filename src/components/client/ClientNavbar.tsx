// src/components/client/ClientNavbar.tsx
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Home } from 'lucide-react';

const ClientNavbar = () => {
  const navigate = useNavigate();
  const clientName = "Javier Flores";

  // Genera las iniciales del nombre
  const initials = clientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid rgba(201,168,124,0.18)',
      padding: '0 1.5rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(201,168,124,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>

      {/* LOGO */}
      <Link to="/mi-cuenta" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #c9a87c, #b8906a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {/* Ícono de casa simple */}
          <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff">
            <path d="M10 2L3 8v10h5v-5h4v5h5V8L10 2z"/>
          </svg>
        </div>
        <div>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '17px', fontWeight: 600, color: '#3f3a35', display: 'block', lineHeight: 1.2 }}>
            Ezequiel Castillo
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#c9a87c' }}>
            Mi Panel
          </span>
        </div>
      </Link>

      {/* ACCIONES */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

        {/* Botón ir a la tienda */}
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            border: '1px solid rgba(201,168,124,0.25)',
            color: '#5e4b3a', background: '#fef9f2',
            textDecoration: 'none', transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#c9a87c';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#fef9f2';
            (e.currentTarget as HTMLElement).style.color = '#5e4b3a';
          }}
        >
          <Home size={14} />
          <span className="hide-mobile">Ir a la tienda</span>
        </Link>

        {/* Avatar con nombre */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '5px 12px 5px 6px', borderRadius: '999px',
          border: '1px solid rgba(201,168,124,0.2)', background: '#fef9f2',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: '#c9a87c', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', flexShrink: 0,
          }}>
            {initials}
          </div>
          <span className="hide-mobile" style={{ fontSize: '12px', fontWeight: 600, color: '#3f3a35' }}>
            {clientName}
          </span>
        </div>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          title="Cerrar Sesión"
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#fff1f2', border: '1px solid #fecdd3',
            color: '#e11d48', cursor: 'pointer', transition: 'all 0.18s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#e11d48';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#fff1f2';
            (e.currentTarget as HTMLElement).style.color = '#e11d48';
          }}
        >
          <LogOut size={16} />
        </button>

      </div>
    </nav>
  );
};

export default ClientNavbar;