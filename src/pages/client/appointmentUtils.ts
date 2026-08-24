export interface AppointmentSlot {
  time: string;
  appointment_date: string;
  appointment_end?: string;
  available?: boolean;
  reason?: string;
}

export const getApiMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: unknown; reschedule_reason?: unknown } } }).response;
    if (typeof response?.data?.message === 'string') return response.data.message;
    if (typeof response?.data?.reschedule_reason === 'string') return response.data.reschedule_reason;
  }
  return fallback;
};

export const localDateKey = (value = new Date()) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

export const isValidAppointmentDate = (date: string) =>
  Boolean(date) && date >= localDateKey() && new Date(`${date}T12:00:00`).getDay() !== 0;
