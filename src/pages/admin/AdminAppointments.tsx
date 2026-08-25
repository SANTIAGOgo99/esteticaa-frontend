// src/pages/admin/AdminAppointments.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Loader2,
  UserX,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import api from '../../services/api';
import './AdminAppointments.css';

type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'canceled'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'in_process'
  | 'pending_review';

type AppointmentFilter = 'all' | 'today' | 'pending_review' | 'completed' | 'no_show';

interface CitaAdmin {
  id: number;
  cliente: string;
  servicio: string;
  appointment_date: string;
  appointment_local?: string;
  appointment_end?: string;
  total_amount: string | number;
  status: AppointmentStatus;
  calendar_status?: AppointmentStatus;
  calendar_status_label?: string;
}

const BUSINESS_TIME_ZONE = 'America/Mexico_City';
const dayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const pad = (value: number) => String(value).padStart(2, '0');
const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/;

const localParts = (value?: string) => {
  if (!value) return null;
  const match = LOCAL_DATE_TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]), hour: Number(match[4]), minute: Number(match[5]) };
};

const formatDateKey = (value: Date) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

const citaDateKey = (cita: CitaAdmin) => {
  const parts = localParts(cita.appointment_local);
  if (parts) return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
  const parsed = new Date(cita.appointment_date);
  if (Number.isNaN(parsed.getTime())) return cita.appointment_date.slice(0, 10);
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
  return formatter.format(parsed);
};

