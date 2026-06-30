import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Clock,
  DollarSign,
  Edit3,
  Eye,
  Loader2,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  ShoppingBag,
  StickyNote,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AdminClients.css';

interface ClientSummary {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  fecha_registro: string;
  appointments_count: number;
  completed_appointments: number;
  canceled_appointments: number;
  no_show_appointments: number;
  total_services_spent: string | number;
  next_appointment: string | null;
  last_appointment: string | null;
  notes_count: number;
  last_note: string | null;
}

interface AppointmentHistory {
  id: number;
  servicio: string | null;
  duration_minutes: number | null;
  appointment_date: string;
  appointment_end: string | null;
  status: string;
  total_amount: string | number;
  deposit_amount: string | number;
  remaining_amount: string | number;
  appointment_origin: string;
}

interface ClientNote {
  id: number;
  note: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string | null;
}

interface PurchaseItem {
  id: number;
  status: string;
  total_amount: string | number;
  created_at: string;
}

interface ClientDetail {
  client: ClientSummary;
  appointments: AppointmentHistory[];
  purchases: {
    available: boolean;
    message: string;
    summary: {
      orders_count: number;
      total_spent: string | number;
    };
    items: PurchaseItem[];
  };
  notes: ClientNote[];
}

const emptyEditForm = {
  full_name: '',
  email: '',
  phone: '',
  is_active: true,
};

const formatMoney = (value: string | number | null | undefined) => {
  const numericValue = Number(value || 0);
  return numericValue.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registro';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registro';

  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Sin cita';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin cita';

  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    completed: 'Finalizada',
    canceled: 'Cancelada',
    cancelled: 'Cancelada',
    no_show: 'No asistio',
  };

  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  if (status === 'completed') return 'client-status client-status--success';
  if (status === 'confirmed') return 'client-status client-status--info';
  if (status === 'pending') return 'client-status client-status--warning';
  if (status === 'canceled' || status === 'cancelled' || status === 'no_show') {
    return 'client-status client-status--danger';
  }
  return 'client-status';
};

