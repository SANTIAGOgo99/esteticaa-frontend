// src/components/admin/AdminHeader.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, Settings, LogOut, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import './AdminHeader.css';

interface AdminProfile {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
}

const AdminHeader = () => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
        setFormData({
          full_name: response.data.full_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        });
      } catch (error: any) {
        console.error(error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = profile?.full_name || 'Administrador';
  const userRole = !profile || profile.role === 'admin'
    ? 'Administrador'
    : profile?.role === 'employee'
      ? 'Empleado'
      : 'Cliente';

  const initials = useMemo(() => {
    return userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'AD';
  }, [userName]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Sesión cerrada correctamente');
    navigate('/');
  };

  const openSettings = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
    setSettingsOpen(true);
    setMenuOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!profile) return;
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error('Nombre y correo son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(`/users/${profile.id}`, {
        ...formData,
        role: profile.role,
        is_active: profile.is_active,
      });

      setProfile(response.data.user);
      toast.success('Perfil actualizado correctamente');
      setSettingsOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo actualizar tu perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="ah-header">

      {/* Izquierda: breadcrumb + título */}
      <div className="ah-left">
        <span className="ah-breadcrumb">Admin · Panel</span>
        <span className="ah-title">Command Center</span>
      </div>

      {/* Derecha: buscador + acciones */}
      <div className="ah-right">
        <div className="ah-search">
          <Search size={13} className="ah-search-ic" />
          <input type="text" placeholder="Buscar en el atelier…" />
          <kbd className="ah-kbd">⌘K</kbd>
        </div>

        <button className="ah-icon-btn" aria-label="Notificaciones">
          <Bell size={16} strokeWidth={1.8} />
          <span className="ah-badge">3</span>
        </button>

        <div className="ah-divider" />

        <div className="ah-profile-wrap" ref={menuRef}>
          <button
            type="button"
            className={`ah-profile ${menuOpen ? 'is-open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="ah-ava">{initials}</div>
            <div className="ah-info">
              <span className="ah-name">{userName}</span>
              <span className="ah-role">{userRole}</span>
            </div>
            <ChevronDown size={13} className="ah-chevron" />
          </button>

          {menuOpen && (
            <div className="ah-menu" role="menu">
              <div className="ah-menu__head">
                <div className="ah-menu__ava">{initials}</div>
                <div>
                  <strong>{userName}</strong>
                  <span>{profile?.email || 'Sin correo'}</span>
                </div>
              </div>

              <button type="button" className="ah-menu__item" onClick={openSettings}>
                <Settings size={16} />
                Configuración de perfil
              </button>

              <button type="button" className="ah-menu__item ah-menu__item--danger" onClick={handleLogout}>
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {settingsOpen && createPortal(
        <div className="ah-modal-overlay" role="dialog" aria-modal="true" aria-label="Configuración de perfil">
          <div className="ah-modal">
            <div className="ah-modal__header">
              <div>
                <p>Cuenta administrativa</p>
                <h2>Configuración de perfil</h2>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <form className="ah-form" onSubmit={handleSaveProfile}>
              <label>
                Nombre completo
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
              </label>

              <label>
                Correo electrónico
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                />
              </label>

              <label>
                Teléfono
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="WhatsApp o teléfono"
                />
              </label>

              <div className="ah-profile-summary">
                <span>Rol actual</span>
                <strong>{userRole}</strong>
              </div>

              <div className="ah-modal__actions">
                <button type="button" className="ah-btn ah-btn--ghost" onClick={() => setSettingsOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="ah-btn ah-btn--primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="ah-spin" /> : <Save size={16} />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default AdminHeader;
