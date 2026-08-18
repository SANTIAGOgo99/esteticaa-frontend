import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './AdminAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

/* ══════════════════════════════════════════
   DATOS Y CONFIGURACIÓN
══════════════════════════════════════════ */

type Cita = {
  fecha: Date;
  fechaISO: string;
  hora: string;
  mes: string;
  mes_num: number;
  cliente: string;
  iniciales: string;
  servicio: string;
  categoria: string;
  precio: number;
};

type ConteoDia = {
  fechaISO: string;
  total: number;
};

type CitaPronosticada = {
  fechaISO: string;
  hora: string;
  servicio: string;
  categoria: string;
  precio: number;
};

type DiaPronosticado = {
  fechaISO: string;
  t: number;
  valorExacto: number;
  valor: number;
  citas: CitaPronosticada[];
};

const PRECIOS: Record<string, number> = {
  'Corte mujer': 280,
  'Corte hombre': 180,
  'Peinado y estilizado': 320,
  'Brushing': 220,
  'Alisado': 450,
  'Tinte completo': 650,
  'Mechas balayage': 900,
  'Decoloración': 750,
  'Retoque de raíz': 480,
  'Color fantasía': 580,
  'Keratina': 1100,
  'Hidratación profunda': 420,
  'Botox capilar': 850,
  'Reconstrucción': 680,
  'Mascarilla': 320,
  'Diseño de cejas': 180,
  'Lifting de pestañas': 550,
  'Microblading': 1800,
  'Limpieza facial': 480,
  'Depilación': 220,
  'Corte + barba': 250,
  'Perfil barba': 150,
  'Afeitado clásico': 180,
  'Diseño bigote': 120,
  'Manicure': 220,
  'Pedicure': 280,
  'Masaje relajante': 480,
  'Spa capilar': 720,
  'Consulta imagen': 350
};

const CLIENTES = [
  'Sofía Ramírez',
  'Carlos Mendoza',
  'Valentina Torres',
  'Andrés García',
  'Lucía Hernández',
  'Miguel Ángel Ruiz',
  'Daniela Flores',
  'Roberto Castro',
  'Fernanda López',
  'Alejandro Reyes',
  'Mariana Castillo',
  'Paola Sánchez',
  'Eduardo Martínez',
  'Camila Ortega',
  'Javier Torres'
];

const CATEGORIAS = [
  'Cortes y Estilizado',
  'Colorimetría',
  'Tratamientos Capilares',
  'Rostro',
  'Barbería',
  'General'
];

const CAT_SERVICIOS: Record<string, string[]> = {
  'Cortes y Estilizado': [
    'Corte mujer',
    'Corte hombre',
    'Peinado y estilizado',
    'Brushing',
    'Alisado'
  ],
  Colorimetría: [
    'Tinte completo',
    'Mechas balayage',
    'Decoloración',
    'Retoque de raíz',
    'Color fantasía'
  ],
  'Tratamientos Capilares': [
    'Keratina',
    'Hidratación profunda',
    'Botox capilar',
    'Reconstrucción',
    'Mascarilla'
  ],
  Rostro: [
    'Diseño de cejas',
    'Lifting de pestañas',
    'Microblading',
    'Limpieza facial',
    'Depilación'
  ],
  Barbería: [
    'Corte + barba',
    'Perfil barba',
    'Afeitado clásico',
    'Diseño bigote'
  ],
  General: [
    'Manicure',
    'Pedicure',
    'Masaje relajante',
    'Spa capilar',
    'Consulta imagen'
  ]
};

const CAT_COLORS: Record<string, string> = {
  'Cortes y Estilizado': '#2563eb',
  Colorimetría: '#16a34a',
  'Tratamientos Capilares': '#d97706',
  Rostro: '#dc2626',
  Barbería: '#7c3aed',
  General: '#0891b2'
};

const CAT_BG: Record<string, string> = {
  'Cortes y Estilizado': '#eff6ff',
  Colorimetría: '#f0fdf4',
  'Tratamientos Capilares': '#fffbeb',
  Rostro: '#fef2f2',
  Barbería: '#f5f3ff',
  General: '#ecfeff'
};

const AVATAR_COLORS = [
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#dcfce7', fg: '#15803d' },
  { bg: '#fef3c7', fg: '#b45309' },
  { bg: '#fce7f3', fg: '#be185d' },
  { bg: '#ede9fe', fg: '#6d28d9' }
];

const HORAS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00'
];

const HIST_MESES = [
  { label: 'Enero', mes_num: 1, año: 2026, fechaInicio: '2026-01-01', fechaFin: '2026-01-31' },
  { label: 'Febrero', mes_num: 2, año: 2026, fechaInicio: '2026-02-01', fechaFin: '2026-02-28' },
  { label: 'Marzo', mes_num: 3, año: 2026, fechaInicio: '2026-03-01', fechaFin: '2026-03-31' },
  { label: 'Abril', mes_num: 4, año: 2026, fechaInicio: '2026-04-01', fechaFin: '2026-04-30' },
  { label: 'Mayo', mes_num: 5, año: 2026, fechaInicio: '2026-05-01', fechaFin: '2026-05-31' }
];

const FECHA_MIN = '2026-01-01';
const FECHA_MAX = '2026-05-31';

/* ══════════════════════════════════════════
   FUNCIONES AUXILIARES
══════════════════════════════════════════ */

let seed = 42;

function rand<T>(arr: T[]): T {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return arr[Math.abs(seed) % arr.length];
}

function formatFechaISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatPrecio(n: number) {
  return `$${Math.round(n).toLocaleString('es-MX')}`;
}

