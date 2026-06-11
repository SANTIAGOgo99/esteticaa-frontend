// src/pages/admin/AdminDashboard.tsx
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import {
  Users, ShoppingBag, Scissors, Calendar,
  Loader2, Plus, ArrowRight
} from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import api from '../../services/api';
import './AdminDashboard.css';

const fetcher = (url: string) => api.get(url).then(res => res.data);

const ACTIVITY = [
  { color: 'blue',   action: 'Karla Reyes',   detail: 'agendó una cita — Keratina Premium',     time: 'Hace 8 min',  chip: 'Cita',        chipColor: 'blue'   },
  { color: 'teal',   action: 'Venta',         detail: 'completada · Oil Reflections Serum × 2', time: 'Hace 24 min', chip: 'Venta',       chipColor: 'teal'   },
  { color: 'red',    action: 'Daniela M.',    detail: 'canceló su cita de Balayage',            time: 'Hace 1 h',   chip: 'Cancelación',  chipColor: 'red'    },
  { color: 'violet', action: 'Nuevo cliente', detail: '— Sofía Torres registrada',              time: 'Hace 2 h',   chip: 'Cliente',      chipColor: 'violet' },
  { color: 'teal',   action: 'Hidratación',   detail: 'Profunda marcado como completado',        time: 'Hace 3 h',   chip: 'Completado',   chipColor: 'teal'   },
];

const QUICK_ACTIONS = [
  { to: '/admin/citas',     color: 'blue',   label: 'Nueva cita',      sub: 'Agendar ahora'  },
  { to: '/admin/productos', color: 'teal',   label: 'Agregar producto',sub: 'Inventario'     },
  { to: '/admin/servicios', color: 'violet', label: 'Nuevo servicio',  sub: 'Catálogo'       },
  { to: '/admin/respaldos', color: 'red',    label: 'Respaldo BD',     sub: 'Exportar datos' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useSWR('/dashboard/summary', fetcher);
  const s = stats || { usuarios: 0, productos: 0, servicios: 0, citas: 0 };
  const fmt = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="dash-container">
      <Breadcrumbs />

      {/* ── Page header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Resumen general</h1>
          <p className="dash-subtitle">Vista rápida del estado actual de tu negocio.</p>
        </div>
        <button className="dash-new-btn" onClick={() => navigate('/admin/citas')}>
          <Plus size={16} />
          Nueva cita
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="kpi-grid">
        <div className="kpi blue" onClick={() => navigate('/admin/usuarios')}>
          <div className="kpi-top">
            <div className="kpi-icon blue"><Users size={20} strokeWidth={2} /></div>
            <span className="kpi-tag blue">+12%</span>
          </div>
          <div className="kpi-num">{isLoading ? '—' : fmt(s.usuarios)}</div>
          <div className="kpi-label">Usuarios totales</div>
          <div className="kpi-footer">
            <span className="kpi-cta">Ver todos</span>
            <ArrowRight size={14} className="kpi-arr" />
          </div>
        </div>

        <div className="kpi teal" onClick={() => navigate('/admin/productos')}>
          <div className="kpi-top">
            <div className="kpi-icon teal"><ShoppingBag size={20} strokeWidth={2} /></div>
            <span className="kpi-tag teal">88% stock</span>
          </div>
          <div className="kpi-num">{isLoading ? '—' : fmt(s.productos)}</div>
          <div className="kpi-label">Productos activos</div>
          <div className="kpi-footer">
            <span className="kpi-cta">Inventario</span>
            <ArrowRight size={14} className="kpi-arr" />
          </div>
        </div>

        <div className="kpi violet" onClick={() => navigate('/admin/servicios')}>
          <div className="kpi-top">
            <div className="kpi-icon violet"><Scissors size={20} strokeWidth={2} /></div>
            <span className="kpi-tag violet">Activos</span>
          </div>
          <div className="kpi-num">{isLoading ? '—' : fmt(s.servicios)}</div>
          <div className="kpi-label">Servicios en catálogo</div>
          <div className="kpi-footer">
            <span className="kpi-cta">Gestionar</span>
            <ArrowRight size={14} className="kpi-arr" />
          </div>
        </div>

        <div className="kpi amber" onClick={() => navigate('/admin/citas')}>
          <div className="kpi-top">
            <div className="kpi-icon amber"><Calendar size={20} strokeWidth={2} /></div>
            <span className="kpi-tag amber">Hoy: {isLoading ? '—' : s.citas}</span>
          </div>
          <div className="kpi-num">{isLoading ? '—' : fmt(s.citas)}</div>
          <div className="kpi-label">Citas registradas</div>
          <div className="kpi-footer">
            <span className="kpi-cta">Ver agenda</span>
            <ArrowRight size={14} className="kpi-arr" />
          </div>
        </div>
      </div>

      {/* ── Row 2: Feed + Quick actions ── */}
      <div className="dash-row2">

        {/* Activity feed */}
        <div className="feed-card">
          <div className="feed-header">
            <div className="feed-header-left">
              <span className="feed-title">Actividad reciente</span>
              <span className="feed-live">En vivo</span>
            </div>
            <div className="feed-filters">
              <button className="ff active">Todo</button>
              <button className="ff">Citas</button>
              <button className="ff">Ventas</button>
            </div>
          </div>

          {isLoading ? (
            <div className="feed-loading">
              <Loader2 size={18} className="feed-spinner" />
              <span>Cargando actividad…</span>
            </div>
          ) : (
            <div className="feed">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="fi" style={{ animationDelay: `${.18 + i * .07}s` }}>
                  <div className="fi-line">
                    <div className={`fi-dot ${item.color}`} />
                    {i < ACTIVITY.length - 1 && <div className="fi-conn" />}
                  </div>
                  <div className="fi-body">
                    <p className="fi-action">
                      <strong>{item.action}</strong> {item.detail}
                    </p>
                    <div className="fi-meta">
                      <span className="fi-time">{item.time}</span>
                      <span className={`fi-chip ${item.chipColor}`}>{item.chip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="qa-card">
          <span className="qa-title">Acciones rápidas</span>

          {QUICK_ACTIONS.map(({ to, color, label, sub }) => (
            <div
              key={to}
              className={`qa-item ${color}`}
              onClick={() => navigate(to)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(to)}
            >
              <div className={`qa-icon ${color}`}>
                <ArrowRight size={16} style={{ transform: 'rotate(-45deg)' }} />
              </div>
              <div className="qa-text">
                <span className="qa-label">{label}</span>
                <span className="qa-sub">{sub}</span>
              </div>
              <span className="qa-arr">→</span>
            </div>
          ))}

          <div className="qa-status">
            <div className="qa-status-dot" />
            <div>
              <div className="qa-status-label">Sistema activo</div>
              <div className="qa-status-sub">Última sync: hace 2 min</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;