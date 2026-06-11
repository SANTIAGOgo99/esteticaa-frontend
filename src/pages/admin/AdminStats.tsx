// src/pages/admin/AdminStats.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Activity,  Server, Loader2, RefreshCw, AlertTriangle,
  HardDrive, Table2, Clock, Zap,
  LayoutDashboard, BarChart2, Wifi, ChevronUp, ChevronDown, Minus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import api from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AdminStats.css';

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  emerald: '#00c48c', emeraldL: '#e6f9f4',
  blue:    '#4c6ef5', blueL:    '#eef1ff',
  amber:   '#f59f00', amberL:   '#fff9db',
  rose:    '#f03e3e', roseL:    '#fff5f5',
  violet:  '#7c3aed', violetL:  '#f3f0ff',
  slate:   '#495057',
};

const CHART_COLORS = ['#4c6ef5', '#00c48c', '#f59f00', '#f03e3e'];
const CONN_COLORS  = ['#00c48c', '#f59f00', '#7c3aed', '#868e96'];

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface TopTable   { name: string; size: string; sizeBytes: number; rows: number; deadRows: number; lastVacuum: string | null; lastAnalyze: string | null; }
interface IndexUsage { name: string; seqScans: number; idxScans: number; indexUsagePct: number; rows: number; }
interface ConnState  { state: string; count: number; }
interface Schema     { name: string; tables: number; rows: number; }
interface WriteTable { name: string; inserts: number; updates: number; deletes: number; total: number; }
interface SystemStats {
  server:  { status: string; activeConnections: number; totalConnections: number; sizeFormatted: string; sizeBytes: number; version: string; };
  health:  { cacheHitPct: number; commitPct: number; deadlocks: number; conflicts: number; rollbacks: number; tempFiles: number; tempBytes: number; };
  writes:  { name: string; count: number }[];
  cache:   { name: string; count: number }[];
  indexes: { name: string; count: number }[];
  topTables: TopTable[]; indexUsage: IndexUsage[];
  connectionsByState: ConnState[]; schemas: Schema[]; writeByTable: WriteTable[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : String(n);
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const translateState = (s: string) =>
    s === 'active'                        ? 'Activa'
  : s === 'idle'                          ? 'Inactiva'
  : s === 'idle in transaction'           ? 'En transacción'
  : s === 'idle in transaction (aborted)' ? 'Trans. abortada' : s;

// Mapeo de estado -> índice en CONN_COLORS (para la dona y la lista)
const getConnColorIndex = (stateName: string): number => {
  if (stateName === 'Activa') return 0;      // verde
  if (stateName === 'Inactiva') return 1;    // naranja
  if (stateName === 'En transacción') return 2;
  if (stateName === 'Trans. abortada') return 3;
  return 3; // fallback gris
};

// ── Tooltip oscuro ────────────────────────────────────────────────────────────
interface TooltipPayload { name: string; value: number | string; color?: string; fill?: string; }
interface DarkTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string | number; }
const DarkTooltip = ({ active, payload, label }: DarkTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1b1e', border: '1px solid #2c2e33', borderRadius: 10, padding: '10px 14px', minWidth: 130 }}>
      {label !== undefined && label !== '' && (
        <p style={{ color: '#868e96', fontSize: 10, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{String(label)}</p>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color ?? p.fill ?? '#868e96', flexShrink: 0 }} />
          <span style={{ color: '#ced4da', fontSize: 12 }}>{p.name}:</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', marginLeft: 'auto', paddingLeft: 8 }}>{fmt(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'resumen',     label: 'Resumen',     icon: <LayoutDashboard size={14} /> },
  { id: 'rendimiento', label: 'Rendimiento', icon: <BarChart2 size={14} />       },
  { id: 'tablas',      label: 'Tablas',      icon: <Table2 size={14} />          },
  { id: 'conexiones',  label: 'Conexiones',  icon: <Wifi size={14} />            },
] as const;
type TabId = typeof TABS[number]['id'];

// ── Metric card (estilo Amplitude) ────────────────────────────────────────────
const MetricCard = ({ label, value, sub, trend, accent, icon, wide }: {
  label: string; value: React.ReactNode; sub?: string;
  trend?: 'up' | 'down' | 'neutral'; accent: string; icon: React.ReactNode; wide?: boolean;
}) => (
  <div className={`amp-metric-card ${wide ? 'amp-metric-card--wide' : ''}`}>
    <div className="amp-metric-header">
      <span className="amp-metric-label">{label}</span>
      <span className="amp-metric-icon" style={{ color: accent, background: accent + '18' }}>{icon}</span>
    </div>
    <div className="amp-metric-value">{value}</div>
    {sub && (
      <div className="amp-metric-sub">
        {trend === 'up'      && <ChevronUp size={12} style={{ color: C.emerald }} />}
        {trend === 'down'    && <ChevronDown size={12} style={{ color: C.rose }} />}
        {trend === 'neutral' && <Minus size={12} style={{ color: '#868e96' }} />}
        <span>{sub}</span>
      </div>
    )}
  </div>
);

// ── Gauge ring ────────────────────────────────────────────────────────────────
const GaugeRing = ({ pct, color }: { pct: number; color: string }) => {
  const r = 44; const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 110, height: 110 }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e9ecef" strokeWidth="9" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
          className="gauge-arc-animated" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1b1e', lineHeight: 1, fontFamily: 'monospace' }}>{pct}%</span>
        <span style={{ fontSize: 9, color: '#868e96', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>RAM</span>
      </div>
    </div>
  );
};

// ── Horizontal bar (estilo Amplitude country chart) ───────────────────────────
const HBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="amp-hbar">
      <span className="amp-hbar-label">{label}</span>
      <div className="amp-hbar-track">
        <div className="amp-hbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="amp-hbar-value">{fmt(value)}</span>
    </div>
  );
};

// ── IndexBar ──────────────────────────────────────────────────────────────────
const IndexBar = ({ pct }: { pct: number }) => {
  const color = pct >= 80 ? C.emerald : pct >= 50 ? C.amber : C.rose;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <div style={{ flex: 1, height: 5, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
        <div className="idx-fill-animated" style={{ height: '100%', borderRadius: 4, background: color, width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'monospace', minWidth: 32, textAlign: 'right', color }}>{pct}%</span>
    </div>
  );
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
const AdminStats = () => {
  const [stats, setStats]           = useState<SystemStats | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab]   = useState<TabId>('resumen');
  const [tick, setTick]             = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await api.get('/stats');
      setStats(res.data);
      setLastUpdate(new Date());
      setTick(t => t + 1);
    } catch { setError(true); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 15000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  if (loading && !stats) return (
    <div className="amp-loading">
      <Loader2 size={26} className="animate-spin" style={{ color: C.blue }} />
      <span>Cargando telemetría…</span>
    </div>
  );

  if (error) return (
    <div className="amp-error">
      <AlertTriangle size={32} style={{ color: C.rose }} />
      <h3>Error de conexión</h3>
      <button onClick={fetchStats} className="amp-retry-btn">Reintentar</button>
    </div>
  );

  const s = stats!;
  const isHealthy  = s.health.deadlocks === 0 && s.health.cacheHitPct >= 80;
  const gaugeColor = s.health.cacheHitPct >= 90 ? C.emerald : s.health.cacheHitPct >= 70 ? C.amber : C.rose;
  const maxWrite   = Math.max(...s.writeByTable.map(w => w.total), 1);

  return (
    <div className="amp-root" key={tick}>
      <Breadcrumbs />

      {/* ── TOP BAR ──────────────────────────────────────────────────────── */}
      <div className="amp-topbar">
        <div className="amp-topbar-left">
          <div className="amp-status-dot" style={{ background: isHealthy ? C.emerald : C.amber }}>
            <span className="amp-status-ping" style={{ background: isHealthy ? C.emerald : C.amber }} />
          </div>
          <div>
            <h1 className="amp-title">Base de Datos</h1>
            <p className="amp-subtitle">PostgreSQL · Monitoreo en tiempo real</p>
          </div>
        </div>
        <div className="amp-topbar-right">
          {lastUpdate && (
            <span className="amp-ts">
              <Clock size={11} /> {lastUpdate.toLocaleTimeString('es-MX')}
            </span>
          )}
          <button onClick={fetchStats} disabled={loading} className="amp-refresh-btn">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* ── TAB BAR ──────────────────────────────────────────────────────── */}
      <div className="amp-tabbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`amp-tab ${activeTab === t.id ? 'amp-tab--active' : ''}`}>
            {t.icon}<span>{t.label}</span>
          </button>
        ))}
        <div className="amp-tabbar-line" />
      </div>

      {/* ════════════════════════════════════════════════
          TAB 1 — RESUMEN
      ════════════════════════════════════════════════ */}
      {activeTab === 'resumen' && (
        <div className="amp-panel">

          {/* Fila 1: KPIs rápidos */}
          <div className="amp-metrics-row">
            <MetricCard label="Estado del servidor" icon={<Server size={15} />}
              value={<span style={{ color: C.emerald }}>Online ●</span>}
              sub="Sin incidentes activos" trend="neutral" accent={C.emerald} />
            <MetricCard label="Conexiones activas" icon={<Activity size={15} />}
              value={<>{s.server.activeConnections}<span className="amp-metric-dim"> / {s.server.totalConnections}</span></>}
              sub="activas de las totales" trend="neutral" accent={C.blue} />
            <MetricCard label="Tamaño de la BD" icon={<HardDrive size={15} />}
              value={s.server.sizeFormatted}
              sub="almacenamiento usado" trend="neutral" accent={C.violet} />
            <MetricCard label="Transacciones OK" icon={<Zap size={15} />}
              value={<span style={{ color: s.health.commitPct >= 90 ? C.emerald : C.amber }}>{s.health.commitPct}%</span>}
              sub={`${fmt(s.health.rollbacks)} rollbacks registrados`}
              trend={s.health.commitPct >= 90 ? 'up' : 'down'} accent={C.amber} />
          </div>

          {/* Fila 2: caché + alertas + motor */}
          <div className="amp-row-2">

            {/* Gauge caché */}
            <div className="amp-card amp-card--sm">
              <p className="amp-card-label">Caché Hit Ratio</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 12 }}>
                <GaugeRing pct={s.health.cacheHitPct} color={gaugeColor} />
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#495057' }}>RAM (hits)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: C.emerald }}>{fmt(s.cache[0]?.count ?? 0)}</span>
                    </div>
                    <div style={{ height: 4, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                      <div className="progress-animated" style={{ height: '100%', background: C.emerald, width: `${s.health.cacheHitPct}%`, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#495057' }}>Disco (misses)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: C.rose }}>{fmt(s.cache[1]?.count ?? 0)}</span>
                    </div>
                    <div style={{ height: 4, background: '#e9ecef', borderRadius: 4, overflow: 'hidden' }}>
                      <div className="progress-animated" style={{ height: '100%', background: C.rose, width: `${100 - s.health.cacheHitPct}%`, borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div className="amp-card amp-card--sm">
              <p className="amp-card-label">Alertas del Sistema</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {[
                  { label: 'Deadlocks', value: s.health.deadlocks, color: s.health.deadlocks > 0 ? C.rose : C.emerald, bg: s.health.deadlocks > 0 ? C.roseL : C.emeraldL },
                  { label: 'Rollbacks', value: fmt(s.health.rollbacks), color: s.health.rollbacks > 100 ? C.amber : '#495057', bg: s.health.rollbacks > 100 ? C.amberL : '#f8f9fa' },
                  { label: 'Archivos Temp.', value: s.health.tempFiles, color: '#495057', bg: '#f8f9fa' },
                  { label: 'Conflictos', value: s.health.conflicts, color: s.health.conflicts > 0 ? C.amber : '#495057', bg: s.health.conflicts > 0 ? C.amberL : '#f8f9fa' },
                ].map(a => (
                  <div key={a.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: a.bg }}>
                    <span style={{ fontSize: 13, color: '#495057', fontWeight: 500 }}>{a.label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: a.color }}>{a.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motor y schemas */}
            <div className="amp-card amp-card--sm">
              <p className="amp-card-label">Motor & Schemas</p>
              <div style={{ marginTop: 12 }}>
                <div style={{ padding: '10px 12px', background: C.blueL, borderRadius: 8, marginBottom: 10 }}>
                  <p style={{ fontSize: 10, color: C.blue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Motor</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1b1e', marginTop: 2 }}>{s.server.version}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {s.schemas.map((sc, i) => (
                    <div key={sc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < s.schemas.length - 1 ? '1px solid #f1f3f5' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#212529' }}>{sc.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#495057' }}>{fmt(sc.rows)}</span>
                        <span style={{ fontSize: 10, color: '#868e96', marginLeft: 4 }}>{sc.tables}t</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 2 — RENDIMIENTO
      ════════════════════════════════════════════════ */}
      {activeTab === 'rendimiento' && (
        <div className="amp-panel">

          {/* Operaciones totales */}
          <div className="amp-card" style={{ marginBottom: 16 }}>
            <div className="amp-card-header">
              <div>
                <p className="amp-card-label">Operaciones Totales</p>
                <p className="amp-card-desc">Lecturas, inserciones, actualizaciones y eliminaciones acumuladas</p>
              </div>
            </div>
            <div style={{ height: 260, marginTop: 16 }}>
              <ResponsiveContainer>
                <BarChart data={s.writes} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={48} barGap={8}>
                  <defs>
                    {CHART_COLORS.map((color, i) => (
                      <linearGradient key={i} id={`rg${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={color} stopOpacity={1}   />
                        <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#868e96', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => fmt(v)} tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 6 }} />
                  <Bar dataKey="count" name="Operaciones" radius={[7, 7, 0, 0]}>
                    {s.writes.map((_, i) => <Cell key={i} fill={`url(#rg${i % CHART_COLORS.length})`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Escritura por tabla — barras horizontales estilo Amplitude */}
          <div className="amp-row-2">
            <div className="amp-card" style={{ flex: 2 }}>
              <p className="amp-card-label">Escritura por Tabla</p>
              <p className="amp-card-desc">Total de modificaciones por tabla (inserciones + actualizaciones + eliminaciones)</p>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {s.writeByTable.map((w, i) => (
                  <HBar key={w.name} label={w.name} value={w.total} max={maxWrite} color={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </div>
            </div>

            <div className="amp-card" style={{ flex: 1 }}>
              <p className="amp-card-label">Desglose de Escrituras</p>
              <p className="amp-card-desc">Distribución por tipo de operación</p>
              <div style={{ height: 240, marginTop: 12 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                      {[C.emerald, C.amber, C.rose].map((color, i) => (
                        <radialGradient key={i} id={`pg${i}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%"   stopColor={color} stopOpacity={0.9} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </radialGradient>
                      ))}
                    </defs>
                    <Pie
                      data={[
                        { name: 'Inserciones',     count: s.writeByTable.reduce((a, w) => a + w.inserts, 0) },
                        { name: 'Actualizaciones', count: s.writeByTable.reduce((a, w) => a + w.updates, 0) },
                        { name: 'Eliminaciones',   count: s.writeByTable.reduce((a, w) => a + w.deletes, 0) },
                      ]}
                      cx="50%" cy="44%" innerRadius={48} outerRadius={72}
                      paddingAngle={4} dataKey="count" stroke="#fff" strokeWidth={2}
                    >
                      {[0,1,2].map(i => <Cell key={i} fill={`url(#pg${i})`} />)}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"
                      wrapperStyle={{ fontSize: 11, color: '#495057' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 3 — TABLAS
      ════════════════════════════════════════════════ */}
      {activeTab === 'tablas' && (
        <div className="amp-panel">

          {/* Índices */}
          {s.indexUsage.length > 0 && (
            <div className="amp-card" style={{ marginBottom: 16 }}>
              <p className="amp-card-label">Eficiencia de Índices</p>
              <p className="amp-card-desc" style={{ marginBottom: 20 }}>Porcentaje de consultas optimizadas con índice vs escaneo secuencial completo</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse',
                  minWidth: 560, tableLayout: 'auto',
                }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6' }}>
                      {[
                        { label: 'Tabla',       align: 'left',  w: '22%' },
                        { label: 'Uso de índice', align: 'left', w: '34%' },
                        { label: 'Con índice',   align: 'right', w: '14%' },
                        { label: 'Sin índice',   align: 'right', w: '14%' },
                        { label: 'Filas',        align: 'right', w: '10%' },
                      ].map(col => (
                        <th key={col.label} style={{
                          padding: '12px 20px', textAlign: col.align as 'left'|'right',
                          fontSize: 11, fontWeight: 800, color: '#495057',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          whiteSpace: 'nowrap', width: col.w,
                        }}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.indexUsage.map((row, i) => (
                      <tr key={row.name} style={{
                        borderBottom: i < s.indexUsage.length - 1 ? '1px solid #f1f3f5' : 'none',
                        background: 'transparent', transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#212529', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {row.name}
                        </td>
                        <td style={{ padding: '14px 20px 14px 20px', textAlign: 'left' }}>
                          <IndexBar pct={row.indexUsagePct} />
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontFamily: 'DM Mono, monospace', color: '#343a40', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {fmt(row.idxScans)}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontFamily: 'DM Mono, monospace', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600, color: row.seqScans > 100 ? C.rose : '#343a40' }}>
                          {fmt(row.seqScans)}{row.seqScans > 100 && ' ⚠'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontFamily: 'DM Mono, monospace', color: '#343a40', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {fmt(row.rows)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top tablas */}
          {s.topTables.length > 0 && (
            <div className="amp-card">
              <p className="amp-card-label">Top Tablas por Tamaño</p>
              <p className="amp-card-desc" style={{ marginBottom: 20 }}>Las tablas más grandes con información de filas y mantenimiento</p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%', borderCollapse: 'collapse',
                  minWidth: 660, tableLayout: 'auto',
                }}>
                  <thead>
                    <tr style={{ background: '#f8f9fa', borderTop: '1px solid #dee2e6', borderBottom: '1px solid #dee2e6' }}>
                      {[
                        { label: 'Tabla',          align: 'left',  w: '20%' },
                        { label: 'Tamaño',         align: 'right', w: '10%' },
                        { label: 'Filas vivas',    align: 'right', w: '12%' },
                        { label: 'Filas muertas',  align: 'right', w: '12%' },
                        { label: 'Último Vacuum',  align: 'left',  w: '18%' },
                        { label: 'Último Analyze', align: 'left',  w: '18%' },
                      ].map(col => (
                        <th key={col.label} style={{
                          padding: '12px 20px', textAlign: col.align as 'left'|'right',
                          fontSize: 11, fontWeight: 800, color: '#495057',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          whiteSpace: 'nowrap', width: col.w,
                        }}>{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.topTables.map((t, i) => (
                      <tr key={t.name} style={{
                        borderBottom: i < s.topTables.length - 1 ? '1px solid #f1f3f5' : 'none',
                        background: 'transparent', transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#212529', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {t.name}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-block', background: '#e9ecef', color: '#343a40', fontSize: 12, fontFamily: 'DM Mono, monospace', fontWeight: 700, padding: '3px 10px', borderRadius: 7 }}>
                            {t.size}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontFamily: 'DM Mono, monospace', color: '#343a40', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {fmt(t.rows)}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 14, fontFamily: 'DM Mono, monospace', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 600, color: t.deadRows > 1000 ? C.amber : '#343a40' }}>
                          {fmt(t.deadRows)}{t.deadRows > 1000 && ' ⚠'}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#495057', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {fmtDate(t.lastVacuum)}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#495057', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {fmtDate(t.lastAnalyze)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          TAB 4 — CONEXIONES (CORREGIDO: VERDE = ACTIVA, NARANJA = INACTIVA)
      ════════════════════════════════════════════════ */}
      {activeTab === 'conexiones' && (
        <div className="amp-panel">
          <div className="amp-row-2">

            {/* Donut */}
            <div className="amp-card" style={{ flex: 1 }}>
              <p className="amp-card-label">Conexiones por Estado</p>
              <p className="amp-card-desc">Distribución en tiempo real de las conexiones a la BD</p>
              <div style={{ height: 280, marginTop: 8 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                      {CONN_COLORS.map((color, i) => (
                        <radialGradient key={i} id={`cg${i}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%"   stopColor={color} stopOpacity={1}   />
                          <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                        </radialGradient>
                      ))}
                    </defs>
                    <Pie
                      data={s.connectionsByState.map(c => ({ name: translateState(c.state), count: c.count }))}
                      cx="50%" cy="44%" innerRadius={62} outerRadius={96}
                      paddingAngle={4} dataKey="count" stroke="#fff" strokeWidth={3}
                    >
                      {s.connectionsByState.map((c, idx) => {
                        const stateName = translateState(c.state);
                        const colorIndex = getConnColorIndex(stateName);
                        return <Cell key={idx} fill={`url(#cg${colorIndex})`} />;
                      })}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"
                      wrapperStyle={{ fontSize: 12, color: '#495057' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detalle de Conexiones (con colores corregidos) */}
            <div className="amp-card" style={{ flex: 1 }}>
              <p className="amp-card-label">Detalle de Conexiones</p>
              <p className="amp-card-desc">Conteo por tipo de estado</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {s.connectionsByState.map((c, i) => {
                  const stateName = translateState(c.state);
                  const colorHex = CONN_COLORS[getConnColorIndex(stateName)];
                  return (
                    <div key={c.state} className="amp-conn-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: colorHex, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#212529' }}>{stateName}</span>
                      </div>
                      <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: colorHex }}>{c.count}</span>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: '#f8f9fa', marginTop: 4, borderTop: '1px solid #e9ecef' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#212529' }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 900, fontFamily: 'monospace', color: '#212529' }}>{s.server.totalConnections}</span>
                </div>
              </div>
            </div>

            {/* Schemas */}
            <div className="amp-card" style={{ flex: 1 }}>
              <p className="amp-card-label">Schemas</p>
              <p className="amp-card-desc">Distribución de tablas y filas por schema</p>
              <div style={{ height: 280, marginTop: 8 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={s.schemas.map(sc => ({ name: sc.name, filas: sc.rows, tablas: sc.tables }))}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={28}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#868e96' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v: number) => fmt(v)} tick={{ fontSize: 11, fill: '#868e96' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="filas" name="Filas" fill={C.blue} radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;