function formatFechaCorta(iso: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function nombreMesAnio(isoDate: string) {
  const d = new Date(isoDate + 'T00:00:00');
  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}




function esDomingoISO(fechaISO: string) {
  const d = new Date(fechaISO + 'T00:00:00');
  return d.getDay() === 0;
}

function contarDiasHabilesISO(inicioISO: string, finISO: string) {
  const inicio = new Date(inicioISO + 'T00:00:00');
  const fin = new Date(finISO + 'T00:00:00');

  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return 0;
  if (fin <= inicio) return 0;

  let contador = 0;
  const actual = new Date(inicio);

  while (actual < fin) {
    actual.setDate(actual.getDate() + 1);

    // No contar domingos porque la estética descansa.
    if (actual.getDay() !== 0) {
      contador++;
    }
  }

  return contador;
}

function sumarDiasHabilesISO(fechaISO: string, diasHabiles: number) {
  const fecha = new Date(fechaISO + 'T00:00:00');

  if (Number.isNaN(fecha.getTime())) return fechaISO;
  if (diasHabiles <= 0) return formatFechaISO(fecha);

  let agregados = 0;

  while (agregados < diasHabiles) {
    fecha.setDate(fecha.getDate() + 1);

    // Saltar domingos porque no se generan citas predictivas ese día.
    if (fecha.getDay() !== 0) {
      agregados++;
    }
  }

  return formatFechaISO(fecha);
}

function obtenerFechasRango(desde: string, hasta: string) {
  const fechas: string[] = [];
  const inicio = new Date(desde + 'T00:00:00');
  const fin = new Date(hasta + 'T00:00:00');
  const cursor = new Date(inicio);

  while (cursor <= fin) {
    fechas.push(formatFechaISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return fechas;
}

function getMesInfo(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return {
    mes_num: d.getMonth() + 1,
    label: nombreMesAnio(iso).split(' ')[0]
  };
}


function obtenerDemandaBasePorFecha(fecha: Date) {
  const mes = fecha.getMonth() + 1;
  const diaSemana = fecha.getDay();

  // Domingo cerrado o descanso: 0 citas.
  if (diaSemana === 0) return 0;

  // Crecimiento ligero por mes para que el modelo tenga datos más reales.
  const baseMes = 4 + mes;

  let ajusteDia = 0;
  if (diaSemana === 1) ajusteDia = -1; // lunes más bajo
  if (diaSemana === 5) ajusteDia = 2;  // viernes más alto
  if (diaSemana === 6) ajusteDia = 3;  // sábado más alto

  const variacion = (fecha.getDate() % 3) - 1;

  return Math.max(2, baseMes + ajusteDia + variacion);
}

/* ══════════════════════════════════════════
   GENERADOR ESTÁTICO CON MÁS CITAS POR DÍA
══════════════════════════════════════════ */

const TODOS: Cita[] = [];

HIST_MESES.forEach(mes => {
  const inicio = new Date(mes.fechaInicio + 'T00:00:00');
  const fin = new Date(mes.fechaFin + 'T00:00:00');
  const cursor = new Date(inicio);

  while (cursor <= fin) {
    const demandaDia = obtenerDemandaBasePorFecha(cursor);
    const horasUsadas = [...HORAS];

    for (let i = 0; i < demandaDia; i++) {
      const categoria = rand(CATEGORIAS);
      const servicio = rand(CAT_SERVICIOS[categoria]);
      const cliente = rand(CLIENTES);
      const hora = horasUsadas.length > 0 ? horasUsadas.splice(Math.abs(seed + i) % horasUsadas.length, 1)[0] : rand(HORAS);
      const fechaISO = formatFechaISO(cursor);
      const infoMes = getMesInfo(fechaISO);

      TODOS.push({
        fecha: new Date(cursor),
        fechaISO,
        hora,
        mes: infoMes.label,
        mes_num: infoMes.mes_num,
        cliente,
        iniciales: cliente.split(' ').map(p => p[0]).slice(0, 2).join(''),
        servicio,
        categoria,
        precio: PRECIOS[servicio] ?? 300
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }
});

TODOS.sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.hora.localeCompare(b.hora));

const TOTAL_CITAS = TODOS.length;
const TOTAL_INGRESOS = TODOS.reduce((a, r) => a + r.precio, 0);

/* ══════════════════════════════════════════
   MODELO PREDICTIVO DIARIO
   dP/dt = kP → P(t) = C1e^(kt)
   k = ln(Pobservado / C1) / t
══════════════════════════════════════════ */

function obtenerConteoDiario(citas: Cita[], desde: string, hasta: string): ConteoDia[] {
  const mapa: Record<string, number> = {};

  citas
    .filter(c => c.fechaISO >= desde && c.fechaISO <= hasta && !esDomingoISO(c.fechaISO))
    .forEach(c => {
      mapa[c.fechaISO] = (mapa[c.fechaISO] || 0) + 1;
    });

  return Object.entries(mapa)
    .map(([fechaISO, total]) => ({ fechaISO, total }))
    .sort((a, b) => a.fechaISO.localeCompare(b.fechaISO));
}

function calcularDistribucionServicios(citasBase: Cita[]) {
  const mapa: Record<string, { servicio: string; categoria: string; count: number; precio: number }> = {};

  citasBase.forEach(cita => {
    if (!mapa[cita.servicio]) {
      mapa[cita.servicio] = {
        servicio: cita.servicio,
        categoria: cita.categoria,
        count: 0,
        precio: cita.precio
      };
    }

    mapa[cita.servicio].count += 1;
  });

  return Object.values(mapa).sort((a, b) => b.count - a.count);
}

function distribuirServiciosPorDia(totalCitas: number, distribucion: ReturnType<typeof calcularDistribucionServicios>) {
  if (totalCitas <= 0) return [];

  const totalHist = distribucion.reduce((a, s) => a + s.count, 0) || 1;

  const base = distribucion.map(item => {
    const exacto = (item.count / totalHist) * totalCitas;
    const asignadas = Math.floor(exacto);

    return {
      ...item,
      asignadas,
      resto: exacto - asignadas
    };
  });

  let pendientes = totalCitas - base.reduce((a, s) => a + s.asignadas, 0);

  base
    .sort((a, b) => b.resto - a.resto)
    .forEach(item => {
      if (pendientes > 0) {
        item.asignadas += 1;
        pendientes -= 1;
      }
    });

  const servicios: Array<{ servicio: string; categoria: string; precio: number }> = [];

  base
    .filter(item => item.asignadas > 0)
    .sort((a, b) => b.asignadas - a.asignadas)
    .forEach(item => {
      for (let i = 0; i < item.asignadas; i++) {
        servicios.push({
          servicio: item.servicio,
          categoria: item.categoria,
          precio: item.precio
        });
      }
    });

  return servicios.slice(0, totalCitas);
}

function calcularModeloDiario(citas: Cita[], desde: string, hasta: string) {
  // Validaciones para evitar pantalla blanca cuando el usuario cambia fechas.
  if (!desde || !hasta) return null;
  if (Number.isNaN(new Date(desde + 'T00:00:00').getTime())) return null;
  if (Number.isNaN(new Date(hasta + 'T00:00:00').getTime())) return null;
  if (desde > hasta) return null;

  const citasRango = citas.filter(c => c.fechaISO >= desde && c.fechaISO <= hasta);
  const conteo = obtenerConteoDiario(citas, desde, hasta).filter(d => d.total > 0);

  if (conteo.length < 2) return null;

  const inicial = conteo[0];
  const observado = conteo[conteo.length - 1];

  const C1 = inicial.total;
  const Pob = observado.total;
  const tObs = contarDiasHabilesISO(inicial.fechaISO, observado.fechaISO);

  if (C1 <= 0 || Pob <= 0 || tObs <= 0) return null;

  const k = Math.log(Pob / C1) / tObs;
  if (!Number.isFinite(k)) return null;

  const fechaPrediccion = sumarDiasHabilesISO(observado.fechaISO, 1);
  const tPred = contarDiasHabilesISO(inicial.fechaISO, fechaPrediccion);
  const prediccionExacta = C1 * Math.exp(k * tPred);
  if (!Number.isFinite(prediccionExacta)) return null;

  const prediccionRedondeada = Math.max(0, Math.round(prediccionExacta));

  const distribucionServicios = calcularDistribucionServicios(citasRango);

  const proximo7: DiaPronosticado[] = Array.from({ length: 7 }, (_, i) => {
    const fechaISO = sumarDiasHabilesISO(observado.fechaISO, i + 1);
    const t = contarDiasHabilesISO(inicial.fechaISO, fechaISO);
    const valorExacto = C1 * Math.exp(k * t);
    const valor = Math.max(0, Math.round(valorExacto));
    const serviciosDia = distribuirServiciosPorDia(valor, distribucionServicios);

    const citasPronosticadas = serviciosDia.map((serv, index) => ({
      fechaISO,
      hora: HORAS[index % HORAS.length],
      servicio: serv.servicio,
      categoria: serv.categoria,
      precio: serv.precio
    }));

    return {
      fechaISO,
      t,
      valorExacto,
      valor,
      citas: citasPronosticadas
    };
  });

  const resumenServicios: Record<string, { servicio: string; categoria: string; citas: number; ingresos: number }> = {};

  proximo7.forEach(dia => {
    dia.citas.forEach(cita => {
      if (!resumenServicios[cita.servicio]) {
        resumenServicios[cita.servicio] = {
          servicio: cita.servicio,
          categoria: cita.categoria,
          citas: 0,
          ingresos: 0
        };
      }

      resumenServicios[cita.servicio].citas += 1;
      resumenServicios[cita.servicio].ingresos += cita.precio;
    });
  });

  const resumenCategorias: Record<string, { categoria: string; citas: number; ingresos: number }> = {};

  proximo7.forEach(dia => {
    dia.citas.forEach(cita => {
      if (!resumenCategorias[cita.categoria]) {
        resumenCategorias[cita.categoria] = {
          categoria: cita.categoria,
          citas: 0,
          ingresos: 0
        };
      }

      resumenCategorias[cita.categoria].citas += 1;
      resumenCategorias[cita.categoria].ingresos += cita.precio;
    });
  });

  return {
    conteo,
    citasRango,
    inicial,
    observado,
    C1,
    Pob,
    tObs,
    k,
    fechaPrediccion,
    tPred,
    prediccionExacta,
    prediccionRedondeada,
    proximo7,
    resumenServicios: Object.values(resumenServicios).sort((a, b) => b.citas - a.citas),
    resumenCategorias: Object.values(resumenCategorias).sort((a, b) => b.citas - a.citas)
  };
}

/* ══════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════ */

export default function AdminAnalytics() {
  const [tab, setTab] = useState('prediccion');

  const tabs = [
    { id: 'consultas', label: 'Consultas', icon: '◉' },
    { id: 'prediccion', label: 'Predicción por día hábil', icon: '◈' },
    { id: 'estadisticas', label: 'Estadísticas', icon: '◆' }
  ];

  return (
    <div className="ar-root">
      <header className="ar-header">
        <div className="ar-header-left">
          <div className="ar-logo">✦</div>
          <div>
            <h1 className="ar-title">Panel de Analíticas</h1>
            <p className="ar-subtitle">
              {TOTAL_CITAS} citas · {formatPrecio(TOTAL_INGRESOS)} histórico
            </p>
          </div>
        </div>

        <div className="ar-header-pill">
          <span className="ar-dot" />
          Sistema activo
        </div>
      </header>

      <nav className="ar-nav">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`ar-navbtn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="ar-navicon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <main className="ar-main">
        {tab === 'consultas' && <ConsultasPage />}
        {tab === 'prediccion' && <PrediccionPage />}
        {tab === 'estadisticas' && <EstadisticasPage />}
      </main>
    </div>
  );
}

/* ══════════════════════════════════════════
   CONSULTAS: SOLO FILTRO DESDE/HASTA
══════════════════════════════════════════ */

function ConsultasPage() {
  const [desde, setDesde] = useState('2026-04-01');
  const [hasta, setHasta] = useState('2026-04-30');
  const [cat, setCat] = useState('all');
  const [busq, setBusq] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return TODOS.filter(r => {
      if (r.fechaISO < desde || r.fechaISO > hasta) return false;
      if (cat !== 'all' && r.categoria !== cat) return false;

      if (
        busq &&
        !r.cliente.toLowerCase().includes(busq.toLowerCase()) &&
        !r.servicio.toLowerCase().includes(busq.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [desde, hasta, cat, busq]);

  const fechasRango = useMemo(() => obtenerFechasRango(desde, hasta), [desde, hasta]);

  const conteoPorFecha = useMemo(() => {
    const mapa: Record<string, number> = {};

    filtrados.forEach(cita => {
      mapa[cita.fechaISO] = (mapa[cita.fechaISO] || 0) + 1;
    });

    return mapa;
  }, [filtrados]);

  const citasDiaSeleccionado = useMemo(() => {
    if (!diaSeleccionado) return [];
    return filtrados
      .filter(c => c.fechaISO === diaSeleccionado)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [diaSeleccionado, filtrados]);

  const totalIngresos = filtrados.reduce((a, r) => a + r.precio, 0);
  const diasConCitas = Object.values(conteoPorFecha).filter(n => n > 0).length;

  return (
    <>
      <div className="kpi-row">
        <KpiCard icon="◉" label="Citas filtradas" value={filtrados.length} color="blue" />
        <KpiCard icon="◈" label="Ingresos" value={formatPrecio(totalIngresos)} color="green" />
        <KpiCard
          icon="◆"
          label="Promedio por cita"
          value={filtrados.length ? formatPrecio(totalIngresos / filtrados.length) : '$0'}
          color="amber"
        />
        <KpiCard icon="✦" label="Días con citas" value={diasConCitas} color="violet" />
      </div>

      <div className="filter-panel">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Desde</label>
            <input
              type="date"
              className="date-inp"
              value={desde}
              min={FECHA_MIN}
              max={FECHA_MAX}
              onChange={e => {
                setDesde(e.target.value);
                if (e.target.value > hasta) setHasta(e.target.value);
                setDiaSeleccionado(null);
              }}
            />
          </div>

          <span className="arrow-sep">→</span>

          <div className="filter-group">
            <label className="filter-label">Hasta</label>
            <input
              type="date"
              className="date-inp"
              value={hasta}
              min={FECHA_MIN}
              max={FECHA_MAX}
              onChange={e => {
                setHasta(e.target.value);
                if (e.target.value < desde) setDesde(e.target.value);
                setDiaSeleccionado(null);
              }}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Categoría</label>
            <select
              className="sel-inp"
              value={cat}
              onChange={e => {
                setCat(e.target.value);
                setDiaSeleccionado(null);
              }}
            >
              <option value="all">Todas</option>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group flex-1">
            <label className="filter-label">Buscar</label>
            <input
              type="text"
              className="text-inp"
              placeholder="Cliente o servicio..."
              value={busq}
              onChange={e => {
                setBusq(e.target.value);
                setDiaSeleccionado(null);
              }}
            />
          </div>

          <button
            className="btn-clear"
            onClick={() => {
              setDesde('2026-04-01');
              setHasta('2026-04-30');
              setCat('all');
              setBusq('');
              setDiaSeleccionado(null);
            }}
          >
            Limpiar
          </button>
        </div>

        <div className="filter-meta">
          {formatFechaCorta(desde)} → {formatFechaCorta(hasta)} · <strong>{filtrados.length}</strong> citas · <strong>{formatPrecio(totalIngresos)}</strong>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Calendario de citas por rango</div>
            <div className="card-sub">
              Muestra cuántas citas hay en cada día del rango seleccionado. Selecciona un día para ver el detalle.
            </div>
          </div>

          {diaSeleccionado && (
            <button className="btn-clear" onClick={() => setDiaSeleccionado(null)}>
              Quitar selección
            </button>
          )}
        </div>

        <div className="cal-grid">
          {fechasRango.map(fechaISO => {
            const total = conteoPorFecha[fechaISO] || 0;
            const activo = diaSeleccionado === fechaISO;
            const fecha = new Date(fechaISO + 'T00:00:00');
            const esDomingo = fecha.getDay() === 0;

            return (
              <div
                key={fechaISO}
                className={`cal-cell filled${activo ? ' selec' : ''}${esDomingo ? ' domingo' : ''}${total === 0 ? ' vacio' : ''}`}
                onClick={() => setDiaSeleccionado(activo ? null : fechaISO)}
              >
                <div className="cal-num">{fecha.getDate()}</div>
                <div className="cal-descanso" style={{ marginBottom: 4 }}>
                  {nombreMesAnio(fechaISO).split(' ')[0]}
                </div>

                {total > 0 ? (
                  <>
                    <div className="cal-citas">
                      {total} cita{total !== 1 ? 's' : ''}
                    </div>
                    <div className="cal-dots">
                      {[...Array(Math.min(total, 5))].map((_, i) => (
                        <span key={i} className="cal-dot" />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="cal-descanso">Sin citas</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {diaSeleccionado && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Citas del día {formatFechaCorta(diaSeleccionado)}</div>
              <div className="card-sub">
                {citasDiaSeleccionado.length} cita{citasDiaSeleccionado.length !== 1 ? 's' : ''} registrada{citasDiaSeleccionado.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <TablaCitas citas={citasDiaSeleccionado} mostrarFecha={false} />
        </div>
      )}

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Registro de citas filtradas</div>
            <div className="card-sub">Listado completo del rango seleccionado.</div>
          </div>

          <span className="badge-count">{filtrados.length} resultados</span>
        </div>

        <TablaCitas citas={filtrados} mostrarFecha />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   PREDICCIÓN DIARIA COMPLETA
══════════════════════════════════════════ */

function PrediccionPage() {
  const [desde, setDesde] = useState('2026-04-01');
  const [hasta, setHasta] = useState('2026-04-10');
  const [categoriaPronostico, setCategoriaPronostico] = useState('all');
  const [diaPronosticoSeleccionado, setDiaPronosticoSeleccionado] = useState<string | null>(null);

  const modelo = useMemo(() => calcularModeloDiario(TODOS, desde, hasta), [desde, hasta]);

  useEffect(() => {
    const primerDia = modelo?.proximo7?.[0]?.fechaISO ?? null;
    setDiaPronosticoSeleccionado(primerDia);
  }, [desde, hasta, modelo?.fechaPrediccion]);

  const citasRango = useMemo(() => TODOS.filter(r => r.fechaISO >= desde && r.fechaISO <= hasta), [desde, hasta]);

  const diasPronosticadosFiltrados = useMemo(() => {
    if (!modelo) return [];

    return modelo.proximo7.map(dia => ({
      ...dia,
      citas: categoriaPronostico === 'all'
        ? dia.citas
        : dia.citas.filter(c => c.categoria === categoriaPronostico),
      valor: categoriaPronostico === 'all'
        ? dia.valor
        : dia.citas.filter(c => c.categoria === categoriaPronostico).length
    }));
  }, [modelo, categoriaPronostico]);

  const citasDiaPronostico = useMemo(() => {
    if (!diaPronosticoSeleccionado) return [];

    const dia = diasPronosticadosFiltrados.find(d => d.fechaISO === diaPronosticoSeleccionado);
    return dia?.citas ?? [];
  }, [diaPronosticoSeleccionado, diasPronosticadosFiltrados]);

  const serviciosPronosticados = useMemo(() => {
    if (!modelo) return [];

    const mapa: Record<string, { servicio: string; categoria: string; citas: number; ingresos: number }> = {};

    diasPronosticadosFiltrados.forEach(dia => {
      dia.citas.forEach(cita => {
        if (!mapa[cita.servicio]) {
          mapa[cita.servicio] = {
            servicio: cita.servicio,
            categoria: cita.categoria,
            citas: 0,
            ingresos: 0
          };
        }

        mapa[cita.servicio].citas += 1;
        mapa[cita.servicio].ingresos += cita.precio;
      });
    });

    return Object.values(mapa).sort((a, b) => b.citas - a.citas);
  }, [modelo, diasPronosticadosFiltrados]);

  const categoriasPronosticadas = useMemo(() => {
    if (!modelo) return [];

    const mapa: Record<string, { categoria: string; citas: number; ingresos: number }> = {};

    modelo.proximo7.forEach(dia => {
      dia.citas.forEach(cita => {
        if (!mapa[cita.categoria]) {
          mapa[cita.categoria] = {
            categoria: cita.categoria,
            citas: 0,
            ingresos: 0
          };
        }

        mapa[cita.categoria].citas += 1;
        mapa[cita.categoria].ingresos += cita.precio;
      });
    });

    return Object.values(mapa).sort((a, b) => b.citas - a.citas);
  }, [modelo]);

  const lineData = useMemo(() => {
    if (!modelo) return { labels: [], datasets: [] };

    const historicoLabels = modelo.conteo.map(d => formatFechaCorta(d.fechaISO));
    const historicoValores = modelo.conteo.map(d => d.total);
    const predLabels = modelo.proximo7.map(d => formatFechaCorta(d.fechaISO));
    const predValores = modelo.proximo7.map(d => d.valor);

    return {
      labels: [...historicoLabels, ...predLabels],
      datasets: [
        {
          label: 'Citas reales por día',
          data: [...historicoValores, ...modelo.proximo7.map(() => null)],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          spanGaps: false
        },
        {
          label: 'Predicción por día hábil',
          data: [
            ...modelo.conteo.map((_, i) => (i === modelo.conteo.length - 1 ? modelo.observado.total : null)),
            ...predValores
          ],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.06)',
          fill: false,
          tension: 0.25,
          borderWidth: 2.5,
          borderDash: [7, 4],
          pointRadius: 6,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          spanGaps: true
        }
      ]
    };
  }, [modelo]);

  const lineOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.parsed.y === null) return null;
            return ctx.datasetIndex === 0 ? ` Citas reales: ${ctx.parsed.y}` : ` Predicción: ${ctx.parsed.y} citas`;
          }
        },
        filter: (item: any) => item.parsed.y !== null
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 12 } } }
    }
  };

  const totalPronosticoFiltrado = diasPronosticadosFiltrados.reduce((a, d) => a + d.citas.length, 0);
  const ingresosPronosticoFiltrado = diasPronosticadosFiltrados.reduce(
    (a, d) => a + d.citas.reduce((s, c) => s + c.precio, 0),
    0
  );

  return (
    <>
      <div className="card pred-config-card">
        <div className="pred-config-top">
          <div>
            <div className="card-title">Predicción por día hábil de demanda de citas</div>
            <div className="card-sub">Modelo exponencial por día hábil: P(t) = C1 · e<sup>(k · t)</sup></div>
          </div>

          <div className="pred-chip">{citasRango.length} citas en el rango</div>
        </div>

        <div className="filter-row" style={{ marginTop: 16 }}>
          <div className="filter-group">
            <label className="filter-label">Desde</label>
            <input
              type="date"
              className="date-inp"
              value={desde}
              min={FECHA_MIN}
              max={FECHA_MAX}
              onChange={e => {
                const nuevaFecha = e.target.value;
                if (!nuevaFecha) return;

                setDesde(nuevaFecha);
                if (nuevaFecha > hasta) setHasta(nuevaFecha);
              }}
            />
          </div>

          <span className="arrow-sep">→</span>

          <div className="filter-group">
            <label className="filter-label">Hasta</label>
            <input
              type="date"
              className="date-inp"
              value={hasta}
              min={FECHA_MIN}
              max={FECHA_MAX}
              onChange={e => {
                const nuevaFecha = e.target.value;
                if (!nuevaFecha) return;

                setHasta(nuevaFecha);
                if (nuevaFecha < desde) setDesde(nuevaFecha);
              }}
            />
          </div>
        </div>

        {!modelo && (
          <div className="pred-warn">
            Selecciona un rango donde existan al menos dos días con citas para calcular C1, k y P1.
          </div>
        )}
      </div>

      {modelo && (
        <>
          <div className="pred-result-banner pred-banner-multi">
            <div className="pred-banner-head">
              <div>
                <div className="pred-result-label">Resultado principal</div>
                <div className="pred-result-sub">
                  Para el día {formatFechaCorta(modelo.fechaPrediccion)} se estiman aproximadamente:
                </div>
              </div>

              <div className={`pred-trend-chip ${modelo.k > 0.01 ? 'up' : modelo.k < -0.01 ? 'down' : 'flat'}`}>
                {modelo.k > 0.01 ? '↑ Crecimiento' : modelo.k < -0.01 ? '↓ Disminución' : '→ Estable'}
              </div>
            </div>

            <div className="pred-mes-row">
              <div className="pred-mes-card active">
                <div className="pred-mes-label">Predicción por día hábil</div>
                <div className="pred-mes-num">{modelo.prediccionRedondeada}</div>
                <div className="pred-mes-sub">citas estimadas para el siguiente día</div>
              </div>

              <div className="pred-mes-card">
                <div className="pred-mes-label">Valor exacto</div>
                <div className="pred-mes-num">{modelo.prediccionExacta.toFixed(2)}</div>
                <div className="pred-mes-sub">antes de redondear</div>
              </div>

              <div className="pred-mes-card">
                <div className="pred-mes-label">Constante k</div>
                <div className="pred-mes-num">{modelo.k.toFixed(4)}</div>
                <div className="pred-mes-sub">tasa por día hábil</div>
              </div>
            </div>
          </div>

          <TablaValoresModeloDiario modelo={modelo} />

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Curva de demanda diaria</div>
                <div className="card-sub">Citas reales del rango seleccionado + predicción de los próximos 7 días hábiles, saltando domingos.</div>
              </div>

              <div className="legend-row">
                <span className="legend-dot" style={{ background: '#2563eb' }} /> Reales
                <span className="legend-dot" style={{ background: '#f59e0b', marginLeft: 12 }} /> Predicción
              </div>
            </div>

            <div style={{ height: 300, marginTop: 8 }}>
              <Line key={`pred-${desde}-${hasta}`} data={lineData} options={lineOpts} />
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Agenda predictiva de los próximos 7 días</div>
                <div className="card-sub">
                  Aquí puedes ver qué días tendrás citas, a qué hora podrían venir y qué servicios se esperan.
                </div>
              </div>

              <select
                className="sel-inp"
                value={categoriaPronostico}
                onChange={e => setCategoriaPronostico(e.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {CATEGORIAS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="kpi-row" style={{ marginTop: 14 }}>
              <KpiCard icon="◉" label="Citas pronosticadas" value={totalPronosticoFiltrado} color="blue" />
              <KpiCard icon="◈" label="Ingresos estimados" value={formatPrecio(ingresosPronosticoFiltrado)} color="green" />
              <KpiCard icon="◆" label="Días predictivos" value={diasPronosticadosFiltrados.length} color="amber" />
              <KpiCard icon="✦" label="Servicios distintos" value={serviciosPronosticados.length} color="violet" />
            </div>

            <div className="cal-grid" style={{ marginTop: 16 }}>
              {diasPronosticadosFiltrados.map(dia => {
                const activo = diaPronosticoSeleccionado === dia.fechaISO;

                return (
                  <div
                    key={dia.fechaISO}
                    className={`cal-cell filled${activo ? ' selec' : ''}${dia.citas.length === 0 ? ' vacio' : ''}`}
                    onClick={() => setDiaPronosticoSeleccionado(dia.fechaISO)}
                  >
                    <div className="cal-num">{new Date(dia.fechaISO + 'T00:00:00').getDate()}</div>
                    <div className="cal-descanso" style={{ marginBottom: 4 }}>
                      {nombreMesAnio(dia.fechaISO).split(' ')[0]}
                    </div>
                    <div className="cal-citas">
                      {dia.citas.length} cita{dia.citas.length !== 1 ? 's' : ''}
                    </div>
                    <div className="cal-dots">
                      {[...Array(Math.min(dia.citas.length, 5))].map((_, i) => (
                        <span key={i} className="cal-dot" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {diaPronosticoSeleccionado && (
              <div className="dia-panel" style={{ marginTop: 18 }}>
                <div className="dia-panel-title">
                  Citas pronosticadas para {formatFechaCorta(diaPronosticoSeleccionado)}
                </div>
                <div className="dia-panel-sub">
                  {citasDiaPronostico.length} cita{citasDiaPronostico.length !== 1 ? 's' : ''} estimada{citasDiaPronostico.length !== 1 ? 's' : ''}
                </div>

                <div className="table-wrap" style={{ marginTop: 10 }}>
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Hora estimada</th>
                        <th>Servicio pronosticado</th>
                        <th>Categoría</th>
                        <th>Ingreso estimado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasDiaPronostico.length === 0 ? (
                        <tr>
                          <td colSpan={5}>
                            <div className="no-data">No hay citas pronosticadas para esta categoría en este día.</div>
                          </td>
                        </tr>
                      ) : (
                        citasDiaPronostico.map((cita, i) => (
                          <tr key={`${cita.fechaISO}-${cita.hora}-${i}`}>
                            <td className="td-n">{i + 1}</td>
                            <td className="td-mono td-hora">{cita.hora}</td>
                            <td className="td-bold">{cita.servicio}</td>
                            <td><CatBadge cat={cita.categoria} /></td>
                            <td className="td-precio">{formatPrecio(cita.precio)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Servicios con más demanda del pronóstico</div>
                  <div className="card-sub">Ordenados por citas estimadas en los próximos 7 días.</div>
                </div>
              </div>

              <div className="table-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Servicio</th>
                      <th>Categoría</th>
                      <th>Citas</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviciosPronosticados.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="no-data">Sin servicios pronosticados para este filtro.</div>
                        </td>
                      </tr>
                    ) : (
                      serviciosPronosticados.map((item, i) => (
                        <tr key={item.servicio}>
                          <td className="td-n"><RankBadge n={i + 1} /></td>
                          <td className="td-bold">{item.servicio}</td>
                          <td><CatBadge cat={item.categoria} /></td>
                          <td className="td-accent">{item.citas}</td>
                          <td className="td-precio">{formatPrecio(item.ingresos)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Categorías con más demanda del pronóstico</div>
                  <div className="card-sub">Resumen general por categoría en los próximos 7 días.</div>
                </div>
              </div>

              <div className="table-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Categoría</th>
                      <th>Citas</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoriasPronosticadas.map((item, i) => (
                      <tr key={item.categoria}>
                        <td className="td-n"><RankBadge n={i + 1} /></td>
                        <td><CatBadge cat={item.categoria} /></td>
                        <td className="td-accent">{item.citas}</td>
                        <td className="td-precio">{formatPrecio(item.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Tabla de predicción por día</div>
                <div className="card-sub">Verificación matemática de cada día pronosticado.</div>
              </div>
            </div>

            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>t</th>
                    <th>Cálculo</th>
                    <th>Valor exacto</th>
                    <th>Citas estimadas</th>
                  </tr>
                </thead>
                <tbody>
                  {modelo.proximo7.map((d, i) => (
                    <tr key={d.fechaISO}>
                      <td className="td-n">{i + 1}</td>
                      <td className="td-mono">{d.fechaISO}</td>
                      <td>{d.t}</td>
                      <td>{modelo.C1}e<sup>({modelo.k.toFixed(4)} · {d.t})</sup></td>
                      <td>{d.valorExacto.toFixed(2)}</td>
                      <td className="td-accent">{d.valor} citas</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ══════════════════════════════════════════
   TABLA DEL MODELO DIARIO ADAPTATIVA
══════════════════════════════════════════ */

function TablaValoresModeloDiario({ modelo }: { modelo: any }) {
  const kRedondeada = modelo.k.toFixed(6);
  const kCorta = modelo.k.toFixed(4);
  const porcentajeDiario = ((Math.exp(modelo.k) - 1) * 100).toFixed(2);

  return (
    <div className="card modelo-card">
      <div className="card-head">
        <div>
          <div className="card-title">Desarrollo del modelo por día hábil</div>
          <div className="card-sub">
            Modelo adaptado al rango seleccionado: del <strong>{modelo.inicial.fechaISO}</strong> al <strong>{modelo.observado.fechaISO}</strong>
          </div>
          <div className="card-sub">P(t) = {modelo.C1}e<sup>({kCorta} · t)</sup></div>
        </div>

        <span className="badge-count">
          {modelo.k > 0 ? '+' : ''}{porcentajeDiario}% diario
        </span>
      </div>

      <div className="table-wrap">
        <table className="tbl modelo-tbl">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Citas / calculado</th>
              <th>Descripción</th>
              <th>Fecha / t</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>C1</strong></td>
              <td className="td-accent">{modelo.C1} citas</td>
              <td>Condición inicial del modelo. Es el primer día con citas dentro del rango seleccionado.</td>
              <td>{modelo.inicial.fechaISO} / t = 0</td>
            </tr>

            <tr>
              <td><strong>k</strong></td>
              <td>{modelo.Pob} citas observadas para calcular k</td>
              <td>
                k = ln({modelo.Pob} / {modelo.C1}) / {modelo.tObs}
                <br />
                k = {kRedondeada}
              </td>
              <td>{modelo.observado.fechaISO} / t = {modelo.tObs}</td>
            </tr>

            <tr>
              <td><strong>P1</strong></td>
              <td className="td-accent">{modelo.prediccionExacta.toFixed(2)} citas</td>
              <td>
                P({modelo.tPred}) = {modelo.C1}e<sup>({kCorta} · {modelo.tPred})</sup>
                <br />
                Resultado redondeado: {modelo.prediccionRedondeada} citas
              </td>
              <td>{modelo.fechaPrediccion} / t = {modelo.tPred}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, lineHeight: 1.7 }}>
        <strong>Procedimiento adaptado al rango seleccionado:</strong>
        <br />
        1. Se toma como condición inicial el día <strong>{modelo.inicial.fechaISO}</strong>, donde se registraron <strong>{modelo.C1} citas</strong>. A esta fecha se le asigna <strong>t = 0</strong>.
        <br />
        2. Se toma como dato observado el día <strong>{modelo.observado.fechaISO}</strong>, donde se registraron <strong>{modelo.Pob} citas</strong>. Como desde la fecha inicial hasta esta fecha transcurren <strong>{modelo.tObs} días hábiles</strong>, entonces <strong>t = {modelo.tObs}</strong>.
        <br />
        3. Se calcula la constante diaria: <strong>k = ln({modelo.Pob} / {modelo.C1}) / {modelo.tObs} = {kRedondeada}</strong>.
        <br />
        4. El modelo queda: <strong>P(t) = {modelo.C1}e<sup>({kCorta} · t)</sup></strong>.
        <br />
        5. Para predecir el día <strong>{modelo.fechaPrediccion}</strong>, se usa <strong>t = {modelo.tPred}</strong>.
        <br />
        6. Se sustituye: <strong>P({modelo.tPred}) = {modelo.prediccionExacta.toFixed(2)} citas</strong>.
        <br />
        7. Resultado final: para el día <strong>{modelo.fechaPrediccion}</strong> se estiman aproximadamente <strong>{modelo.prediccionRedondeada} citas</strong>.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ESTADÍSTICAS
══════════════════════════════════════════ */

function EstadisticasPage() {
  const [catBars, setCatBars] = useState('all');

  const porCat: Record<string, number> = {};
  CATEGORIAS.forEach(c => (porCat[c] = 0));
  TODOS.forEach(r => porCat[r.categoria]++);

  const sortedCat = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const maxCat = sortedCat[0]?.[1] ?? 1;

  const porServ: Record<string, { count: number; ingresos: number; cat: string }> = {};
  TODOS.forEach(r => {
    if (!porServ[r.servicio]) porServ[r.servicio] = { count: 0, ingresos: 0, cat: r.categoria };
    porServ[r.servicio].count++;
    porServ[r.servicio].ingresos += r.precio;
  });

  const topServ10 = Object.entries(porServ).sort((a, b) => b[1].count - a[1].count).slice(0, 10);
  const maxServ = topServ10[0]?.[1].count ?? 1;

  const porCli: Record<string, number> = {};
  TODOS.forEach(r => {
    porCli[r.cliente] = (porCli[r.cliente] || 0) + 1;
  });
  const topCli = Object.entries(porCli).sort((a, b) => b[1] - a[1]).slice(0, 6);

  const porHora: Record<string, number> = {};
  HORAS.forEach(h => (porHora[h] = 0));
  TODOS.forEach(r => {
    porHora[r.hora] = (porHora[r.hora] || 0) + 1;
  });
  const horaTop = Object.entries(porHora).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const ingProm = Math.round(TOTAL_INGRESOS / TOTAL_CITAS);

  const donaData = {
    labels: CATEGORIAS,
    datasets: [
      {
        data: CATEGORIAS.map(c => porCat[c]),
        backgroundColor: CATEGORIAS.map(c => CAT_COLORS[c]),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 6
      }
    ]
  };

  const donaOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} citas` } }
    }
  };

  const mesesLabels = HIST_MESES.map(m => m.label.slice(0, 3));
  const barDatasets = catBars === 'all'
    ? CATEGORIAS.map(cat => ({
        label: cat,
        data: HIST_MESES.map(m => TODOS.filter(r => r.mes_num === m.mes_num && r.categoria === cat).length),
        backgroundColor: CAT_COLORS[cat],
        borderRadius: { topLeft: 3, topRight: 3 },
        stack: 's'
      }))
    : [
        {
          label: catBars,
          data: HIST_MESES.map(m => TODOS.filter(r => r.mes_num === m.mes_num && r.categoria === catBars).length),
          backgroundColor: CAT_COLORS[catBars],
          borderRadius: { topLeft: 5, topRight: 5 },
          stack: 's'
        }
      ];

  const barData = { labels: mesesLabels, datasets: barDatasets };
  const barOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  const ingData = {
    labels: HIST_MESES.map(m => m.label.slice(0, 3)),
    datasets: [
      {
        label: 'Ingresos',
        data: HIST_MESES.map(m => TODOS.filter(r => r.mes_num === m.mes_num).reduce((a, r) => a + r.precio, 0)),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const ingOpts: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { callback: (v: any) => `$${(v / 1000).toFixed(0)}k` }
      }
    }
  };

  return (
    <>
      <div className="kpi-row">
        <KpiCard icon="◉" label="Total citas" value={TOTAL_CITAS} color="blue" />
        <KpiCard icon="◈" label="Ingresos totales" value={formatPrecio(TOTAL_INGRESOS)} color="green" />
        <KpiCard icon="◆" label="Ticket promedio" value={formatPrecio(ingProm)} color="amber" />
        <KpiCard icon="✦" label="Hora pico" value={horaTop} color="violet" />
        <KpiCard icon="▲" label="Servicios activos" value={Object.keys(porServ).length} color="rose" />
        <KpiCard icon="●" label="Categorías" value={CATEGORIAS.length} color="teal" />
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Top 10 servicios más demandados</div>
            <div className="card-sub">Ordenados por número de citas acumuladas.</div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Servicio</th>
                <th>Categoría</th>
                <th>Citas</th>
                <th>Ingresos</th>
                <th>Participación</th>
              </tr>
            </thead>
            <tbody>
              {topServ10.map(([serv, data], i) => (
                <tr key={serv}>
                  <td className="td-n"><RankBadge n={i + 1} /></td>
                  <td className="td-bold">{serv}</td>
                  <td><CatBadge cat={data.cat} /></td>
                  <td className="td-accent">{data.count}</td>
                  <td className="td-precio">{formatPrecio(data.ingresos)}</td>
                  <td>
                    <div className="pct-bar-wrap">
                      <div className="pct-bar">
                        <div
                          className="pct-fill"
                          style={{ width: `${(data.count / maxServ) * 100}%`, background: CAT_COLORS[data.cat] }}
                        />
                      </div>
                      <span className="pct-label">{((data.count / TOTAL_CITAS) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Ranking por categoría</div>
              <div className="card-sub">Citas totales acumuladas.</div>
            </div>
          </div>

          <div className="top-list">
            {sortedCat.map(([cat, n], i) => (
              <div key={cat} className="top-item">
                <RankBadge n={i + 1} />
                <div className="top-info">
                  <div className="top-name">{cat}</div>
                  <div className="top-sub">{n} citas · {((n / TOTAL_CITAS) * 100).toFixed(1)}%</div>
                </div>
                <div className="bar-col">
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${(n / maxCat) * 100}%`, background: CAT_COLORS[cat] }} />
                  </div>
                </div>
                <span className="top-val" style={{ color: CAT_COLORS[cat] }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Distribución de categorías</div>
              <div className="card-sub">Participación porcentual.</div>
            </div>
          </div>

          <div style={{ height: 220 }}>
            <Doughnut data={donaData} options={donaOpts} />
          </div>

          <div className="dona-legend">
            {CATEGORIAS.map(c => (
              <div key={c} className="dona-item">
                <span className="dona-dot" style={{ background: CAT_COLORS[c] }} />
                <span>{c.split(' ')[0]}</span>
                <span className="dona-pct">{((porCat[c] / TOTAL_CITAS) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Citas por mes y categoría</div>
              <div className="card-sub">Barras apiladas.</div>
            </div>

            <select className="sel-inp sel-sm" value={catBars} onChange={e => setCatBars(e.target.value)}>
              <option value="all">Todas</option>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c.split(' ')[0]}</option>
              ))}
            </select>
          </div>

          <div style={{ height: 240 }}>
            <Bar data={barData} options={barOpts} />
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Ingresos por mes</div>
              <div className="card-sub">Tendencia de facturación.</div>
            </div>
          </div>

          <div style={{ height: 240 }}>
            <Line data={ingData} options={ingOpts} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Clientes frecuentes</div>
            <div className="card-sub">Ordenados por número de visitas.</div>
          </div>
        </div>

        <div className="clientes-grid">
          {topCli.map(([cli, n], i) => {
            const av = AVATAR_COLORS[i % 5];
            const inis = cli.split(' ').map(p => p[0]).slice(0, 2).join('');
            const ingCli = TODOS.filter(r => r.cliente === cli).reduce((a, r) => a + r.precio, 0);

            return (
              <div key={cli} className="cli-card">
                <div className="cli-top">
                  <div className="avatar" style={{ background: av.bg, color: av.fg, width: 44, height: 44, fontSize: 14 }}>
                    {inis}
                  </div>
                  <RankBadge n={i + 1} />
                </div>
                <div className="cli-name">{cli}</div>
                <div className="cli-stats">
                  <div className="cli-stat">
                    <span className="cli-stat-val" style={{ color: '#2563eb' }}>{n}</span>
                    <span className="cli-stat-label">visitas</span>
                  </div>
                  <div className="cli-stat">
                    <span className="cli-stat-val" style={{ color: '#16a34a' }}>{formatPrecio(ingCli)}</span>
                    <span className="cli-stat-label">total gastado</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════
   COMPONENTES REUTILIZABLES
══════════════════════════════════════════ */

function TablaCitas({ citas, mostrarFecha }: { citas: Cita[]; mostrarFecha: boolean }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>#</th>
            {mostrarFecha && <th>Fecha</th>}
            <th>Hora</th>
            <th>Cliente</th>
            <th>Servicio</th>
            <th>Categoría</th>
            <th>Precio</th>
          </tr>
        </thead>
        <tbody>
          {citas.length === 0 ? (
            <tr>
              <td colSpan={mostrarFecha ? 7 : 6}>
                <div className="no-data">Sin resultados para este filtro.</div>
              </td>
            </tr>
          ) : (
            citas.map((r, i) => (
              <tr key={`${r.fechaISO}-${r.hora}-${i}`}>
                <td className="td-n">{i + 1}</td>
                {mostrarFecha && <td className="td-mono">{r.fechaISO}</td>}
                <td className="td-mono td-hora">{r.hora}</td>
                <td>
                  <div className="client-cell">
                    <div className="avatar" style={{ background: AVATAR_COLORS[i % 5].bg, color: AVATAR_COLORS[i % 5].fg }}>
                      {r.iniciales}
                    </div>
                    <span className="td-name">{r.cliente}</span>
                  </div>
                </td>
                <td>{r.servicio}</td>
                <td><CatBadge cat={r.categoria} /></td>
                <td className="td-precio">{formatPrecio(r.precio)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  sub
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function CatBadge({ cat }: { cat: string }) {
  return (
    <span className="cat-badge" style={{ background: CAT_BG[cat] || '#f3f4f6', color: CAT_COLORS[cat] || '#374151' }}>
      {cat}
    </span>
  );
}

function RankBadge({ n }: { n: number }) {
  const cls = n === 1 ? 'rank-gold' : n === 2 ? 'rank-silver' : n === 3 ? 'rank-bronze' : 'rank-plain';
  return <div className={`rank-badge ${cls}`}>{n}</div>;
}
