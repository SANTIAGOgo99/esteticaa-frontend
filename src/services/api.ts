import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Este interceptor pega automáticamente tu Token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const appointmentStatusLabels: Record<string, string> = {
  in_process: 'En proceso',
  pending_review: 'Pendiente de cierre',
};

const normalizeMyAppointmentsResponse = (response: any) => {
  const url = String(response?.config?.url || '');
  if (!url.includes('/appointments/my')) return response;

  const data = response?.data;
  const appointments = Array.isArray(data)
    ? data
    : (Array.isArray(data?.appointments) ? data.appointments : []);

  appointments.forEach((appointment: any) => {
    if (appointment?.appointment_local) {
      appointment.appointment_date = String(appointment.appointment_local).replace(' ', 'T');
    }

    const status = String(appointment?.calendar_status || '');
    if (appointmentStatusLabels[status]) {
      appointment.calendar_status_code = status;
      appointment.calendar_status = appointmentStatusLabels[status];
    }
  });

  return response;
};

api.interceptors.response.use(
  (response) => normalizeMyAppointmentsResponse(response),
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
