// src/pages/admin/AdminUsers.tsx
import { useState, useEffect } from 'react';
import { Edit, Shield, User as UserIcon, Loader2, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AdminUsers.css';

interface UserData {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  fecha_registro: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'client',
    is_active: true,
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: UserData) => {
    setUserToEdit(user);
    setFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'client',
      is_active: user.is_active,
    });
  };

  const closeEditModal = () => {
    if (saving) return;
    setUserToEdit(null);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userToEdit) return;
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error('Nombre y correo son obligatorios');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put(`/users/${userToEdit.id}`, formData);
      const updatedUser = response.data.user as UserData;

      setUsers(prev => prev.map(user => (
        user.id === updatedUser.id ? updatedUser : user
      )));
      toast.success('Usuario actualizado correctamente');
      setUserToEdit(null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':    return <span className="badge-role badge-indigo"><Shield size={12} /> Admin</span>;
      case 'employee': return <span className="badge-role badge-emerald">Empleado</span>;
      default:         return <span className="badge-role badge-gray">Cliente</span>;
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="spinner" size={32} /></div>;

  return (
    <div className="saas-container">
      <Breadcrumbs />

      <div className="saas-header">
        <div>
          <p className="saas-eyebrow">Directorio</p>
          <h1 className="saas-title">Gestión de Usuarios</h1>
          <p className="text-muted mt-1">Administra los roles y accesos al sistema.</p>
        </div>
      </div>

      <div className="saas-table-card">
        <table className="saas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Contacto</th>
              <th>Fecha Registro</th>
              <th>Rol</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted" style={{ padding: '40px' }}>
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className={user.is_active ? '' : 'row-inactive'}>
                  <td className="text-muted">#{user.id}</td>
                  <td className="font-medium flex-cell text-indigo">
                    <UserIcon size={16} /> {user.full_name}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500, color: '#334155' }}>{user.email}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{user.phone}</span>
                    </div>
                  </td>
                  <td className="text-muted">{new Date(user.fecha_registro).toLocaleDateString()}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <span className={`badge-status ${user.is_active ? 'badge-success' : 'badge-error'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon text-indigo"
                        title="Editar perfil"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {userToEdit && (
        <div className="user-modal-overlay" role="dialog" aria-modal="true" aria-label="Editar usuario">
          <div className="user-modal">
            <div className="user-modal__header">
              <div>
                <p className="saas-eyebrow">Perfil administrativo</p>
                <h2>Editar usuario</h2>
              </div>
              <button type="button" className="user-modal__close" onClick={closeEditModal} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              <label>
                Nombre completo
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nombre del usuario"
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

              <div className="user-form__grid">
                <label>
                  Rol
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="client">Cliente</option>
                    <option value="employee">Empleado</option>
                    <option value="admin">Administrador</option>
                  </select>
                </label>

                <label>
                  Estado
                  <select
                    name="is_active"
                    value={String(formData.is_active)}
                    onChange={(event) => setFormData(prev => ({
                      ...prev,
                      is_active: event.target.value === 'true',
                    }))}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </label>
              </div>

              <div className="user-modal__actions">
                <button type="button" className="btn-saas-outline" onClick={closeEditModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-saas-primary" disabled={saving}>
                  {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
