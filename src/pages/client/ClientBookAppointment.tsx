import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AlertCircle, Calendar, CheckCircle, Clock, Scissors, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AppointmentDatePicker from '../../components/client/AppointmentDatePicker';
import { getApiMessage, isValidAppointmentDate, type AppointmentSlot } from './appointmentUtils';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface Service {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  duration_minutes: number;
  category?: string;
}

interface SlotsResponse {
  service_id?: number;
  service_name?: string;
  duration_minutes?: number;
  service?: Partial<Service>;
  available_slots?: Array<AppointmentSlot | string>;
  business_hours?: unknown;
  message?: string;
}

interface Props { onAppointmentCreated?: () => void }

const money = (value: string | number | undefined) => Number(value || 0).toFixed(2);
const longDate = (date: string) => date
  ? new Date(`${date}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  : 'Sin seleccionar';

const normalizeSlots = (values: SlotsResponse['available_slots'], date: string): AppointmentSlot[] =>
  (values || []).map((slot) => typeof slot === 'string'
    ? { time: slot, appointment_date: `${date} ${slot}`, available: true }
    : { ...slot, available: true });

const ClientBookAppointment = ({ onAppointmentCreated }: Props) => {
  const { data, isLoading, error } = useSWR('/services/active', fetcher);
  const services: Service[] = useMemo(() => Array.isArray(data) ? data : data?.services || [], [data]);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState<AppointmentSlot | null>(null);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [slotData, setSlotData] = useState<SlotsResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const service = useMemo(() => services.find((item) => Number(item.id) === serviceId) || null, [services, serviceId]);
  const shownService = { ...service, ...slotData?.service } as Service;
  const serviceName = slotData?.service_name || shownService?.name;
  const duration = slotData?.duration_minutes ?? shownService?.duration_minutes;

  useEffect(() => {
    if (!serviceId || !date || !isValidAppointmentDate(date)) { setSlots([]); setSlot(null); setSlotData(null); return; }
    let active = true;
    setLoadingSlots(true); setSlot(null);
    api.get<SlotsResponse>('/appointments/slots', { params: { date, service_id: serviceId } })
      .then(({ data: response }) => {
        if (!active) return;
        setSlotData(response);
        setSlots(normalizeSlots(response.available_slots, date));
      })
      .catch((requestError) => {
        if (!active) return;
        setSlots([]); setSlotData(null);
        toast.error(getApiMessage(requestError, 'No se pudieron cargar los horarios. Intenta de nuevo.'));
      })
      .finally(() => { if (active) setLoadingSlots(false); });
    return () => { active = false; };
  }, [serviceId, date]);

  const selectService = (item: Service) => {
    setServiceId(Number(item.id)); setDate(''); setSlot(null); setSlotData(null); setStep(2);
  };

  const create = async () => {
    if (!serviceId || !slot) return;
    try {
      setSaving(true);
      await api.post('/appointments', { service_id: serviceId, appointment_date: slot.appointment_date, deposit_amount: 0 });
      toast.success('Tu cita fue registrada correctamente. Recuerda que puedes reagendarla únicamente hasta 24 horas antes de la cita.', { duration: 6500 });
      setServiceId(null); setDate(''); setSlot(null); setSlots([]); setSearch(''); setStep(1);
      onAppointmentCreated?.();
    } catch (requestError) {
      toast.error(getApiMessage(requestError, 'No se pudo registrar la cita. Intenta más tarde.'));
      if ((requestError as { response?: { status?: number } }).response?.status === 409) {
        setSlot(null);
        const response = await api.get<SlotsResponse>('/appointments/slots', { params: { date, service_id: serviceId } }).catch(() => null);
        if (response) setSlots(normalizeSlots(response.data.available_slots, date));
        setStep(3);
      }
    } finally { setSaving(false); }
  };

  const filtered = services.filter((item) => `${item.name} ${item.description || ''} ${item.category || ''}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="booking-page-container">
    <div className="booking-header booking-header--wizard"><span className="section-badge">Agenda tu cita</span><h1>Reserva paso a paso</h1><p>La disponibilidad se consulta en tiempo real antes de confirmar.</p></div>
    <div className="booking-stepper booking-stepper--flow">{['Servicio', 'Día', 'Horario', 'Confirmar'].map((label, index) => <button key={label} type="button" className={`booking-step ${step >= index + 1 ? 'active' : ''} ${step > index + 1 ? 'done' : ''}`} disabled={index + 1 > step} onClick={() => setStep(index + 1)}><span>{step > index + 1 ? '✓' : index + 1}</span><strong>{label}</strong></button>)}</div>
    <div className="booking-wizard-layout">
      <section className="booking-panel booking-wizard-panel">
        {step === 1 && <><div className="booking-panel-title"><Scissors size={20}/><h2>1. Elige un servicio</h2></div><div className="booking-search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar servicio..." /></div>{isLoading && <div className="booking-message">Cargando servicios...</div>}{error && <div className="booking-message error">No se pudieron cargar los servicios.</div>}<div className="booking-service-list booking-service-list--wizard">{filtered.map((item) => <button type="button" key={item.id} className="booking-service-option" onClick={() => selectService(item)}><div><strong>{item.name}</strong><span>{item.description}</span></div><div className="booking-service-meta"><span>{item.duration_minutes} minutos</span><b>${money(item.price)}</b></div></button>)}</div></>}
        {step === 2 && <><div className="booking-panel-title"><Calendar size={20}/><h2>2. Elige el día</h2></div><div className="booking-selected-service"><strong>{serviceName}</strong><span>{duration} minutos · ${money(shownService?.price)}</span></div><AppointmentDatePicker value={date} onChange={(nextDate) => { setDate(nextDate); setStep(3); }} /><div className="booking-warning-box"><AlertCircle size={18}/><span>Las fechas pasadas y los domingos están deshabilitados. Los horarios disponibles los determina la agenda del negocio.</span></div></>}
        {step === 3 && <><div className="booking-panel-title"><Clock size={20}/><h2>3. Elige un horario</h2></div><div className="booking-selected-service"><strong>{longDate(date)}</strong><span>{serviceName}</span></div>{loadingSlots && <div className="booking-message">Consultando disponibilidad...</div>}{!loadingSlots && slots.length === 0 && <div className="booking-message">No existen horarios disponibles para este día. El negocio puede estar cerrado o la agenda completa.</div>}<div className="booking-slots-grid booking-slots-grid--wizard">{slots.map((item) => <button key={`${item.appointment_date}-${item.time}`} type="button" className={`booking-slot available ${slot?.appointment_date === item.appointment_date ? 'selected' : ''}`} onClick={() => { setSlot(item); setStep(4); }}><strong>{item.time}</strong><span>Disponible</span></button>)}</div><div className="booking-wizard-actions"><button className="booking-secondary-action" type="button" onClick={() => setStep(2)}>Cambiar día</button></div></>}
        {step === 4 && <><div className="booking-panel-title"><CheckCircle size={20}/><h2>4. Confirma tu cita</h2></div><div className="booking-confirm-details"><div><span>Servicio</span><strong>{serviceName}</strong></div><div><span>Fecha</span><strong>{longDate(date)}</strong></div><div><span>Hora</span><strong>{slot?.time}</strong></div><div><span>Duración</span><strong>{duration} minutos</strong></div><div><span>Total</span><strong>${money(shownService?.price)}</strong></div></div><div className="booking-wizard-actions"><button className="booking-secondary-action" type="button" onClick={() => setStep(3)}>Cambiar horario</button><button className="booking-confirm-button booking-confirm-button--inline" disabled={saving} onClick={create}>{saving ? 'Agendando...' : 'Confirmar cita'}</button></div></>}
      </section>
      <aside className="booking-summary-card booking-summary-card--wizard"><h2>Resumen</h2>{!service && <p className="booking-muted">Selecciona un servicio para comenzar.</p>}{service && <><div className="summary-row"><span>Servicio</span><strong>{serviceName}</strong></div><div className="summary-row"><span>Duración</span><strong>{duration} minutos</strong></div><div className="summary-row"><span>Total</span><strong>${money(shownService?.price)}</strong></div><div className="summary-row"><span>Fecha</span><strong>{longDate(date)}</strong></div><div className="summary-row"><span>Hora</span><strong>{slot?.time || 'Sin seleccionar'}</strong></div></>}</aside>
    </div>
  </div>;
};

export default ClientBookAppointment;
