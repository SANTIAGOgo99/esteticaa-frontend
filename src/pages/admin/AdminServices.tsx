// src/pages/admin/AdminServices.tsx
import { useState } from 'react';
import useSWR from 'swr'; 
import { Plus, Search, Edit2, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, Scissors, Image as ImageIcon, Tags, Clock } from 'lucide-react';
import api from '../../services/api';
import ServiceForm from '../../components/admin/ServiceForm';
import type { Servicio } from '../../components/admin/ServiceForm';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AdminServices.css';

const fetcher = (url: string) => api.get(url).then(res => res.data);

const CATEGORIAS_TABS = ["Todos", "Cortes y Estilizado", "Colorimetría", "Tratamientos Capilares", "Rostro (Cejas y Pestañas)", "Barbería", "General"];

const AdminServices = () => {
  const { data: servicios, error, isLoading, mutate } = useSWR('/services', fetcher);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todos');
  
  const [showModal, setShowModal] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Servicio | null>(null);
  
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [serviceToToggle, setServiceToToggle] = useState<Servicio | null>(null);

  const serviciosArray = servicios || [];

  // Filtrado doble (Por Búsqueda y Por Pestaña/Categoría)
  const filtered = serviciosArray.filter((s: Servicio) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = activeTab === 'Todos' || s.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleEdit = (serv: Servicio) => {
    setServiceToEdit(serv);
    setShowModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!serviceToToggle) return;
    try {
      await api.patch(`/services/${serviceToToggle.id}/toggle`);
      toast.success(`Estado actualizado`);
      mutate();
    } catch (error) {
      console.error(error); 
      toast.error('Error al cambiar el estado'); 
    } finally { 
      setShowToggleModal(false); 
      setServiceToToggle(null); 
    }
  };

  if (error) return <div className="p-10 flex justify-center text-rose-500 font-bold">Error al cargar servicios. Verifica tu conexión.</div>;
  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="admin-services-page p-4 md:p-8 max-w-7xl mx-auto">
      <Breadcrumbs />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <p className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-1 flex items-center gap-2">
            <Tags size={16} /> Catálogo
          </p>
          <h1 className="text-3xl font-black text-slate-800 m-0">Servicios y Tratamientos</h1>
        </div>
        <button 
          onClick={() => { setServiceToEdit(null); setShowModal(true); }}
          className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-200 transition-transform active:scale-95"
        >
          <Plus size={20} /> Nuevo Servicio
        </button>
      </div>
      
      {/* CONTROLES: BUSCADOR Y PESTAÑAS */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-4">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por servicio o descripción..." 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>

        {/* PESTAÑAS DE CATEGORÍA (Scrollable en móvil) */}
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIAS_TABS.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {tab} {tab === 'Todos' ? `(${serviciosArray.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA REDISEÑADA CON TAILWIND */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                <th className="p-4 font-bold border-b border-slate-200">Servicio</th>
                <th className="p-4 font-bold border-b border-slate-200">Categoría</th>
                <th className="p-4 font-bold border-b border-slate-200">Duración</th>
                <th className="p-4 font-bold border-b border-slate-200">Precio</th>
                <th className="p-4 font-bold border-b border-slate-200 text-center">Estado</th>
                <th className="p-4 font-bold border-b border-slate-200 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s: Servicio) => (
                <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${!s.is_active ? 'opacity-60 bg-slate-50/50' : ''}`}>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200"><ImageIcon size={20} /></div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800 m-0">{s.name}</p>
                        <p className="text-xs text-slate-500 m-0 w-48 truncate" title={s.description}>{s.description || 'Sin descripción'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100">
                      {s.category || 'General'}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Clock size={14}/> {s.duration_minutes} min
                    </span>
                  </td>

                  <td className="p-4 font-black text-emerald-600">
                    ${Number(s.price).toFixed(2)}
                  </td>

                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {s.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(s)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { setServiceToToggle(s); setShowToggleModal(true); }} 
                        className={`p-2 rounded-lg transition-colors ${s.is_active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={s.is_active ? 'Ocultar' : 'Activar'}
                      >
                        {s.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-medium">
                    <Scissors size={40} className="mx-auto text-slate-300 mb-3" />
                    No hay servicios en esta categoría.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {showModal && <ServiceForm onClose={() => setShowModal(false)} onSuccess={() => mutate()} serviceToEdit={serviceToEdit || undefined} />}

      {showToggleModal && serviceToToggle && (
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center animate-fade-in">
            {serviceToToggle.is_active ? <AlertCircle size={56} className="text-rose-500 mx-auto mb-4 bg-rose-50 p-3 rounded-full" /> : <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4 bg-emerald-50 p-3 rounded-full" />}
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{serviceToToggle.is_active ? '¿Ocultar servicio?' : '¿Activar servicio?'}</h2>
            <p className="text-slate-500 mb-6">El servicio <strong>{serviceToToggle.name}</strong> cambiará su visibilidad para los clientes.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowToggleModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full">Cancelar</button>
              <button onClick={confirmToggleStatus} className={`px-5 py-2.5 rounded-xl font-bold text-white w-full transition-transform active:scale-95 ${serviceToToggle.is_active ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
