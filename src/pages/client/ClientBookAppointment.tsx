// src/pages/client/ClientBookAppointment.tsx
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Scissors,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

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

const formatMoney = (value: string | number) => {
  return Number(value).toFixed(2);
};

const ClientBookAppointment = () => {
  const { data: servicios, isLoading, error } = useSWR('/services/active', fetcher);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const serviciosArray: Servicio[] = Array.isArray(servicios) ? servicios : [];

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return serviciosArray.find((servicio) => Number(servicio.id) === Number(selectedServiceId)) || null;
  }, [selectedServiceId, serviciosArray]);

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
      } catch (error: any) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
          'No se pudieron cargar los horarios.'
        );
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedService, selectedDate]);

  const handleSelectService = (servicio: Servicio) => {
    setSelectedServiceId(Number(servicio.id));
    setSelectedDate('');
    setSelectedSlot(null);
    setSlots([]);
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

      toast.success('Cita registrada correctamente.');

      setSelectedServiceId(null);
      setSelectedDate('');
      setSelectedSlot(null);
      setSlots([]);
      setSearchTerm('');
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        'No se pudo registrar la cita.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="booking-page-container">
      <div className="booking-header">
        <div>
          <span className="section-badge">Agenda tu cita</span>
          <h1>Selecciona servicio, día y horario</h1>
          <p>
            El sistema bloquea automáticamente los horarios ocupados tomando en cuenta la duración real del servicio.
          </p>
        </div>
      </div>

      <div className="booking-layout">
        {/* COLUMNA 1: SERVICIOS */}
        <section className="booking-panel">
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading && (
            <div className="booking-message">Cargando servicios...</div>
          )}

          {error && (
            <div className="booking-message error">
              Error al cargar servicios.
            </div>
          )}

          <div className="booking-service-list">
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

        {/* COLUMNA 2: FECHA Y HORARIOS */}
        <section className="booking-panel">
          <div className="booking-panel-title">
            <Calendar size={20} />
            <h2>2. Elige el día</h2>
          </div>

          <input
            className="booking-date-input"
            type="date"
            min={today}
            value={selectedDate}
            disabled={!selectedService}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
            }}
          />

          {!selectedService && (
            <div className="booking-info-box">
              Primero selecciona un servicio para ver horarios.
            </div>
          )}

          {selectedService && (
            <div className="booking-selected-service">
              <strong>{selectedService.name}</strong>
              <span>
                Duración: {selectedService.duration_minutes} min · Total: $
                {formatMoney(selectedService.price)}
              </span>
            </div>
          )}

          <div className="booking-panel-title booking-space">
            <Clock size={20} />
            <h2>3. Horarios del día</h2>
          </div>

          {!selectedDate && selectedService && (
            <div className="booking-message">
              Selecciona un día para consultar horarios.
            </div>
          )}

          {loadingSlots && (
            <div className="booking-message">Cargando horarios...</div>
          )}

          {!loadingSlots && selectedDate && slots.length === 0 && (
            <div className="booking-message">
              No hay horarios disponibles para este día.
            </div>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="booking-slots-grid">
              {slots.map((slot) => (
                <button
                  key={slot.appointment_date}
                  type="button"
                  className={`booking-slot ${
                    slot.available ? 'available' : 'unavailable'
                  } ${
                    selectedSlot?.appointment_date === slot.appointment_date
                      ? 'selected'
                      : ''
                  }`}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot)}
                  title={slot.reason}
                >
                  <strong>{slot.time}</strong>
                  <span>{slot.available ? 'Disponible' : 'Ocupado'}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA 3: RESUMEN */}
        <aside className="booking-summary-card">
          <h2>Resumen</h2>

          {!selectedService && (
            <p className="booking-muted">
              Selecciona un servicio para comenzar.
            </p>
          )}

          {selectedService && (
            <>
              <div className="summary-row">
                <span>Servicio</span>
                <strong>{selectedService.name}</strong>
              </div>

              <div className="summary-row">
                <span>Duración</span>
                <strong>{selectedService.duration_minutes} minutos</strong>
              </div>

              <div className="summary-row">
                <span>Total</span>
                <strong>${formatMoney(selectedService.price)}</strong>
              </div>

              <div className="summary-row">
                <span>Fecha</span>
                <strong>{selectedDate || 'Sin seleccionar'}</strong>
              </div>

              <div className="summary-row">
                <span>Hora de inicio</span>
                <strong>{selectedSlot?.time || 'Sin seleccionar'}</strong>
              </div>

              <div className="summary-row">
                <span>Hora de término</span>
                <strong>
                  {selectedSlot
                    ? selectedSlot.appointment_end.substring(11, 16)
                    : 'Sin seleccionar'}
                </strong>
              </div>

              {selectedSlot && (
                <div className="booking-success-box">
                  <CheckCircle size={18} />
                  <span>
                    Tu cita iniciaría a las {selectedSlot.time} y terminaría aproximadamente a las{' '}
                    {selectedSlot.appointment_end.substring(11, 16)}.
                  </span>
                </div>
              )}

              <div className="booking-warning-box">
                <AlertCircle size={18} />
                <span>
                  Los horarios en rojo no están disponibles porque se cruzan con otras citas
                  o porque el servicio no cabe antes del cierre.
                </span>
              </div>

              <button
                className="booking-confirm-button"
                disabled={!selectedSlot || saving}
                onClick={handleCreateAppointment}
              >
                {saving ? 'Agendando...' : 'Confirmar cita'}
              </button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ClientBookAppointment;