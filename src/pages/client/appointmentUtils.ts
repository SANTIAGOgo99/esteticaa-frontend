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
    if (typeof response?.data?.reschedule_reason === 'string') return response.data.reschedule_reason;
    if (typeof response?.data?.message === 'string') return response.data.message;
  }
  return fallback;
};

export const localDateKey = (value = new Date()) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

export const isSunday = (date: string) =>
  Boolean(date) && new Date(`${date}T12:00:00`).getDay() === 0;

export const isValidAppointmentDate = (date: string) =>
  Boolean(date) && date >= localDateKey() && !isSunday(date);

const toTwentyFourHourTime = (time: string) => {
  const value = time.trim();
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]) % 12;
    if (twelveHourMatch[3].toUpperCase() === 'PM') hour += 12;
    return `${String(hour).padStart(2, '0')}:${twelveHourMatch[2]}:00`;
  }
  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    return `${twentyFourHourMatch[1].padStart(2, '0')}:${twentyFourHourMatch[2]}:${twentyFourHourMatch[3] || '00'}`;
  }
  return value;
};

export const appointmentDateForRequest = (date: string, slot: AppointmentSlot) => {
  if (slot.appointment_date) return slot.appointment_date;
  return `${date} ${toTwentyFourHourTime(slot.time)}`;
};
