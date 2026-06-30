import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Scissors,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ClientBookAppointment from './ClientBookAppointment';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

type AppointmentView = 'list' | 'book';

interface ClientAppointmentsProps {
  initialView?: AppointmentView;
}

interface ClientAppointment {
  id: number;
  servicio: string;
  appointment_date: string;
  appointment_end?: string;
  total_amount: string | number;
  status: string;
  calendar_status?: string;
  calendar_status_label?: string;
  duration_minutes?: number;
}

const formatMoney = (value: string | number) => Number(value || 0).toFixed(2);

const formatDate = (value: string) => {
  return new Date(value).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatHour = (value: string) => {
  return new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDisplayStatus = (appointment: ClientAppointment) => {
  return appointment.calendar_status || appointment.status;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'confirmed':
      return 'Confirmada';
    case 'canceled':
    case 'cancelled':
      return 'Cancelada';
    case 'completed':
      return 'Completada';
    case 'no_show':
      return 'No asistio';
    case 'in_process':
      return 'En proceso';
    case 'pending_review':
      return 'Por cerrar';
    default:
      return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'status-confirmed';
    case 'pending':
    case 'in_process':
    case 'pending_review':
      return 'status-pending';
    case 'canceled':
    case 'cancelled':
    case 'no_show':
      return 'status-canceled';
    default:
      return 'status-completed';
  }
};

const canCancelFromClient = (appointment: ClientAppointment) => {
  const status = getDisplayStatus(appointment);

  if (!['pending', 'confirmed'].includes(status)) {
    return false;
  }

  const appointmentTime = new Date(appointment.appointment_date).getTime();
  const minimumCancelTime = Date.now() + 24 * 60 * 60 * 1000;

  return appointmentTime > minimumCancelTime;
};

const ClientAppointments = ({ initialView = 'list' }: ClientAppointmentsProps) => {
  const [view, setView] = useState<AppointmentView>(initialView);
  const { data, error, isLoading, mutate } = useSWR('/appointments/my', fetcher);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const appointments: ClientAppointment[] = Array.isArray(data)
    ? data
    : data?.appointments || [];

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort(
      (a, b) =>
        new Date(a.appointment_date).getTime() -
        new Date(b.appointment_date).getTime()
    );
  }, [appointments]);

  const upcomingAppointments = sortedAppointments.filter((appointment) => {
    const status = getDisplayStatus(appointment);
    return (
      new Date(appointment.appointment_date).getTime() >= Date.now() &&
      !['canceled', 'cancelled', 'completed', 'no_show'].includes(status)
    );
  });

  const historyAppointments = sortedAppointments
    .filter((appointment) => !upcomingAppointments.includes(appointment))
    .reverse();

  const handleCancel = async (appointment: ClientAppointment) => {
    try {
      toast.loading('Cancelando cita...', { id: 'cancelAppointment' });
      await api.patch(`/appointments/${appointment.id}/cancel`);
      toast.success('Cita cancelada correctamente.', { id: 'cancelAppointment' });
      mutate();
    } catch (cancelError: any) {
      console.error(cancelError);
      toast.error(
        cancelError.response?.data?.message ||
          'No se pudo cancelar la cita en este momento.',
        { id: 'cancelAppointment' }
      );
    }
  };

  const renderAppointmentCard = (appointment: ClientAppointment) => {
    const status = getDisplayStatus(appointment);
    const canCancel = canCancelFromClient(appointment);

    return (
      <article key={appointment.id} className="client-appointment-card">
        <div className="client-appointment-main">
          <div className="client-appointment-icon">
            <Scissors size={22} />
          </div>

          <div>
            <span className={`client-status-pill ${getStatusClass(status)}`}>
              {getStatusLabel(status)}
            </span>
            <h3>{appointment.servicio || 'Servicio General'}</h3>
            <p>{formatDate(appointment.appointment_date)}</p>
          </div>
        </div>

        <div className="client-appointment-meta">
          <span>
            <Clock size={15} />
            {formatHour(appointment.appointment_date)}
          </span>
          <strong>${formatMoney(appointment.total_amount)}</strong>
        </div>

        {canCancel ? (
          <button
            type="button"
            className="client-cancel-appointment"
            onClick={() => handleCancel(appointment)}
          >
            <XCircle size={16} />
            Cancelar cita
          </button>
        ) : (
          <span className="client-cancel-note">
            Las cancelaciones se permiten con 24 horas de anticipacion.
          </span>
        )}
      </article>
    );
  };

  return (
    <div className="client-appointments-container">
      <div className="appointments-client-header">
        <div>
          <span className="section-badge">Agenda personal</span>
          <h1>Mis Citas</h1>
          <p>Consulta tus proximas visitas, revisa tu historial y agenda nuevos servicios.</p>
        </div>

        <div className="client-appointments-tabs">
          <button
            type="button"
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            <Calendar size={16} />
            Mis citas
          </button>

          <button
            type="button"
            className={view === 'book' ? 'active' : ''}
            onClick={() => setView('book')}
          >
            <Plus size={16} />
            Agendar
          </button>
        </div>
      </div>

      {view === 'book' ? (
        <ClientBookAppointment
          onAppointmentCreated={() => {
            mutate();
            setView('list');
          }}
        />
      ) : (
        <>
          <section className="client-appointments-summary">
            <div>
              <CheckCircle2 size={24} />
              <span>Proximas citas</span>
              <strong>{upcomingAppointments.length}</strong>
            </div>
            <div>
              <History size={24} />
              <span>Historial</span>
              <strong>{historyAppointments.length}</strong>
            </div>
          </section>

          {isLoading && (
            <div className="booking-message">Cargando tus citas...</div>
          )}

          {error && (
            <div className="booking-message error">
              No se pudieron cargar tus citas.
            </div>
          )}

          {!isLoading && !error && appointments.length === 0 && (
            <div className="client-appointments-empty">
              <Calendar size={42} />
              <h2>Aun no tienes citas</h2>
              <p>Agenda tu primer servicio y quedara confirmado automaticamente.</p>
              <button type="button" onClick={() => setView('book')}>
                <Plus size={17} />
                Agendar cita
              </button>
            </div>
          )}

          {!isLoading && !error && upcomingAppointments.length > 0 && (
            <section className="client-appointments-section">
              <div className="client-section-title">
                <Calendar size={18} />
                <h2>Proximas citas</h2>
              </div>
              <div className="client-appointments-grid">
                {upcomingAppointments.map(renderAppointmentCard)}
              </div>
            </section>
          )}

          {!isLoading && !error && historyAppointments.length > 0 && (
            <section className="client-appointments-section">
              <div className="client-section-title">
                <History size={18} />
                <h2>Historial</h2>
              </div>
              <div className="client-appointments-grid">
                {historyAppointments.map(renderAppointmentCard)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ClientAppointments;
