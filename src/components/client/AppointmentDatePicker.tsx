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
      <style>{`
        .appointment-date-picker{border:1px solid #e4d7c6;border-radius:18px;padding:14px;background:#fffdf9;max-width:420px}
        .appointment-date-picker-toolbar{display:grid;grid-template-columns:40px 1fr 40px;align-items:center;gap:8px;margin-bottom:10px}
        .appointment-date-picker-toolbar strong{text-align:center;text-transform:capitalize;color:#2c241a}
        .appointment-date-picker-toolbar button{width:36px;height:36px;border:1px solid #e4d7c6;border-radius:10px;background:#fff;display:grid;place-items:center;cursor:pointer;color:#5e4b3a}
        .appointment-date-picker-weekdays,.appointment-date-picker-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
        .appointment-date-picker-weekdays span{text-align:center;font-size:.72rem;font-weight:800;color:#8b735f;padding:4px 0}
        .appointment-date-picker-day{aspect-ratio:1;border:1px solid transparent;border-radius:10px;background:#fff;color:#2c241a;font-weight:700;cursor:pointer;transition:.15s ease}
        .appointment-date-picker-day:hover:not(:disabled){border-color:#c9a87c;background:#fff8ec}
        .appointment-date-picker-day.today{border-color:#b8860b}
        .appointment-date-picker-day.selected{background:#2c241a;color:#fff;border-color:#2c241a}
        .appointment-date-picker-day:disabled{cursor:not-allowed}
        .appointment-date-picker-day.past,.appointment-date-picker-day.outside{opacity:.18;background:#f4efe8;color:#9b8b7b}
        .appointment-date-picker-day.sunday{opacity:.38;background:#eee7df;color:#9b8b7b;text-decoration:line-through}
        .appointment-date-picker-note{margin:10px 0 0;font-size:.75rem;color:#8b5e3c}
      `}</style>
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
