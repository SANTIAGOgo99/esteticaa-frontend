// src/components/client/ClientHeader.tsx
import { useNavigate } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
}

interface Props {
  userData: UserProfile | null;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ClientHeader = ({ userData, toggleSidebar, isSidebarOpen }: Props) => {
  const navigate = useNavigate();

  return (
    <header style={{
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid rgba(201,168,124,0.15)',
      padding: '1rem 1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 4px 16px rgba(201,168,124,0.07)',
    }}>

      {/* IZQUIERDA: Menú + Saludo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* Botón hamburguesa */}
        <button
          onClick={toggleSidebar}
          style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: '#fef9f2', border: '1px solid rgba(201,168,124,0.22)',
            color: '#c9a87c', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#c9a87c';
            (e.currentTarget as HTMLElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#fef9f2';
            (e.currentTarget as HTMLElement).style.color = '#c9a87c';
          }}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Saludo */}
        <div>
          <p style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px',
            textTransform: 'uppercase', color: '#c9a87c', marginBottom: '3px',
          }}>
            Bienvenido a tu espacio
          </p>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '22px', fontWeight: 600, color: '#3f3a35', margin: 0,
          }}>
            {userData ? userData.full_name : 'Cargando perfil...'}
          </h2>
        </div>
      </div>

      {/* DERECHA: Botón inicio */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '9px 18px', borderRadius: '999px',
          fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
          background: '#fff', color: '#5e4b3a',
          border: '1.5px solid rgba(201,168,124,0.35)',
          cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = '#c9a87c';
          (e.currentTarget as HTMLElement).style.color = '#fff';
          (e.currentTarget as HTMLElement).style.borderColor = '#c9a87c';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = '#fff';
          (e.currentTarget as HTMLElement).style.color = '#5e4b3a';
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,124,0.35)';
        }}
      >
        <Home size={14} />
        <span>Ir al inicio</span>
      </button>

    </header>
  );
};

export default ClientHeader;