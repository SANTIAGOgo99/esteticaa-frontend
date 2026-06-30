import { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';

interface Servicio {
  id: number;
  name: string;
  description: string;
  price: string | number;
  duration_minutes: number;
  image_url?: string;
  category?: string;
}

interface Slot {
  time: string;
  appointment_date: string;
  available: boolean;
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Servicio | null;
  onConfirm: (fecha: string, hora: string) => Promise<void>;
}

const AppointmentModal = ({
  isOpen,
  onClose,
  service,
  onConfirm,
}: AppointmentModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedHour('');
      setSlots([]);
      setMessage('');
      setConfirming(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !service) return;

      try {
        setLoadingSlots(true);
        setSelectedHour('');
        setMessage('');

        const res = await api.get('/appointments/slots', {
          params: {
            date: selectedDate,
            service_id: service.id,
          },
        });

        const availableSlots = res.data.available_slots || [];
        setSlots(availableSlots);

        if (availableSlots.length === 0) {
          setMessage(
            res.data.message || 'No hay horarios disponibles para este día.'
          );
        }
      } catch (error: any) {
        console.error(error);

        const mensaje =
          error.response?.data?.message ||
          'No se pudieron cargar los horarios disponibles.';

        setSlots([]);
        setMessage(mensaje);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, service]);

  if (!isOpen || !service) return null;

  const handleConfirm = async () => {
    if (!selectedDate || !selectedHour) {
      setMessage('Selecciona una fecha y un horario para continuar.');
      return;
    }

    try {
      setConfirming(true);
      setMessage('');

      await onConfirm(selectedDate, selectedHour);
    } catch (error: any) {
      console.error(error);

      const mensaje =
        error.response?.data?.message ||
        'No se pudo agendar la cita. Intenta de nuevo.';

      setMessage(mensaje);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="appointment-modal-overlay">
      <div className="appointment-modal">
        <button className="appointment-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="appointment-modal-header">
          <span className="section-badge">Reservar cita</span>
          <h2>{service.name}</h2>
          <p>{service.description}</p>
        </div>

        <div className="appointment-summary">
          <div>
            <Clock size={16} />
            <span>{service.duration_minutes} min</span>
          </div>

          <div>
            <CheckCircle size={16} />
            <span>${Number(service.price).toFixed(2)}</span>
          </div>
        </div>

        <div className="appointment-field">
          <label>
            <Calendar size={16} />
            Selecciona el día
          </label>

          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {selectedDate && (
          <div className="appointment-field">
            <label>
              <Clock size={16} />
              Horarios disponibles
            </label>

            {loadingSlots ? (
              <div className="slots-loading">Cargando horarios...</div>
            ) : slots.length > 0 ? (
              <div className="slots-grid">
                {slots.map((slot) => (
                  <button
                    key={slot.appointment_date}
                    className={`slot-button ${
                      selectedHour === slot.time ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedHour(slot.time)}
                    type="button"
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="appointment-alert">
                <AlertCircle size={16} />
                <span>{message || 'No hay horarios disponibles.'}</span>
              </div>
            )}
          </div>
        )}

        {selectedDate && selectedHour && (
          <div className="appointment-confirm-box">
            <strong>Resumen de tu cita</strong>
            <p>Servicio: {service.name}</p>
            <p>Fecha: {selectedDate}</p>
            <p>Hora: {selectedHour}</p>
            <p>Duración: {service.duration_minutes} minutos</p>
            <p>Total aproximado: ${Number(service.price).toFixed(2)}</p>
            <p>La cita quedara confirmada automaticamente al agendar.</p>
          </div>
        )}

        {message && slots.length > 0 && (
          <div className="appointment-alert">
            <AlertCircle size={16} />
            <span>{message}</span>
          </div>
        )}

        <div className="appointment-actions">
          <button className="appointment-secondary-btn" onClick={onClose}>
            Cancelar
          </button>

          <button
            className="appointment-primary-btn"
            onClick={handleConfirm}
            disabled={!selectedDate || !selectedHour || confirming}
          >
            {confirming ? 'Agendando...' : 'Agendar cita'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
