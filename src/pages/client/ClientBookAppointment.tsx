// src/pages/client/ClientBookAppointment.tsx
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Scissors,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface Servicio {
  id: number;
  name: string;
  description: string;
  price: string | number;
  duration_minutes: number;
  category?: string;
  is_active?: boolean;
}

interface Slot {
  time: string;
  appointment_date: string;
  appointment_end: string;
  available: boolean;
  conflicts?: number;
  reason: string;
}

interface AvailabilityDay {
  date: string;
  status: 'available' | 'limited' | 'full' | 'closed' | 'past';
  label: string;
  available_slots: number;
  total_slots: number;
}

interface ClientBookAppointmentProps {
  onAppointmentCreated?: () => void;
}

const formatMoney = (value: string | number) => Number(value).toFixed(2);

const getMonthKey = (date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getDateKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getCalendarDays = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
};

const getMonthLabel = (monthKey: string) => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
};

const formatLongDate = (dateKey: string) => {
  if (!dateKey) return 'Sin seleccionar';

  return new Date(`${dateKey}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const ClientBookAppointment = ({ onAppointmentCreated }: ClientBookAppointmentProps) => {
  const { data: servicios, isLoading, error } = useSWR('/services/active', fetcher);

  const [activeStep, setActiveStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const serviciosArray: Servicio[] = Array.isArray(servicios) ? servicios : [];

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return serviciosArray.find((servicio) => Number(servicio.id) === Number(selectedServiceId)) || null;
  }, [selectedServiceId, serviciosArray]);

  const calendarKey = selectedService
    ? `/appointments/availability-calendar?service_id=${selectedService.id}&month=${selectedMonth}`
    : null;

  const { data: availabilityCalendar, isLoading: loadingCalendar } = useSWR(calendarKey, fetcher);

  const availabilityByDate: Record<string, AvailabilityDay> = useMemo(() => {
    const days: AvailabilityDay[] = availabilityCalendar?.days || [];
    return days.reduce((acc, day) => {
      acc[day.date] = day;
      return acc;
    }, {} as Record<string, AvailabilityDay>);
  }, [availabilityCalendar]);

  const calendarDays = useMemo(() => getCalendarDays(selectedMonth), [selectedMonth]);

  const filteredServices = serviciosArray.filter((servicio) =>
    servicio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    servicio.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedService || !selectedDate) {
        setSlots([]);
        setSelectedSlot(null);
        return;
      }

      try {
        setLoadingSlots(true);
        setSelectedSlot(null);

        const res = await api.get('/appointments/slots', {
          params: {
            date: selectedDate,
            service_id: selectedService.id,
          },
        });

        setSlots(res.data.all_slots || []);
      } catch (slotError: any) {
        console.error(slotError);
        toast.error(
          slotError.response?.data?.message ||
          'No se pudieron cargar los horarios.'
        );
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedService, selectedDate]);

  const canOpenStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return Boolean(selectedService);
    if (step === 3) return Boolean(selectedDate);
    if (step === 4) return Boolean(selectedSlot);
    return false;
  };

  const handleSelectService = (servicio: Servicio) => {
    setSelectedServiceId(Number(servicio.id));
    setSelectedMonth(getMonthKey());
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
    setActiveStep(2);
  };

  const handleSelectCalendarDay = (dateKey: string, dayInfo?: AvailabilityDay) => {
    if (!selectedService || !dayInfo) return;
    if (!['available', 'limited'].includes(dayInfo.status)) return;

    setSelectedDate(dateKey);
    setSelectedSlot(null);
    setActiveStep(3);
  };

  const handleSelectSlot = (slot: Slot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    setActiveStep(4);
  };

  const moveMonth = (direction: 'previous' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month - 1, 1);
    nextDate.setMonth(nextDate.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(getMonthKey(nextDate));
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const handleCreateAppointment = async () => {
    if (!selectedService || !selectedSlot) {
      toast.error('Selecciona un servicio, fecha y horario.');
      return;
    }

    try {
      setSaving(true);

      await api.post('/appointments', {
        service_id: selectedService.id,
        appointment_date: selectedSlot.appointment_date,
        deposit_amount: 0,
      });

      toast.success('Cita confirmada automaticamente.');

      setSelectedServiceId(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setSlots([]);
      setSearchTerm('');
      setActiveStep(1);
      onAppointmentCreated?.();
    } catch (createError: any) {
      console.error(createError);
      toast.error(
        createError.response?.data?.message ||
        'No se pudo registrar la cita.'
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    if (activeStep === 1) {
      return (
        <section className="booking-panel booking-wizard-panel">
          <div className="booking-panel-title">
            <Scissors size={20} />
            <h2>1. Elige un servicio</h2>
          </div>

          <div className="booking-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          {isLoading && <div className="booking-message">Cargando servicios...</div>}

          {error && (
            <div className="booking-message error">
              Error al cargar servicios.
            </div>
          )}

          <div className="booking-service-list booking-service-list--wizard">
            {filteredServices.map((servicio) => (
              <button
                type="button"
                key={servicio.id}
                className={`booking-service-option ${
                  selectedServiceId === Number(servicio.id) ? 'selected' : ''
                }`}
                onClick={() => handleSelectService(servicio)}
              >
                <div>
                  <strong>{servicio.name}</strong>
                  <span>{servicio.description}</span>
                </div>

                <div className="booking-service-meta">
                  <span>{servicio.duration_minutes} minutos</span>
                  <b>${formatMoney(servicio.price)}</b>
                </div>
              </button>
            ))}
          </div>
        </section>
      );
    }

    if (activeStep === 2) {
      return (
        <section className="booking-panel booking-wizard-panel">
          <div className="booking-panel-title">
            <Calendar size={20} />
            <h2>2. Elige el dia</h2>
          </div>

          <div className="booking-selected-service">
            <strong>{selectedService?.name}</strong>
            <span>
              Duracion: {selectedService?.duration_minutes} min · Total: $
              {selectedService ? formatMoney(selectedService.price) : '0.00'}
            </span>
          </div>

          <div className="booking-availability-calendar">
            <div className="booking-calendar-toolbar">
              <button
                type="button"
                onClick={() => moveMonth('previous')}
                aria-label="Mes anterior"
              >
                <ChevronLeft size={17} />
              </button>
              <strong>{getMonthLabel(selectedMonth)}</strong>
              <button
                type="button"
                onClick={() => moveMonth('next')}
                aria-label="Mes siguiente"
              >
                <ChevronRight size={17} />
              </button>
            </div>

            <div className="booking-calendar-legend">
              <span className="legend-available">Disponible</span>
              <span className="legend-limited">Pocos espacios</span>
              <span className="legend-full">Saturado</span>
              <span className="legend-closed">Cerrado</span>
            </div>

            <div className="booking-calendar-weekdays">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>

            {loadingCalendar ? (
              <div className="booking-calendar-loading">
                <Clock size={18} />
                Calculando disponibilidad...
              </div>
            ) : (
              <div className="booking-calendar-grid">
                {calendarDays.map((date) => {
                  const dateKey = getDateKey(date);
                  const dayInfo = availabilityByDate[dateKey];
                  const isCurrentMonth = dateKey.startsWith(selectedMonth);
                  const isSelected = selectedDate === dateKey;
                  const status = dayInfo?.status || 'closed';
                  const isSelectable = ['available', 'limited'].includes(status);

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      className={[
                        'booking-calendar-day',
                        `day-${status}`,
                        !isCurrentMonth ? 'muted' : '',
                        isSelected ? 'selected' : '',
                      ].join(' ')}
                      disabled={!isSelectable}
                      onClick={() => handleSelectCalendarDay(dateKey, dayInfo)}
                      title={dayInfo?.label || 'Sin disponibilidad'}
                    >
                      <strong>{date.getDate()}</strong>
                      {dayInfo && isCurrentMonth && <small>{dayInfo.available_slots}</small>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="booking-wizard-actions">
            <button type="button" className="booking-secondary-action" onClick={() => setActiveStep(1)}>
              Cambiar servicio
            </button>
          </div>
        </section>
      );
    }

    if (activeStep === 3) {
      return (
        <section className="booking-panel booking-wizard-panel">
          <div className="booking-panel-title">
            <Clock size={20} />
            <h2>3. Elige un horario</h2>
          </div>

          <div className="booking-selected-service">
            <strong>{formatLongDate(selectedDate)}</strong>
            <span>{selectedService?.name}</span>
          </div>

          {loadingSlots && <div className="booking-message">Cargando horarios...</div>}

          {!loadingSlots && slots.length === 0 && (
            <div className="booking-message">
              No hay horarios disponibles para este dia.
            </div>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="booking-slots-grid booking-slots-grid--wizard">
              {slots.map((slot) => (
                <button
                  key={slot.appointment_date}
                  type="button"
                  className={`booking-slot ${
                    slot.available ? 'available' : 'unavailable'
                  } ${
                    selectedSlot?.appointment_date === slot.appointment_date ? 'selected' : ''
                  }`}
                  disabled={!slot.available}
                  onClick={() => handleSelectSlot(slot)}
                  title={slot.reason}
                >
                  <strong>{slot.time}</strong>
                  <span>{slot.available ? 'Disponible' : 'Ocupado'}</span>
                </button>
              ))}
            </div>
          )}

          <div className="booking-wizard-actions">
            <button type="button" className="booking-secondary-action" onClick={() => setActiveStep(2)}>
              Cambiar dia
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="booking-panel booking-wizard-panel booking-confirm-panel">
        <div className="booking-panel-title">
          <CheckCircle size={20} />
          <h2>4. Confirma tu cita</h2>
        </div>

        <div className="booking-confirm-hero">
          <CheckCircle size={34} />
          <h3>Tu cita quedara confirmada al momento</h3>
          <p>
            Revisa los datos antes de agendar. Si todo esta correcto, confirma
            tu cita y quedara guardada en Mis Citas.
          </p>
        </div>

        <div className="booking-confirm-details">
          <div>
            <span>Servicio</span>
            <strong>{selectedService?.name}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>{formatLongDate(selectedDate)}</strong>
          </div>
          <div>
            <span>Hora</span>
            <strong>{selectedSlot?.time || 'Sin seleccionar'}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>${selectedService ? formatMoney(selectedService.price) : '0.00'}</strong>
          </div>
        </div>

        <div className="booking-wizard-actions">
          <button type="button" className="booking-secondary-action" onClick={() => setActiveStep(3)}>
            Cambiar horario
          </button>
          <button
            type="button"
            className="booking-confirm-button booking-confirm-button--inline"
            disabled={!selectedSlot || saving}
            onClick={handleCreateAppointment}
          >
            {saving ? 'Agendando...' : 'Confirmar cita'}
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="booking-page-container">
      <div className="booking-header booking-header--wizard">
        <div>
          <span className="section-badge">Agenda tu cita</span>
          <h1>Reserva paso a paso</h1>
          <p>
            Elige tu servicio, revisa dias disponibles, selecciona horario y
            confirma tu cita automaticamente.
          </p>
        </div>
      </div>

      <div className="booking-stepper booking-stepper--flow">
        {[
          { step: 1, label: 'Servicio' },
          { step: 2, label: 'Dia' },
          { step: 3, label: 'Horario' },
          { step: 4, label: 'Confirmar' },
        ].map((item) => (
          <button
            key={item.step}
            type="button"
            className={`booking-step ${activeStep >= item.step ? 'active' : ''} ${
              activeStep > item.step ? 'done' : ''
            }`}
            disabled={!canOpenStep(item.step)}
            onClick={() => setActiveStep(item.step)}
          >
            <span>{activeStep > item.step ? '✓' : item.step}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>

      <div className="booking-wizard-layout">
        {renderStepContent()}

        <aside className="booking-summary-card booking-summary-card--wizard">
          <h2>Resumen</h2>

          {!selectedService && (
            <p className="booking-muted">Selecciona un servicio para comenzar.</p>
          )}

          {selectedService && (
            <>
              <div className="summary-row">
                <span>Servicio</span>
                <strong>{selectedService.name}</strong>
              </div>

              <div className="summary-row">
                <span>Duracion</span>
                <strong>{selectedService.duration_minutes} minutos</strong>
              </div>

              <div className="summary-row">
                <span>Total</span>
                <strong>${formatMoney(selectedService.price)}</strong>
              </div>

              <div className="summary-row">
                <span>Fecha</span>
                <strong>{selectedDate ? formatLongDate(selectedDate) : 'Sin seleccionar'}</strong>
              </div>

              <div className="summary-row">
                <span>Hora de inicio</span>
                <strong>{selectedSlot?.time || 'Sin seleccionar'}</strong>
              </div>

              <div className="summary-row">
                <span>Hora de termino</span>
                <strong>
                  {selectedSlot
                    ? selectedSlot.appointment_end.substring(11, 16)
                    : 'Sin seleccionar'}
                </strong>
              </div>

              {selectedSlot ? (
                <div className="booking-success-box">
                  <CheckCircle size={18} />
                  <span>
                    Tu cita quedara confirmada automaticamente al presionar
                    confirmar.
                  </span>
                </div>
              ) : (
                <div className="booking-warning-box">
                  <AlertCircle size={18} />
                  <span>
                    Avanza por los pasos para completar servicio, dia y horario.
                  </span>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ClientBookAppointment;
