import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Calendar, CheckCircle2, Clock, History, Plus, RefreshCw, Scissors, X, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ClientBookAppointment from './ClientBookAppointment';
import { getApiMessage, isValidAppointmentDate, localDateKey, type AppointmentSlot } from './appointmentUtils';

const fetcher = (url: string) => api.get(url).then((res) => res.data);
type AppointmentView = 'list' | 'book';
interface Props { initialView?: AppointmentView }
interface Appointment {
  id: number; service_id?: number; service_name?: string; servicio?: string;
  service_category?: string; category?: string; price?: string | number; total_amount?: string | number;
  duration?: number; duration_minutes?: number; appointment_date: string; appointment_end?: string;
  status: string; origin?: string; calendar_status?: string;
  can_reschedule?: boolean; reschedule_deadline?: string; reschedule_reason?: string;
}

const money = (value?: string | number) => Number(value || 0).toFixed(2);
const dateLabel = (value: string) => new Date(value).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const hourLabel = (value: string) => new Date(value).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
const statusOf = (item: Appointment) => item.calendar_status || item.status;
const statusLabel = (status: string) => ({ pending: 'Pendiente', confirmed: 'Confirmada', canceled: 'Cancelada', cancelled: 'Cancelada', completed: 'Completada', no_show: 'No asistió' }[status] || status);
const statusClass = (status: string) => status === 'confirmed' ? 'status-confirmed' : status === 'pending' ? 'status-pending' : ['canceled', 'cancelled', 'no_show'].includes(status) ? 'status-canceled' : 'status-completed';
const active = (item: Appointment) => ['pending', 'confirmed'].includes(statusOf(item));
const serviceName = (item: Appointment) => item.service_name || item.servicio || 'Servicio general';

