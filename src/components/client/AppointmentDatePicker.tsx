import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isSunday, localDateKey } from '../../pages/client/appointmentUtils';

interface Props {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const monthLabel = (date: Date) => date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
const weekDays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const AppointmentDatePicker = ({ value, onChange, min = localDateKey(), className = '' }: Props) => {
  const initialDate = value ? new Date(`${value}T12:00:00`) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const days = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const previousMonth = () => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  const nextMonth = () => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));

  return (
    <div className={`appointment-date-picker ${className}`.trim()}>
      <div className="appointment-date-picker-toolbar">
        <button type="button" onClick={previousMonth} aria-label="Mes anterior"><ChevronLeft size={17}/></button>
        <strong>{monthLabel(visibleMonth)}</strong>
        <button type="button" onClick={nextMonth} aria-label="Mes siguiente"><ChevronRight size={17}/></button>
      </div>

      <div className="appointment-date-picker-weekdays">
        {weekDays.map((day) => <span key={day}>{day}</span>)}
      </div>

      <div className="appointment-date-picker-grid">
        {days.map((day) => {
          const key = dateKey(day);
          const outsideMonth = day.getMonth() !== visibleMonth.getMonth();
          const past = key < min;
          const sunday = isSunday(key);
          const disabled = past || sunday || outsideMonth;
          const selected = key === value;
          const today = key === localDateKey();
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              className={[
                'appointment-date-picker-day',
                outsideMonth ? 'outside' : '',
                past ? 'past' : '',
                sunday ? 'sunday' : '',
                selected ? 'selected' : '',
                today ? 'today' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onChange(key)}
              title={sunday ? 'Los domingos la estética permanece cerrada.' : past ? 'Fecha no disponible' : undefined}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      <p className="appointment-date-picker-note">Los domingos la estética permanece cerrada.</p>
    </div>
  );
};

export default AppointmentDatePicker;
