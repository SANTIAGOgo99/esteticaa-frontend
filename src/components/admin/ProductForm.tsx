import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Package, Tag, DollarSign, Layers, Ruler, AlertCircle, Image } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: any;
}

// Opciones de categorías predefinidas (igual que en el filtro de productos)
const CATEGORIAS_OPCIONES = [
  { value: '', label: 'Sin categoría' },
  { value: 'Cuidado Capilar', label: 'Cuidado Capilar' },
  { value: 'Fijación y Peinado', label: 'Fijación y Peinado' },
  { value: 'Cuidado de Barba', label: 'Cuidado de Barba' },
  { value: 'Herramientas', label: 'Herramientas' },
  { value: 'Otros', label: 'Otros' },
];

const ProductForm = ({ onClose, onSuccess, productToEdit }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    min_stock: '',
    size: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        brand: productToEdit.brand || '',
        category: productToEdit.category || '',
        price: productToEdit.price?.toString() || '',
        stock: productToEdit.stock?.toString() || '',
        min_stock: productToEdit.min_stock?.toString() || '',
        size: productToEdit.size || '',
        image: null,
      });
      if (productToEdit.image_url) setImagePreview(productToEdit.image_url);
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('brand', formData.brand);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('min_stock', formData.min_stock);
      data.append('size', formData.size);
      if (formData.image) data.append('image', formData.image);

      if (productToEdit) {
        await api.put(`/products/${productToEdit.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Producto actualizado correctamente');
      } else {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Producto creado correctamente');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#1a1a1a] to-[#2d2d2d] text-white">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-[#c9a87c]" />
            <div>
              <h2 className="text-xl font-bold m-0">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <p className="text-xs text-gray-300 mt-0.5">Completa los datos del producto</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre */}
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Tag size={14} className="inline mr-1 text-[#c9a87c]" /> Nombre *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Shampoo Hidratante"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50 focus:border-transparent transition"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Marca *</label>
              <input
                type="text"
                name="brand"
                required
                value={formData.brand}
                onChange={handleChange}
                placeholder="Ej: L'Oréal Professionnel"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50"
              />
            </div>

            {/* Categoría (ahora es un select) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50 bg-white cursor-pointer"
              >
                {CATEGORIAS_OPCIONES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Tamaño */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Ruler size={14} className="inline mr-1 text-[#c9a87c]" /> Tamaño / Volumen
              </label>
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="Ej: 250ml, 500ml, 1L"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <DollarSign size={14} className="inline mr-1 text-[#c9a87c]" /> Precio *
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <Layers size={14} className="inline mr-1 text-[#c9a87c]" /> Stock *
              </label>
              <input
                type="number"
                name="stock"
                required
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50"
              />
            </div>

            {/* Stock mínimo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                <AlertCircle size={14} className="inline mr-1 text-[#c9a87c]" /> Stock mínimo
              </label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                placeholder="Ej: 5"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#c9a87c]/50"
              />
            </div>

            {/* Imagen */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Image size={14} className="inline mr-1 text-[#c9a87c]" /> Imagen del producto
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {imagePreview && (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-[#c9a87c]/30 shadow-md">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-5 py-2.5 transition-colors">
                  <Upload size={18} className="text-[#c9a87c]" />
                  <span className="text-sm font-medium">{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }); }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#1a1a1a] text-white font-semibold hover:bg-[#c9a87c] hover:text-[#1a1a1a] transition-all flex items-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {productToEdit ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;