const citaSortValue = (cita: CitaAdmin) => {
  const parts = localParts(cita.appointment_local);
  if (parts) return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  const parsed = new Date(cita.appointment_date);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const formatHour = (cita: CitaAdmin) => {
  const parts = localParts(cita.appointment_local);
  if (parts) {
    const suffix = parts.hour >= 12 ? 'p. m.' : 'a. m.';
    const hour = parts.hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${pad(parts.minute)} ${suffix}`;
  }
  const parsed = new Date(cita.appointment_date);
  if (Number.isNaN(parsed.getTime())) return cita.appointment_date;
  return parsed.toLocaleTimeString('es-MX', { timeZone: BUSINESS_TIME_ZONE, hour: '2-digit', minute: '2-digit' });
};

const formatCitaDate = (cita: CitaAdmin) => {
  const parts = localParts(cita.appointment_local);
  if (parts) {
    return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12)).toLocaleDateString('es-MX', { timeZone: 'UTC' });
  }
  const parsed = new Date(cita.appointment_date);
  if (Number.isNaN(parsed.getTime())) return cita.appointment_date;
  return parsed.toLocaleDateString('es-MX', { timeZone: BUSINESS_TIME_ZONE });
};

const formatLongDate = (value: Date) => value.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const addDays = (date: Date, days: number) => { const copy = new Date(date); copy.setDate(copy.getDate() + days); return copy; };
const getCitaDisplayStatus = (cita: CitaAdmin) => cita.calendar_status || cita.status;

const AdminAppointments = () => {
  const [citas, setCitas] = useState<CitaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [activeFilter, setActiveFilter] = useState<AppointmentFilter>('all');
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      const data = response.data;
      setCitas(Array.isArray(data) ? data : data.appointments || []);
    } catch (error) {
      console.error(error);
      toast.error('No se pudieron cargar las citas.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCitas(); }, []);

  const filteredCitas = useMemo(() => {
    const todayKey = formatDateKey(new Date());
    return citas.filter((cita) => {
      const status = getCitaDisplayStatus(cita);
      if (activeFilter === 'today') return citaDateKey(cita) === todayKey;
      if (activeFilter === 'pending_review') return status === 'pending_review';
      if (activeFilter === 'completed') return status === 'completed';
      if (activeFilter === 'no_show') return status === 'no_show';
      return true;
    });
  }, [activeFilter, citas]);

  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, CitaAdmin[]> = {};
    filteredCitas.forEach((cita) => {
      const key = citaDateKey(cita);
      grouped[key] = grouped[key] || [];
      grouped[key].push(cita);
    });
    Object.values(grouped).forEach((items) => items.sort((a, b) => citaSortValue(a) - citaSortValue(b)));
    return grouped;
  }, [filteredCitas]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const startDate = addDays(firstDay, -mondayOffset);
    return Array.from({ length: 42 }, (_, index) => addDays(startDate, index));
  }, [currentMonth]);

  const selectedDateKey = formatDateKey(selectedDate);
  const selectedAppointments = appointmentsByDate[selectedDateKey] || [];
  const monthLabel = currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      toast.loading('Actualizando estado...', { id: 'updateStatus' });
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      toast.success(newStatus === 'canceled' ? 'Cita cancelada correctamente.' : 'Estado actualizado correctamente.', { id: 'updateStatus' });
      fetchCitas();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al actualizar la cita.', { id: 'updateStatus' });
    }
  };

  const handleCloseAppointment = async (id: number, outcome: 'completed' | 'no_show') => {
    try {
      toast.loading('Cerrando cita...', { id: 'closeAppointment' });
      await api.patch(`/appointments/${id}/close`, { outcome });
      toast.success(outcome === 'completed' ? 'Cita marcada como completada.' : 'Cita marcada como no asistio.', { id: 'closeAppointment' });
      fetchCitas();
    } catch (error) {
      console.error(error);
      toast.error('Hubo un error al cerrar la cita.', { id: 'closeAppointment' });
    }
  };

  const appointmentSummary = useMemo(() => citas.reduce((summary, cita) => {
    const status = getCitaDisplayStatus(cita);
    if (citaDateKey(cita) === formatDateKey(new Date())) summary.today += 1;
    if (status === 'confirmed') summary.confirmed += 1;
    if (status === 'pending_review') summary.pendingReview += 1;
    if (status === 'completed') summary.completed += 1;
    if (status === 'no_show') summary.noShow += 1;
    return summary;
  }, { today: 0, confirmed: 0, pendingReview: 0, completed: 0, noShow: 0 }), [citas]);

  const filterItems: Array<{ key: AppointmentFilter; label: string; count: number }> = [
    { key: 'all', label: 'Todas', count: citas.length },
    { key: 'today', label: 'Hoy', count: appointmentSummary.today },
    { key: 'pending_review', label: 'Por cerrar', count: appointmentSummary.pendingReview },
    { key: 'completed', label: 'Completadas', count: appointmentSummary.completed },
    { key: 'no_show', label: 'No asistieron', count: appointmentSummary.noShow },
  ];

  const canCancel = (status: string) => status === 'pending' || status === 'confirmed';
  const canClose = (status: string) => status === 'pending_review' || status === 'in_process';
  const getStatusBadgeClass = (status: string) => ['pending', 'in_process', 'pending_review'].includes(status) ? 'badge-warning' : ['confirmed', 'completed'].includes(status) ? 'badge-success' : ['canceled', 'cancelled', 'no_show'].includes(status) ? 'badge-error' : 'badge-gray';
  const getStatusLabel = (status: string) => ({ pending: 'Pendiente', confirmed: 'Confirmada', canceled: 'Cancelada', cancelled: 'Cancelada', completed: 'Completada', no_show: 'No asistio', in_process: 'En proceso', pending_review: 'Por cerrar' }[status] || status);
  const renderStatusBadge = (status: string) => <span className={`badge-status ${getStatusBadgeClass(status)}`}>{getStatusLabel(status)}</span>;

  const renderActions = (cita: CitaAdmin) => {
    const status = getCitaDisplayStatus(cita);
    if (canClose(status)) return <><button className="btn-icon text-emerald" title="Marcar como completada" onClick={() => handleCloseAppointment(cita.id, 'completed')}><CheckCircle2 size={18}/></button><button className="btn-icon text-amber" title="Marcar como no asistio" onClick={() => handleCloseAppointment(cita.id, 'no_show')}><UserX size={18}/></button></>;
    if (canCancel(status)) return <button className="btn-icon text-rose" title="Cancelar cita" onClick={() => handleUpdateStatus(cita.id, 'canceled')}><XCircle size={18}/></button>;
    return <span className="text-muted">Sin acciones</span>;
  };

  const goToPreviousMonth = () => setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  const goToToday = () => { const today = new Date(); setCurrentMonth(today); setSelectedDate(today); };

  if (loading) return <div className="loading-state"><Loader2 className="spinner" size={32}/></div>;

  return (
    <div className="saas-container">
      <Breadcrumbs />
      <div className="saas-header">
        <div><p className="saas-eyebrow">Gestion de Agenda</p><h1 className="saas-title">Citas Programadas</h1><p className="saas-subtitle">Las citas tomadas desde la web se confirman automaticamente cuando el horario esta disponible.</p></div>
        <div className="appointments-view-switch"><button type="button" className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}><CalendarDays size={16}/>Calendario</button><button type="button" className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}><List size={16}/>Tabla</button></div>
      </div>

      <section className="appointments-summary-strip">
        <article className="appointment-summary-card"><span>Confirmadas</span><strong>{appointmentSummary.confirmed}</strong><small>Citas activas en agenda</small></article>
        <article className="appointment-summary-card warning"><span>Por cerrar</span><strong>{appointmentSummary.pendingReview}</strong><small>Ya terminaron y necesitan resultado</small></article>
        <article className="appointment-summary-card success"><span>Completadas</span><strong>{appointmentSummary.completed}</strong><small>Servicios realizados</small></article>
        <article className="appointment-summary-card danger"><span>No asistieron</span><strong>{appointmentSummary.noShow}</strong><small>Citas cerradas sin servicio</small></article>
      </section>

      <div className="appointments-filter-bar" aria-label="Filtros de citas">{filterItems.map((filter) => <button key={filter.key} type="button" className={activeFilter === filter.key ? 'active' : ''} onClick={() => { setActiveFilter(filter.key); if (filter.key === 'today') goToToday(); }}><span>{filter.label}</span><strong>{filter.count}</strong></button>)}</div>

      {viewMode === 'calendar' ? (
        <div className="appointments-calendar-shell">
          <section className="appointments-calendar-card">
            <div className="calendar-toolbar"><button type="button" className="calendar-nav-btn" onClick={goToPreviousMonth}><ChevronLeft size={18}/></button><div className="calendar-title-block"><h2>{monthLabel}</h2><span>{filteredCitas.length} citas visibles</span></div><button type="button" className="calendar-nav-btn" onClick={goToNextMonth}><ChevronRight size={18}/></button><button type="button" className="calendar-today-btn" onClick={goToToday}>Hoy</button></div>
            <div className="calendar-weekdays">{dayLabels.map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-grid">
              {calendarDays.map((day) => {
                const dateKey = formatDateKey(day);
                const dayAppointments = appointmentsByDate[dateKey] || [];
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isSelected = dateKey === selectedDateKey;
                const isToday = dateKey === formatDateKey(new Date());
                return <button type="button" key={dateKey} className={['calendar-day-cell', !isCurrentMonth ? 'muted' : '', isSelected ? 'selected' : '', isToday ? 'today' : ''].join(' ')} onClick={() => setSelectedDate(day)}><span className="calendar-day-number">{day.getDate()}</span>{dayAppointments.length > 0 && <span className="calendar-day-count">{dayAppointments.length}</span>}<div className="calendar-day-items">{dayAppointments.slice(0, 2).map((cita) => <span key={cita.id} className={`calendar-mini-event ${getStatusBadgeClass(getCitaDisplayStatus(cita))}`}>{formatHour(cita)} {cita.servicio || 'Servicio'}</span>)}{dayAppointments.length > 2 && <span className="calendar-more">+{dayAppointments.length - 2} mas</span>}</div></button>;
              })}
            </div>
          </section>

          <aside className="calendar-day-panel">
            <div className="calendar-day-panel-header"><span>Dia seleccionado</span><h2>{formatLongDate(selectedDate)}</h2></div>
            {selectedAppointments.length === 0 ? <div className="calendar-empty-day"><CalendarIcon size={28}/><p>No hay citas para este dia.</p></div> : <div className="calendar-appointment-list">{selectedAppointments.map((cita) => <article key={cita.id} className="calendar-appointment-card"><div className="calendar-appointment-time"><Clock size={15}/>{formatHour(cita)}</div><h3>{cita.servicio || 'Servicio General'}</h3><p>{cita.cliente || 'Usuario Web'}</p><div className="calendar-appointment-footer">{renderStatusBadge(getCitaDisplayStatus(cita))}<strong>${Number(cita.total_amount || 0).toFixed(2)}</strong></div><div className="calendar-appointment-actions">{renderActions(cita)}</div></article>)}</div>}
          </aside>
        </div>
      ) : (
        <div className="saas-table-card"><table className="saas-table"><thead><tr><th>ID</th><th>Cliente</th><th>Servicio</th><th>Fecha y Hora</th><th>Monto</th><th>Estado</th><th className="text-center">Acciones</th></tr></thead><tbody>{filteredCitas.length === 0 ? <tr><td colSpan={7} className="text-center text-muted" style={{ padding: '40px' }}>No hay citas agendadas en este momento.</td></tr> : filteredCitas.map((cita) => <tr key={cita.id} className={getCitaDisplayStatus(cita) === 'pending_review' ? 'row-highlight' : ''}><td className="text-muted">#{cita.id}</td><td className="font-medium text-indigo">{cita.cliente || 'Usuario Web'}</td><td>{cita.servicio || 'Servicio General'}</td><td><div className="appointment-date-cell"><span><CalendarIcon size={12} className="text-muted"/>{formatCitaDate(cita)}</span><span><Clock size={12} className="text-muted"/>{formatHour(cita)}</span></div></td><td className="font-semibold text-emerald">${Number(cita.total_amount || 0).toFixed(2)}</td><td>{renderStatusBadge(getCitaDisplayStatus(cita))}</td><td><div className="action-buttons">{renderActions(cita)}</div></td></tr>)}</tbody></table></div>
      )}
    </div>
  );
};

export default AdminAppointments;
