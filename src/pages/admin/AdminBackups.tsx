// src/pages/admin/AdminBackups.tsx
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Database, Download, Trash2, Loader2, Calendar, FileType, 
  AlertTriangle, Clock, Save, X, CheckCircle,
  Activity, Server, Eraser, Settings2, Power, PowerOff,
  Users, Package, Scissors, Timer, CalendarDays, Terminal
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AdminBackups.css';

interface Backup {
  fileName: string;
  public_id: string;
  url: string;
  size: string;
  createdAt: string;
  type: string;
}

interface BackupLog {
  id: number;
  event_type: 'MANUAL' | 'AUTO' | 'CLEANUP' | 'ERROR' | 'CONFIG';
  description: string;
  created_at: string;
}

const DB_TABLES = [
  { id: 'auth.users', label: 'Usuarios (Clientes y Roles)', icon: Users },
  { id: 'inventory.products', label: 'Inventario de Productos', icon: Package },
  { id: 'operations.services', label: 'Catálogo de Servicios', icon: Scissors },
  { id: 'operations.appointments', label: 'Citas y Agenda', icon: Calendar }
];

const AdminBackups = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [totalSpace, setTotalSpace] = useState<string>('0.00 KB');
  const [loading, setLoading] = useState<boolean>(true);
  
  const [activeTab, setActiveTab] = useState<'manual' | 'automatico' | 'logs'>('manual');
  
  const [autoHora, setAutoHora] = useState<string>('23:00');
  const [autoFrecuencia, setAutoFrecuencia] = useState<string>('diario');
  const [customFrecuencia, setCustomFrecuencia] = useState<number>(3);
  const [autoRetencion, setAutoRetencion] = useState<number | 'otro'>(5);
  const [customRetencion, setCustomRetencion] = useState<number>(7);
  const [autoActivo, setAutoActivo] = useState<boolean>(false);
  const [timeToNext, setTimeToNext] = useState<string>('--:--');

  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [useDefaultName, setUseDefaultName] = useState<boolean>(true);
  const [backupName, setBackupName] = useState<string>('');
  const [backupType, setBackupType] = useState<'full' | 'custom'>('full');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  const [creationState, setCreationState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteState, setDeleteState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [backupToDelete, setBackupToDelete] = useState<{ id: string, name: string } | null>(null);

  const [globalAction, setGlobalAction] = useState<{show: boolean, status: 'loading' | 'success', title: string, desc: string}>({
    show: false, status: 'loading', title: '', desc: ''
  });

  const formatLocalTime = (dateStr: string) => {
    if (!dateStr) return '';
    const safeDateStr = dateStr.includes('Z') ? dateStr : dateStr + 'Z';
    return new Date(safeDateStr).toLocaleString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
      timeZone: 'America/Mexico_City'
    });
  };

  const formatStopwatch = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getProgressText = (prog: number) => {
    if (prog < 25) return "Conectando con la base de datos...";
    if (prog < 60) return "Extrayendo y comprimiendo información...";
    if (prog < 90) return "Enviando archivo seguro a la nube...";
    return "Finalizando detalles...";
  };

  const fetchAllData = useCallback(async (isBackgroundUpdate = false) => {
    try {
      if (!isBackgroundUpdate) setLoading(true);
      const [backupsRes, settingsRes] = await Promise.all([api.get('/backups'), api.get('/backups/settings')]);
      
      setBackups(backupsRes.data);
      setLogs(settingsRes.data.logs);
      setTotalSpace(settingsRes.data.spaceUsed);
      setAutoHora(settingsRes.data.config.hora);
      setAutoActivo(settingsRes.data.config.activo);
      
      setAutoFrecuencia(settingsRes.data.config.frecuencia || 'diario');
      setCustomFrecuencia(settingsRes.data.config.customFrecuencia || 3);

      const ret = settingsRes.data.config.diasRetencion;
      if (ret === 5 || ret === 15 || ret === 30) setAutoRetencion(ret);
      else { setAutoRetencion('otro'); setCustomRetencion(ret); }
    } catch (err) {
      console.error(err); toast.error('Error de conexión con el servidor');
    } finally {
      if (!isBackgroundUpdate) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(false); }, [fetchAllData]);

  useEffect(() => {
    if (!autoActivo) {
      setTimeToNext('Pausado');
      return;
    }
    const calculateTimeLeft = () => {
      const now = new Date();
      const [hours, minutes] = autoHora.split(':').map(Number);
      const nextBackup = new Date();
      nextBackup.setHours(hours, minutes, 0, 0);

      if (autoFrecuencia === 'diario') {
        if (now > nextBackup) nextBackup.setDate(nextBackup.getDate() + 1);
        const diffMs = nextBackup.getTime() - now.getTime();
        const h = Math.floor(diffMs / (1000 * 60 * 60));
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeToNext(`En ${h}h ${m}m`);
      } else if (autoFrecuencia === 'semanal') {
        setTimeToNext(`Domingos, ${autoHora}`);
      } else if (autoFrecuencia === 'mensual') {
        setTimeToNext(`Día 1, ${autoHora}`);
      } else {
        setTimeToNext(`Cada ${customFrecuencia} días, ${autoHora}`);
      }
    };

    calculateTimeLeft(); 
    const timerInterval = window.setInterval(calculateTimeLeft, 60000);
    return () => window.clearInterval(timerInterval);
  }, [autoHora, autoActivo, autoFrecuencia, customFrecuencia]);

  useEffect(() => {
    let progressInterval: number; let timeInterval: number;
    if (creationState === 'loading') {
      setProgress(0); setElapsedTime(0);
      timeInterval = window.setInterval(() => setElapsedTime(t => t + 1), 1000);
      progressInterval = window.setInterval(() => setProgress(p => (p < 90 ? p + 1.5 : 90)), 100);
    }
    return () => {
      if (progressInterval) window.clearInterval(progressInterval);
      if (timeInterval) window.clearInterval(timeInterval);
    };
  }, [creationState]);

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev => prev.includes(tableId) ? prev.filter(t => t !== tableId) : [...prev, tableId]);
  };

  const confirmCreateBackup = async () => {
    if (backupType === 'custom' && selectedTables.length === 0) return toast.error('Selecciona al menos una tabla.');
    setCreationState('loading');
    try {
      const payload = { customName: useDefaultName ? '' : backupName.trim(), tables: backupType === 'full' ? ['all'] : selectedTables };
      await api.post('/backups', payload);
      
      setProgress(100);
      setTimeout(() => {
        setCreationState('success'); fetchAllData(true);
        setTimeout(() => {
          setShowBackupModal(false); setCreationState('idle'); setBackupName('');
          setUseDefaultName(true); setBackupType('full'); setSelectedTables([]);
        }, 2000);
      }, 500);
    } catch (err) {
      console.error(err); toast.error('Error al generar el respaldo'); setCreationState('idle');
    }
  };

  const handleSaveSchedule = async () => {
    const diasFinales = autoRetencion === 'otro' ? customRetencion : autoRetencion;
    if (diasFinales < 1) return toast.error('Los días de retención deben ser mayor a 0');
    if (autoFrecuencia === 'otro' && customFrecuencia < 1) return toast.error('La frecuencia debe ser mayor a 0');

    setGlobalAction({ show: true, status: 'loading', title: 'Actualizando Configuración', desc: 'Guardando parámetros en el servidor...' });
    try {
      await api.post('/backups/schedule', { 
        hora: autoHora, diasRetencion: diasFinales, activo: autoActivo, 
        frecuencia: autoFrecuencia, customFrecuencia: customFrecuencia 
      });
      localStorage.setItem('horaRespaldoAuto', autoHora); 
      setGlobalAction({ show: true, status: 'success', title: '¡Actualizado!', desc: 'Motor automático configurado con éxito.' });
      fetchAllData(true);
      setTimeout(() => setGlobalAction(prev => ({ ...prev, show: false })), 2000);
    } catch (err) {
      console.error(err); setGlobalAction(prev => ({ ...prev, show: false })); toast.error('Error al guardar');
    }
  };

  const handleForceCleanup = async () => {
    setGlobalAction({ show: true, status: 'loading', title: 'Ejecutando Limpieza', desc: 'Eliminando respaldos antiguos...' });
    try {
      const res = await api.post('/backups/cleanup');
      setGlobalAction({ show: true, status: 'success', title: '¡Limpieza Completada!', desc: res.data.message });
      fetchAllData(true);
      setTimeout(() => setGlobalAction(prev => ({ ...prev, show: false })), 2500);
    } catch (err) {
      console.error(err); setGlobalAction(prev => ({ ...prev, show: false })); toast.error('Error en limpieza');
    }
  };

  const confirmDelete = async () => {
    if (!backupToDelete) return;
    setDeleteState('loading');
    try {
      await api.delete(`/backups?public_id=${backupToDelete.id}`);
      setDeleteState('success'); fetchAllData(true);
      setTimeout(() => { setShowDeleteModal(false); setDeleteState('idle'); setBackupToDelete(null); }, 2000);
    } catch (err) {
      console.error(err); setDeleteState('idle'); toast.error('Error al eliminar');
    }
  };

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'MANUAL': return <Database size={16} className="text-blue-500" />;
      case 'AUTO': return <Clock size={16} className="text-emerald-500" />;
      case 'CLEANUP': return <Trash2 size={16} className="text-amber-500" />;
      case 'CONFIG': return <Settings2 size={16} className="text-cyan-500" />;
      case 'ERROR': return <AlertTriangle size={16} className="text-rose-500" />;
      default: return <Activity size={16} className="text-slate-400" />;
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="spinner" size={32} /></div>;

  return (
    <div className="saas-container admin-backups-page relative">
      <Breadcrumbs />
      
      <div className="saas-header mb-6">
        <div>
          <p className="saas-eyebrow">Seguridad en la Nube</p>
          <h1 className="saas-title">Respaldos del Sistema</h1>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-lg border border-slate-200">
            <Server size={18} className="text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Espacio Ocupado</span>
              <span className="text-sm font-bold text-slate-700 leading-none mt-1">{totalSpace}</span>
            </div>
          </div>
          {activeTab === 'manual' && (
            <button className="btn-primary" onClick={() => setShowBackupModal(true)}>
              <Database size={18} /> <span className="hide-mobile">Nuevo Respaldo</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegación de pestañas sin morado */}
      <div className="tabs-container">
        <button onClick={() => setActiveTab('manual')} className={`tab-button ${activeTab === 'manual' ? 'tab-active' : ''}`}>
          Gestión Manual
        </button>
        <button onClick={() => setActiveTab('automatico')} className={`tab-button ${activeTab === 'automatico' ? 'tab-active' : ''}`}>
          Automatización
        </button>
        <button onClick={() => setActiveTab('logs')} className={`tab-button ${activeTab === 'logs' ? 'tab-active' : ''} flex items-center gap-2`}>
          <Terminal size={16} /> Log de Actividad
        </button>
      </div>

      {activeTab === 'automatico' && (
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 text-slate-800">
                <div className={`p-3 rounded-lg ${autoActivo ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {autoActivo ? <Power size={24} /> : <PowerOff size={24} />}
                </div>
                <div>
                  <h3 className="m-0 text-xl font-bold">Motor de Respaldos Automático</h3>
                  <p className="m-0 text-sm text-slate-500 mt-1">Configura rutinas en segundo plano para asegurar tus datos.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoActivo} onChange={(e) => setAutoActivo(e.target.checked)} />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-sm font-bold text-slate-700">{autoActivo ? 'Activado' : 'Pausado'}</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Hora de Ejecución</label>
                <input type="time" value={autoHora} onChange={(e) => setAutoHora(e.target.value)} disabled={!autoActivo} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Frecuencia</label>
                <div className="flex gap-2">
                  <select value={autoFrecuencia} onChange={(e) => setAutoFrecuencia(e.target.value)} disabled={!autoActivo} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400">
                    <option value="diario">Todos los días</option>
                    <option value="semanal">Semanal (Domingos)</option>
                    <option value="mensual">Mensual (Día 1)</option>
                    <option value="otro">Personalizado</option>
                  </select>
                  {autoFrecuencia === 'otro' && (
                    <input type="number" min="1" value={customFrecuencia} onChange={(e) => setCustomFrecuencia(Number(e.target.value))} disabled={!autoActivo} placeholder="Días" className="w-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400" title="Número de días" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Eliminar archivos de más de:</label>
                <div className="flex gap-2">
                  <select value={autoRetencion} onChange={(e) => setAutoRetencion(e.target.value === 'otro' ? 'otro' : Number(e.target.value))} disabled={!autoActivo} className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400">
                    <option value={5}>5 Días (Recomendado)</option>
                    <option value={15}>15 Días</option>
                    <option value={30}>1 Mes (30 Días)</option>
                    <option value="otro">Otro</option>
                  </select>
                  {autoRetencion === 'otro' && (
                    <input type="number" min="1" value={customRetencion} onChange={(e) => setCustomRetencion(Number(e.target.value))} disabled={!autoActivo} placeholder="Días" className="w-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400" />
                  )}
                </div>
              </div>

              <div className="flex items-end">
                <div className="w-full flex items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100 h-[50px]">
                  {autoFrecuencia === 'diario' ? <Timer size={22} className="text-blue-600 shrink-0" /> : <CalendarDays size={22} className="text-blue-600 shrink-0" />}
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider m-0">Siguiente Ejecución:</p>
                    <p className="text-base font-black text-blue-600 m-0 leading-none mt-0.5">{timeToNext}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-6 mt-4 border-t border-slate-100 gap-4">
              <button onClick={handleForceCleanup} className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-4 py-2.5 rounded-lg transition-colors">
                <Eraser size={18} /> Forzar Limpieza de Espacio Ahora
              </button>
              <button onClick={handleSaveSchedule} className="btn-save-config">
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden h-[600px] border border-slate-800">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-cyan-400" />
                <div>
                  <h3 className="m-0 text-sm font-bold tracking-widest text-slate-200">TERMINAL DE REGISTROS</h3>
                  <p className="text-[10px] text-slate-500 m-0 font-mono mt-1">/var/log/backups_operations.log</p>
                </div>
              </div>
              <Activity size={18} className="text-emerald-500 animate-pulse" />
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Activity size={40} className="mb-4 opacity-50" />
                  <p className="text-sm font-mono">Esperando actividad del sistema...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-4 items-start hover:bg-slate-800/50 p-2 rounded-lg transition-colors -mx-2">
                      <div className="mt-1 bg-slate-800 p-2 rounded-lg shadow-inner">
                        {getLogIcon(log.event_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="text-slate-200 text-[15px] m-0 leading-relaxed font-medium">{log.description}</p>
                          <span className="text-slate-500 text-xs font-mono shrink-0 whitespace-nowrap">
                            {formatLocalTime(log.created_at)}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded mt-2 inline-block
                          ${log.event_type === 'ERROR' ? 'bg-rose-500/20 text-rose-400' : 
                            log.event_type === 'AUTO' ? 'bg-emerald-500/20 text-emerald-400' : 
                            log.event_type === 'CLEANUP' ? 'bg-amber-500/20 text-amber-400' : 
                            'bg-cyan-500/20 text-cyan-400'}`}
                        >
                          [{log.event_type}]
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'logs' && (
        <div className="saas-table-card">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Nombre del Archivo</th>
                <th>Origen</th>
                <th>Fecha de Creación</th>
                <th>Tamaño</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.filter(b => activeTab === 'manual' ? b.type === 'Manual' : b.type === 'Automático').length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted" style={{ padding: '40px' }}>No hay archivos respaldados en la nube.</td></tr>
              ) : (
                backups.filter(b => activeTab === 'manual' ? b.type === 'Manual' : b.type === 'Automático').map((b: Backup) => (
                  <tr key={b.public_id}>
                    <td className="font-medium flex-cell">
                      <FileType size={18} className="text-blue-500" /> 
                      <span className="text-slate-800">{b.fileName}</span>
                    </td>
                    <td>
                      <span className={`badge-status ${b.type === 'Manual' ? 'badge-manual' : 'badge-auto'}`}>
                        {b.type}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm font-medium">
                      {formatLocalTime(b.createdAt)}
                    </td>
                    <td><span className="badge-gray font-mono text-xs">{b.size}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => {
                          const link = document.createElement('a'); link.href = b.url; link.download = b.fileName; link.target = '_blank';
                          document.body.appendChild(link); link.click(); document.body.removeChild(link);
                        }} className="btn-icon btn-download" title="Descargar"><Download size={18} /></button>
                        <button onClick={() => { setBackupToDelete({ id: b.public_id, name: b.fileName }); setShowDeleteModal(true); }} className="btn-icon btn-delete" title="Eliminar"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR RESPALDO */}
      {showBackupModal && createPortal(
        <div className="saas-modal-overlay">
          <div className="saas-modal-content">
            {creationState === 'idle' && (
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2>Crear Respaldo Manual</h2>
                  <button className="close-modal" onClick={() => setShowBackupModal(false)}><X size={20} /></button>
                </div>
                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block font-semibold text-sm text-slate-800 mb-3">Etiqueta o Nota del Respaldo</label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 text-sm mb-3">
                    <input type="checkbox" checked={useDefaultName} onChange={(e) => { setUseDefaultName(e.target.checked); if(e.target.checked) setBackupName(''); }} className="accent-blue-600 w-4 h-4 rounded" /> 
                    Generar nombre automáticamente
                  </label>
                  <input type="text" value={backupName} onChange={(e) => setBackupName(e.target.value)} placeholder="Ej. backup_precios_dic" disabled={useDefaultName} className={`w-full p-3 rounded-lg border outline-none transition-colors ${useDefaultName ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-800'}`} />
                </div>
                <div className="mb-6">
                  <label className="block font-semibold text-sm text-slate-800 mb-3">¿Qué deseas respaldar?</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                      <input type="radio" name="backupType" checked={backupType === 'full'} onChange={() => setBackupType('full')} className="accent-blue-600 w-4 h-4" /> Base de Datos Completa
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                      <input type="radio" name="backupType" checked={backupType === 'custom'} onChange={() => setBackupType('custom')} className="accent-blue-600 w-4 h-4" /> Tablas Específicas
                    </label>
                  </div>
                </div>
                {backupType === 'custom' && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
                    <p className="text-sm font-semibold text-slate-500 mb-3 m-0">Selecciona los módulos a respaldar:</p>
                    <div className="flex flex-col gap-3">
                      {DB_TABLES.map(table => (
                        <label key={table.id} className="flex items-center gap-3 cursor-pointer text-slate-700 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                          <input type="checkbox" checked={selectedTables.includes(table.id)} onChange={() => handleTableToggle(table.id)} className="accent-blue-600 w-4 h-4 rounded" />
                          <table.icon size={18} className="text-slate-400" />
                          <span className="font-medium">{table.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-8 border-t border-slate-100 pt-5">
                  <button onClick={() => setShowBackupModal(false)} className="btn-cancel">Cancelar</button>
                  <button onClick={confirmCreateBackup} className="btn-primary">Iniciar Respaldo</button>
                </div>
              </div>
            )}

            {creationState === 'loading' && (
              <div className="loading-feedback">
                <div className="relative mb-6">
                  <Loader2 size={64} className="animate-spin text-blue-500 mx-auto" />
                  <Database size={24} className="text-blue-800 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h2>Procesando Respaldo...</h2>
                <p className="h-6">{getProgressText(progress)}</p>
                <div className="w-full max-w-sm mx-auto bg-slate-100 rounded-full h-3.5 mb-3 overflow-hidden">
                  <div className="bg-blue-600 h-3.5 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between w-full max-w-sm mx-auto text-xs font-bold text-slate-400">
                  <span>{Math.floor(progress)}%</span>
                  <span className="flex items-center gap-1 font-mono"><Clock size={12}/> {formatStopwatch(elapsedTime)}</span>
                </div>
              </div>
            )}

            {creationState === 'success' && (
              <div className="success-feedback">
                <div className="success-icon"><CheckCircle size={70} /></div>
                <h2>¡Completado con Éxito!</h2>
                <p>Tu información ha sido respaldada en la nube.</p>
              </div>
            )}
          </div>
        </div>, document.body
      )}

      {/* MODAL ELIMINAR */}
      {showDeleteModal && createPortal(
        <div className="saas-modal-overlay">
          <div className="saas-modal-content">
            {deleteState === 'idle' && (
              <div className="text-center p-6">
                <div className="status-icon bg-rose-100"><AlertTriangle size={36} className="text-rose-500" /></div>
                <h2>¿Eliminar Respaldo?</h2>
                <p>Estás a punto de eliminar permanentemente de la nube el archivo <br/><strong>{backupToDelete?.name}</strong><br/>Esta acción no se puede deshacer.</p>
                <div className="saas-modal-actions">
                  <button onClick={() => { setShowDeleteModal(false); setBackupToDelete(null); }} className="btn-cancel">Cancelar</button>
                  <button onClick={confirmDelete} className="btn-delete-confirm">Eliminar</button>
                </div>
              </div>
            )}
            {deleteState === 'loading' && (
              <div className="loading-feedback">
                <Loader2 size={64} className="animate-spin text-rose-500 mb-6" />
                <h2>Eliminando Archivo...</h2>
                <p>Borrando datos permanentemente de la nube.</p>
              </div>
            )}
            {deleteState === 'success' && (
              <div className="success-feedback">
                <div className="success-icon"><CheckCircle size={64} /></div>
                <h2>¡Eliminado con Éxito!</h2>
              </div>
            )}
          </div>
        </div>, document.body
      )}

      {/* GLOBAL ACTION MODAL */}
      {globalAction.show && createPortal(
        <div className="saas-modal-overlay">
          <div className="global-feedback">
            {globalAction.status === 'loading' ? (
              <>
                <Loader2 size={64} className="animate-spin text-blue-500 mb-6" />
                <h2>{globalAction.title}</h2>
                <p>{globalAction.desc}</p>
              </>
            ) : (
              <>
                <div className="success-icon"><CheckCircle size={64} /></div>
                <h2>{globalAction.title}</h2>
                <p>{globalAction.desc}</p>
              </>
            )}
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default AdminBackups;
