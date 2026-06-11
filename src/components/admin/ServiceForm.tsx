// src/components/admin/ServiceForm.tsx
import { useState, useEffect } from 'react';
import { X, Save, Clock, DollarSign, Upload, Image as ImageIcon, Tag, Scissors } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ServiceForm.css';

export interface Servicio {
  id?: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price: string | number;
  category?: string; 
  is_active?: boolean; 
  image_url?: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  serviceToEdit?: Servicio | null; 
}

const CATEGORIAS_SERVICIOS = [
  "Cortes y Estilizado", "Colorimetría", "Tratamientos Capilares", "Rostro (Cejas y Pestañas)", "Barbería", "General"
];

const ServiceForm = ({ onClose, onSuccess, serviceToEdit }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', duration_minutes: '30', price: '', category: 'Cortes y Estilizado'
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (serviceToEdit) {
      setFormData({
        name: serviceToEdit.name,
        description: serviceToEdit.description || '',
        duration_minutes: serviceToEdit.duration_minutes.toString(),
        price: serviceToEdit.price.toString(),
        category: serviceToEdit.category || 'General'
      });
      if (serviceToEdit.image_url) setImagePreview(serviceToEdit.image_url);
    }
  }, [serviceToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🌟 VALIDACIONES PROFESIONALES (En lugar del letrero amarillo feo del navegador)
    if (!formData.name.trim()) {
      return toast.error('Por favor, ingresa el nombre del servicio.', { duration: 3000, position: 'top-center' });
    }
    if (!formData.duration_minutes || parseInt(formData.duration_minutes) < 5) {
      return toast.error('La duración debe ser de al menos 5 minutos.', { duration: 3000, position: 'top-center' });
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      return toast.error('El precio debe ser mayor a $0.00', { duration: 3000, position: 'top-center' });
    }

    setLoading(true);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (image) data.append('image', image);

    try {
      if (serviceToEdit?.id) {
        await api.put(`/services/${serviceToEdit.id}`, data);
        toast.success('Servicio actualizado correctamente');
      } else {
        await api.post('/services', data);
        toast.success('Servicio creado con éxito ✂️');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-start pt-10 pb-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative animate-fade-in overflow-hidden">
        
        {/* Cabecera */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 m-0 flex items-center gap-2">
            <Scissors size={20} className="text-amber-500"/> 
            {serviceToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 bg-white hover:bg-slate-200 rounded-full text-slate-500 transition-colors shadow-sm border border-slate-200"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6" noValidate>
          {/* 🌟 Nota: noValidate apaga los letreros amarillos del navegador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Nombre */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Servicio</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Ej. Corte de Cabello" />
            </div>

            {/* Categoría */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Tag size={16} className="text-slate-400"/> Categoría</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white">
                {CATEGORIAS_SERVICIOS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Clock size={16} className="text-slate-400"/> Duración (minutos)</label>
              <input type="number" min="5" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><DollarSign size={16} className="text-slate-400"/> Precio ($)</label>
              <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
            </div>

            {/* Descripción */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Descripción corta</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none resize-none" placeholder="¿Qué incluye este servicio?" />
            </div>

            {/* Foto */}
            <div className="col-span-1 md:col-span-2 border-t border-slate-100 pt-5 mt-2">
              <label className="block text-sm font-bold text-slate-700 mb-3">Foto del Servicio (Opcional)</label>
              <div className="flex gap-6 items-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-24 h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={28} />
                  </div>
                )}
                <div className="flex-1">
                  <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 w-fit transition-colors shadow-sm">
                    <Upload size={18} /> Seleccionar Imagen
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Formatos recomendados: JPG, PNG, WEBP.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 mt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-200 transition-transform active:scale-95 disabled:opacity-70">
              <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;