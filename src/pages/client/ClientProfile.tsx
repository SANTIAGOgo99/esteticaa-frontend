import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, Save, ShieldCheck, UserRound } from 'lucide-react';
import api from '../../services/api';

interface UserProfile {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  role?: string;
}

interface ClientProfileProps {
  userData: UserProfile | null;
  onProfileUpdate: (user: UserProfile) => void;
}

const ClientProfile = ({ userData, onProfileUpdate }: ClientProfileProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      full_name: userData?.full_name || '',
      phone: userData?.phone || '',
    });
  }, [userData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanName = formData.full_name.trim();
    const cleanPhone = formData.phone.trim();

    if (cleanName.length < 3) {
      toast.error('Tu nombre debe tener al menos 3 caracteres.');
      return;
    }

    if (cleanPhone && !/^[0-9+\-\s()]{7,20}$/.test(cleanPhone)) {
      toast.error('Revisa el formato del telefono.');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/users/profile', {
        full_name: cleanName,
        phone: cleanPhone,
      });

      onProfileUpdate(response.data.user);
      toast.success('Perfil actualizado correctamente.');
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="client-profile-container">
      <div className="profile-header">
        <div>
          <span className="section-badge">Cuenta</span>
          <h1>Mi Perfil</h1>
          <p>Actualiza tus datos de contacto para citas y compras.</p>
        </div>

        <div className="profile-avatar-card">
          <div className="profile-avatar">
            {userData?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <strong>{userData?.full_name || 'Cliente'}</strong>
            <span>Cliente registrado</span>
          </div>
        </div>
      </div>

      <div className="profile-layout">
        <form className="profile-form-card" onSubmit={handleSubmit}>
          <div className="profile-form-title">
            <UserRound size={20} />
            <h2>Datos editables</h2>
          </div>

          <label className="profile-field">
            <span>Nombre completo</span>
            <div className="profile-input-wrap">
              <UserRound size={18} />
              <input
                type="text"
                value={formData.full_name}
                onChange={(event) => setFormData((current) => ({ ...current, full_name: event.target.value }))}
                placeholder="Tu nombre completo"
              />
            </div>
          </label>

          <label className="profile-field">
            <span>Telefono</span>
            <div className="profile-input-wrap">
              <Phone size={18} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Tu telefono o WhatsApp"
              />
            </div>
          </label>

          <button className="profile-save-button" type="submit" disabled={saving}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <aside className="profile-security-card">
          <div className="profile-form-title">
            <ShieldCheck size={20} />
            <h2>Datos protegidos</h2>
          </div>

          <div className="profile-readonly-item">
            <div>
              <Mail size={18} />
              <span>Correo electronico</span>
            </div>
            <strong>{userData?.email || 'No disponible'}</strong>
          </div>

          <div className="profile-readonly-item">
            <div>
              <ShieldCheck size={18} />
              <span>Tipo de cuenta</span>
            </div>
            <strong>Cliente</strong>
          </div>

          <p>
            Por seguridad, el correo, rol, estado de cuenta y contrasena no se editan desde esta pantalla.
            Esos cambios deben hacerse desde administracion o mediante un flujo seguro.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default ClientProfile;