const ClientAppointments = ({ initialView = 'list' }: Props) => {
  const [view, setView] = useState<AppointmentView>(initialView);
  const { data, error, isLoading, mutate } = useSWR('/appointments/my', fetcher);
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState<AppointmentSlot | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => setView(initialView), [initialView]);
  const appointments: Appointment[] = useMemo(() => Array.isArray(data) ? data : data?.appointments || [], [data]);
  const sorted = useMemo(() => [...appointments].sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()), [appointments]);
  const upcoming = sorted.filter((item) => new Date(item.appointment_date).getTime() >= Date.now() && active(item));
  const history = sorted.filter((item) => !upcoming.includes(item)).reverse();

  useEffect(() => {
    if (!rescheduling?.service_id || !isValidAppointmentDate(newDate)) { setSlots([]); setNewSlot(null); return; }
    let current = true; setLoadingSlots(true); setNewSlot(null);
    api.get('/appointments/slots', { params: { date: newDate, service_id: rescheduling.service_id } })
      .then(({ data: response }) => {
        if (!current) return;
        setSlots((response.available_slots || []).map((item: AppointmentSlot | string) => typeof item === 'string' ? { time: item, appointment_date: `${newDate} ${item}` } : item));
      })
      .catch((requestError) => { if (current) { setSlots([]); toast.error(getApiMessage(requestError, 'No se pudo consultar la disponibilidad.')); } })
      .finally(() => { if (current) setLoadingSlots(false); });
    return () => { current = false; };
  }, [newDate, rescheduling]);

  const closeReschedule = () => { setRescheduling(null); setNewDate(''); setNewSlot(null); setSlots([]); };
  const cancel = async (item: Appointment) => {
    if (!window.confirm('¿Confirmas que deseas cancelar esta cita?')) return;
    try { await api.patch(`/appointments/${item.id}/cancel`); toast.success('Cita cancelada correctamente.'); await mutate(); }
    catch (requestError) { toast.error(getApiMessage(requestError, 'No se pudo cancelar la cita. Intenta más tarde.')); }
  };
  const reschedule = async () => {
    if (!rescheduling || !newSlot) return;
    try {
      setSaving(true);
      await api.patch(`/appointments/${rescheduling.id}/reschedule`, { appointment_date: newSlot.appointment_date });
      toast.success('Tu cita fue reagendada correctamente.'); closeReschedule(); await mutate();
    } catch (requestError) {
      toast.error(getApiMessage(requestError, 'No se pudo reagendar la cita. Intenta más tarde.'));
      if ((requestError as { response?: { status?: number } }).response?.status === 409) setNewSlot(null);
    } finally { setSaving(false); }
  };

  const card = (item: Appointment) => <article key={item.id} className="client-appointment-card">
    <div className="client-appointment-main"><div className="client-appointment-icon"><Scissors size={22}/></div><div><span className={`client-status-pill ${statusClass(statusOf(item))}`}>{statusLabel(statusOf(item))}</span><h3>{serviceName(item)}</h3><p>{dateLabel(item.appointment_date)}</p></div></div>
    <div className="client-appointment-meta"><span><Clock size={15}/>{hourLabel(item.appointment_date)}</span><strong>${money(item.price ?? item.total_amount)}</strong></div>
    <dl className="client-appointment-details">{(item.service_category || item.category) && <div><dt>Categoría</dt><dd>{item.service_category || item.category}</dd></div>}{(item.duration ?? item.duration_minutes) != null && <div><dt>Duración</dt><dd>{item.duration ?? item.duration_minutes} minutos</dd></div>}{item.origin && <div><dt>Origen</dt><dd>{item.origin}</dd></div>}</dl>
    {active(item) && <div className="client-appointment-actions"><button type="button" className="client-reschedule-appointment" disabled={item.can_reschedule === false} onClick={() => { if (item.can_reschedule !== false) setRescheduling(item); }}><RefreshCw size={16}/>Reagendar</button><button type="button" className="client-cancel-appointment" onClick={() => cancel(item)}><XCircle size={16}/>Cancelar cita</button></div>}
    {item.can_reschedule === false && <p className="client-reschedule-reason">{item.reschedule_reason || 'Esta cita no se puede reagendar.'}</p>}
  </article>;

  return <div className="client-appointments-container">
    <div className="appointments-client-header"><div><span className="section-badge">Agenda personal</span><h1>Mis Citas</h1><p>Consulta tus próximas visitas, revisa tu historial y agenda nuevos servicios.</p></div><div className="client-appointments-tabs"><button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><Calendar size={16}/>Mis citas</button><button className={view === 'book' ? 'active' : ''} onClick={() => setView('book')}><Plus size={16}/>Agendar</button></div></div>
    {view === 'book' ? <ClientBookAppointment onAppointmentCreated={() => { mutate(); setView('list'); }}/> : <><section className="client-appointments-summary"><div><CheckCircle2 size={24}/><span>Próximas citas</span><strong>{upcoming.length}</strong></div><div><History size={24}/><span>Historial</span><strong>{history.length}</strong></div></section>{isLoading && <div className="booking-message">Cargando tus citas...</div>}{error && <div className="booking-message error">No se pudieron cargar tus citas. Intenta más tarde.</div>}{!isLoading && !error && !appointments.length && <div className="client-appointments-empty"><Calendar size={42}/><h2>Aún no tienes citas</h2><p>Agenda tu primer servicio.</p><button onClick={() => setView('book')}><Plus size={17}/>Agendar cita</button></div>}{upcoming.length > 0 && <section className="client-appointments-section"><div className="client-section-title"><Calendar size={18}/><h2>Próximas citas</h2></div><div className="client-appointments-grid">{upcoming.map(card)}</div></section>}{history.length > 0 && <section className="client-appointments-section"><div className="client-section-title"><History size={18}/><h2>Historial</h2></div><div className="client-appointments-grid">{history.map(card)}</div></section>}</>}
    {rescheduling && <div className="appointment-modal-backdrop" role="presentation"><section className="appointment-reschedule-modal" role="dialog" aria-modal="true" aria-labelledby="reschedule-title"><button className="appointment-modal-close" onClick={closeReschedule} aria-label="Cerrar"><X/></button><h2 id="reschedule-title">Reagendar cita</h2><div className="booking-selected-service"><strong>{serviceName(rescheduling)}</strong><span>{rescheduling.duration ?? rescheduling.duration_minutes ?? '—'} minutos</span></div><label className="booking-date-label">Nueva fecha<input className="booking-date-input" type="date" min={localDateKey()} value={newDate} onChange={(e) => { const nextDate = e.target.value; if (!isValidAppointmentDate(nextDate)) { setNewDate(''); toast.error('Selecciona una fecha a partir de hoy. Los domingos el negocio está cerrado.'); return; } setNewDate(nextDate); }}/></label>{loadingSlots && <div className="booking-message">Consultando disponibilidad...</div>}{newDate && !loadingSlots && !slots.length && <div className="booking-message">No existen horarios disponibles para este día o el negocio está cerrado.</div>}<div className="booking-slots-grid">{slots.map((item) => <button key={`${item.appointment_date}-${item.time}`} className={`booking-slot available ${newSlot?.appointment_date === item.appointment_date ? 'selected' : ''}`} onClick={() => setNewSlot(item)}><strong>{item.time}</strong><span>Disponible</span></button>)}</div>{newSlot && <div className="reschedule-summary"><h3>Confirma el cambio</h3><p><b>Servicio:</b> {serviceName(rescheduling)}</p><p><b>Fecha anterior:</b> {dateLabel(rescheduling.appointment_date)} · {hourLabel(rescheduling.appointment_date)}</p><p><b>Nueva fecha:</b> {dateLabel(newSlot.appointment_date)}</p><p><b>Nueva hora:</b> {newSlot.time}</p><p><b>Duración:</b> {rescheduling.duration ?? rescheduling.duration_minutes ?? '—'} minutos</p><button className="booking-confirm-button" disabled={saving} onClick={reschedule}>{saving ? 'Reagendando...' : 'Confirmar reagendamiento'}</button></div>}</section></div>}
  </div>;
};
export default ClientAppointments;