const AdminClients = () => {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [summary, setSummary] = useState({
    active_clients: 0,
    clients_with_appointments: 0,
    total_services_revenue: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [savingClient, setSavingClient] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setClients(response.data.clients || []);
      setSummary(response.data.summary || summary);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const openClientDetail = async (clientId: number) => {
    try {
      setDetailLoading(true);
      const response = await api.get(`/clients/${clientId}`);
      const clientDetail = response.data as ClientDetail;

      setDetail(clientDetail);
      setEditForm({
        full_name: clientDetail.client.full_name || '',
        email: clientDetail.client.email || '',
        phone: clientDetail.client.phone || '',
        is_active: Boolean(clientDetail.client.is_active),
      });
      setNoteText('');
      setEditingNoteId(null);
      setEditingNoteText('');
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el expediente del cliente');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return clients;

    return clients.filter((client) => {
      return [
        client.full_name,
        client.email,
        client.phone || '',
      ].some((value) => value.toLowerCase().includes(term));
    });
  }, [clients, search]);

  const updateEditField = (field: keyof typeof emptyEditForm, value: string | boolean) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveClientData = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!detail) return;

    if (!editForm.full_name.trim() || !editForm.email.trim()) {
      toast.error('Nombre y correo son obligatorios');
      return;
    }

    try {
      setSavingClient(true);
      const response = await api.put(`/users/${detail.client.id}`, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        role: 'client',
        is_active: editForm.is_active,
      });

      const updatedClient = response.data.user;

      setDetail((prev) => prev ? {
        ...prev,
        client: {
          ...prev.client,
          ...updatedClient,
        },
      } : prev);

      setClients((prev) => prev.map((client) => (
        client.id === updatedClient.id
          ? { ...client, ...updatedClient }
          : client
      )));

      toast.success('Datos del cliente actualizados');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo actualizar el cliente');
    } finally {
      setSavingClient(false);
    }
  };

  const addNote = async () => {
    if (!detail) return;

    if (noteText.trim().length < 3) {
      toast.error('La nota debe tener al menos 3 caracteres');
      return;
    }

    try {
      setSavingNote(true);
      await api.post(`/clients/${detail.client.id}/notes`, {
        note: noteText,
      });
      toast.success('Nota guardada');
      setNoteText('');
      await openClientDetail(detail.client.id);
      await fetchClients();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo guardar la nota');
    } finally {
      setSavingNote(false);
    }
  };

  const startEditNote = (note: ClientNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.note);
  };

  const saveEditedNote = async () => {
    if (!detail || !editingNoteId) return;

    if (editingNoteText.trim().length < 3) {
      toast.error('La nota debe tener al menos 3 caracteres');
      return;
    }

    try {
      setSavingNote(true);
      await api.put(`/clients/${detail.client.id}/notes/${editingNoteId}`, {
        note: editingNoteText,
      });
      toast.success('Nota actualizada');
      setEditingNoteId(null);
      setEditingNoteText('');
      await openClientDetail(detail.client.id);
      await fetchClients();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo actualizar la nota');
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = async (noteId: number) => {
    if (!detail) return;

    const confirmed = window.confirm('Quieres eliminar esta nota interna?');
    if (!confirmed) return;

    try {
      await api.delete(`/clients/${detail.client.id}/notes/${noteId}`);
      toast.success('Nota eliminada');
      await openClientDetail(detail.client.id);
      await fetchClients();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo eliminar la nota');
    }
  };

  const closeDetail = () => {
    if (savingClient || savingNote) return;
    setDetail(null);
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  if (loading) {
    return (
      <div className="loading-state">
        <Loader2 className="spinner" size={32} />
      </div>
    );
  }

  return (
    <div className="admin-clients-page">
      <Breadcrumbs />

      <div className="clients-hero">
        <div>
          <p className="clients-eyebrow">CRM Atelier</p>
          <h1>Clientes</h1>
          <p>Consulta datos de contacto, historial de citas, compras y notas internas.</p>
        </div>
      </div>

      <section className="clients-kpis" aria-label="Resumen de clientes">
        <article>
          <span className="clients-kpi-icon"><Users size={20} /></span>
          <div>
            <strong>{clients.length}</strong>
            <p>Clientes registrados</p>
          </div>
        </article>
        <article>
          <span className="clients-kpi-icon"><UserCheck size={20} /></span>
          <div>
            <strong>{summary.active_clients}</strong>
            <p>Clientes activos</p>
          </div>
        </article>
        <article>
          <span className="clients-kpi-icon"><CalendarDays size={20} /></span>
          <div>
            <strong>{summary.clients_with_appointments}</strong>
            <p>Con historial de citas</p>
          </div>
        </article>
        <article>
          <span className="clients-kpi-icon"><DollarSign size={20} /></span>
          <div>
            <strong>{formatMoney(summary.total_services_revenue)}</strong>
            <p>Ingresos por servicios finalizados</p>
          </div>
        </article>
      </section>

      <section className="clients-panel">
        <div className="clients-toolbar">
          <div>
            <h2>Directorio de clientes</h2>
            <p>{filteredClients.length} resultados visibles</p>
          </div>

          <label className="clients-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, correo o telefono..."
            />
          </label>
        </div>

        <div className="clients-table-wrap">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Citas</th>
                <th>Proxima cita</th>
                <th>Total servicios</th>
                <th>Notas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="clients-empty">
                    No hay clientes que coincidan con la busqueda.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="client-name-cell">
                        <span>{client.full_name?.charAt(0)?.toUpperCase() || 'C'}</span>
                        <div>
                          <strong>{client.full_name}</strong>
                          <small>Desde {formatDate(client.fecha_registro)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="client-contact-cell">
                        <span><Mail size={13} /> {client.email}</span>
                        <span><Phone size={13} /> {client.phone || 'Sin telefono'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="client-count-cell">
                        <strong>{client.appointments_count}</strong>
                        <small>{client.completed_appointments} finalizadas</small>
                      </div>
                    </td>
                    <td>{formatDateTime(client.next_appointment)}</td>
                    <td className="client-money">{formatMoney(client.total_services_spent)}</td>
                    <td>
                      <span className="client-note-pill">
                        <StickyNote size={13} />
                        {client.notes_count || 0}
                      </span>
                    </td>
                    <td>
                      <span className={client.is_active ? 'client-state client-state--active' : 'client-state'}>
                        {client.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="clients-action-btn"
                        onClick={() => openClientDetail(client.id)}
                        title="Ver expediente"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {(detail || detailLoading) && (
        <div className="client-detail-overlay" role="dialog" aria-modal="true" aria-label="Expediente de cliente">
          <aside className="client-detail">
            {detailLoading && !detail ? (
              <div className="client-detail-loading">
                <Loader2 className="spinner" size={30} />
                <span>Cargando expediente...</span>
              </div>
            ) : detail ? (
              <>
                <div className="client-detail-header">
                  <div>
                    <p className="clients-eyebrow">Expediente</p>
                    <h2>{detail.client.full_name}</h2>
                    <span>{detail.client.email}</span>
                  </div>
                  <button type="button" onClick={closeDetail} aria-label="Cerrar expediente">
                    <X size={19} />
                  </button>
                </div>

                <div className="client-detail-content">
                  <section className="client-detail-grid">
                    <article>
                      <CalendarDays size={18} />
                      <strong>{detail.client.appointments_count}</strong>
                      <span>Citas</span>
                    </article>
                    <article>
                      <UserCheck size={18} />
                      <strong>{detail.client.completed_appointments}</strong>
                      <span>Finalizadas</span>
                    </article>
                    <article>
                      <DollarSign size={18} />
                      <strong>{formatMoney(detail.client.total_services_spent)}</strong>
                      <span>Servicios</span>
                    </article>
                  </section>

                  <section className="client-section-card">
                    <div className="client-section-title">
                      <div>
                        <h3>Datos basicos</h3>
                        <p>Nombre, correo, telefono y estado del cliente.</p>
                      </div>
                      <Edit3 size={18} />
                    </div>

                    <form className="client-edit-form" onSubmit={saveClientData}>
                      <label>
                        Nombre completo
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(event) => updateEditField('full_name', event.target.value)}
                        />
                      </label>
                      <label>
                        Correo electronico
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(event) => updateEditField('email', event.target.value)}
                        />
                      </label>
                      <label>
                        Telefono
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(event) => updateEditField('phone', event.target.value)}
                        />
                      </label>
                      <label>
                        Estado
                        <select
                          value={String(editForm.is_active)}
                          onChange={(event) => updateEditField('is_active', event.target.value === 'true')}
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </label>

                      <button type="submit" disabled={savingClient}>
                        {savingClient ? <Loader2 className="spinner" size={16} /> : <Save size={16} />}
                        {savingClient ? 'Guardando...' : 'Guardar datos'}
                      </button>
                    </form>
                  </section>

                  <section className="client-section-card">
                    <div className="client-section-title">
                      <div>
                        <h3>Historial de citas</h3>
                        <p>Servicios reservados por este cliente.</p>
                      </div>
                      <Clock size={18} />
                    </div>

                    {detail.appointments.length === 0 ? (
                      <p className="client-muted-box">Este cliente todavia no tiene citas registradas.</p>
                    ) : (
                      <div className="client-mini-table-wrap">
                        <table className="client-mini-table">
                          <thead>
                            <tr>
                              <th>Servicio</th>
                              <th>Fecha</th>
                              <th>Estado</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.appointments.map((appointment) => (
                              <tr key={appointment.id}>
                                <td>{appointment.servicio || 'Servicio general'}</td>
                                <td>{formatDateTime(appointment.appointment_date)}</td>
                                <td>
                                  <span className={getStatusClass(appointment.status)}>
                                    {getStatusLabel(appointment.status)}
                                  </span>
                                </td>
                                <td>{formatMoney(appointment.total_amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="client-section-card">
                    <div className="client-section-title">
                      <div>
                        <h3>Historial de compras</h3>
                        <p>Pedidos y compras hechas desde la tienda.</p>
                      </div>
                      <ShoppingBag size={18} />
                    </div>

                    {!detail.purchases.available ? (
                      <p className="client-muted-box">{detail.purchases.message}</p>
                    ) : detail.purchases.items.length === 0 ? (
                      <p className="client-muted-box">Este cliente todavia no tiene compras registradas.</p>
                    ) : (
                      <div className="client-mini-table-wrap">
                        <table className="client-mini-table">
                          <thead>
                            <tr>
                              <th>Pedido</th>
                              <th>Fecha</th>
                              <th>Estado</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.purchases.items.map((purchase) => (
                              <tr key={purchase.id}>
                                <td>#{purchase.id}</td>
                                <td>{formatDateTime(purchase.created_at)}</td>
                                <td>{purchase.status}</td>
                                <td>{formatMoney(purchase.total_amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="client-section-card">
                    <div className="client-section-title">
                      <div>
                        <h3>Notas internas</h3>
                        <p>Observaciones privadas para el equipo administrativo.</p>
                      </div>
                      <StickyNote size={18} />
                    </div>

                    <div className="client-note-composer">
                      <textarea
                        value={noteText}
                        onChange={(event) => setNoteText(event.target.value)}
                        placeholder="Ej. Prefiere citas por la tarde, alergias, seguimiento de tratamientos..."
                      />
                      <button type="button" onClick={addNote} disabled={savingNote}>
                        {savingNote ? <Loader2 className="spinner" size={16} /> : <Plus size={16} />}
                        Guardar nota
                      </button>
                    </div>

                    <div className="client-notes-list">
                      {detail.notes.length === 0 ? (
                        <p className="client-muted-box">Sin notas internas por ahora.</p>
                      ) : (
                        detail.notes.map((note) => (
                          <article key={note.id} className="client-note-card">
                            {editingNoteId === note.id ? (
                              <>
                                <textarea
                                  value={editingNoteText}
                                  onChange={(event) => setEditingNoteText(event.target.value)}
                                />
                                <div className="client-note-actions">
                                  <button type="button" onClick={() => setEditingNoteId(null)}>
                                    Cancelar
                                  </button>
                                  <button type="button" onClick={saveEditedNote} disabled={savingNote}>
                                    Guardar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <p>{note.note}</p>
                                <div className="client-note-meta">
                                  <span>
                                    {formatDateTime(note.updated_at)}
                                    {note.created_by_name ? ` por ${note.created_by_name}` : ''}
                                  </span>
                                  <div>
                                    <button type="button" onClick={() => startEditNote(note)} title="Editar nota">
                                      <Edit3 size={15} />
                                    </button>
                                    <button type="button" onClick={() => deleteNote(note.id)} title="Eliminar nota">
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </article>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
};

export default AdminClients;
