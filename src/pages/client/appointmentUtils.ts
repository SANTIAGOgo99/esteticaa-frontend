export interface AppointmentSlot {
  time: string;
  appointment_date: string;
  appointment_end?: string;
  available?: boolean;
  reason?: string;
}

const BUSINESS_TIME_ZONE = 'America/Mexico_City';

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

const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?/;

const formatLocalParts = (value: string) => {
  const match = LOCAL_DATE_TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
};

const formatClock = (hour: number, minute: number) => {
  const suffix = hour >= 12 ? 'p. m.' : 'a. m.';
  const twelveHour = hour % 12 || 12;
  return `${String(twelveHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
};

export const appointmentDateLabel = (appointmentLocal?: string, appointmentDate?: string) => {
  const localParts = appointmentLocal ? formatLocalParts(appointmentLocal) : null;
  if (localParts) {
    const safeDate = new Date(Date.UTC(localParts.year, localParts.month - 1, localParts.day, 12));
    return safeDate.toLocaleDateString('es-MX', {
      timeZone: 'UTC',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  if (!appointmentDate) return 'Fecha no disponible';
  const parsed = new Date(appointmentDate);
  if (Number.isNaN(parsed.getTime())) return appointmentDate;
  return parsed.toLocaleDateString('es-MX', {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const appointmentHourLabel = (appointmentLocal?: string, appointmentDate?: string) => {
  const localParts = appointmentLocal ? formatLocalParts(appointmentLocal) : null;
  if (localParts) return formatClock(localParts.hour, localParts.minute);
  if (!appointmentDate) return 'Hora no disponible';
  const parsed = new Date(appointmentDate);
  if (Number.isNaN(parsed.getTime())) return appointmentDate;
  return parsed.toLocaleTimeString('es-MX', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const rescheduleDeadlineLabel = (value?: string | null) => {
  if (!value) return null;
  const localParts = formatLocalParts(value);
  const hasExplicitZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());
  if (localParts && !hasExplicitZone) {
    const safeDate = new Date(Date.UTC(localParts.year, localParts.month - 1, localParts.day, 12));
    const date = safeDate.toLocaleDateString('es-MX', {
      timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric',
    });
    return `${date}, ${formatClock(localParts.hour, localParts.minute)}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('es-MX', {
    timeZone: BUSINESS_TIME_ZONE,
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const appointmentRemainingLabel = (hours?: number, minutes?: number, isPast = false) => {
  if (isPast) return 'La cita ya pasó';
  if (hours == null && minutes == null) return null;
  const totalMinutes = Math.max(0, Number.isFinite(minutes as number) ? Number(minutes) : Number(hours || 0) * 60);
  if (totalMinutes <= 0) return 'La cita es hoy';
  const days = Math.floor(totalMinutes / 1440);
  const remainder = totalMinutes % 1440;
  const remainingHours = Math.floor(remainder / 60);
  const remainingMinutes = remainder % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'día' : 'días'}`);
  if (remainingHours > 0) parts.push(`${remainingHours} ${remainingHours === 1 ? 'hora' : 'horas'}`);
  if (days === 0 && remainingMinutes > 0) parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minuto' : 'minutos'}`);
  return parts.length ? `Faltan ${parts.join(' y ')}` : 'La cita es hoy';
};

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
