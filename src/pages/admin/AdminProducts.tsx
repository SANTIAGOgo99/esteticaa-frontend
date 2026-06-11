import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import useSWR from 'swr';
import { 
  Plus, Search, Edit2, Package, Loader2, Filter, Eye, EyeOff, 
  AlertCircle, CheckCircle2, Download, Upload, X, FileDown, 
  AlertTriangle, PackageCheck, Image as ImageIcon, CheckCircle, 
  Layers
} from 'lucide-react';
import api from '../../services/api';
import ProductForm from '../../components/admin/ProductForm';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import './AdminProducts.css';

interface Producto {
  id: number;
  name: string;
  brand: string;
  category?: string;
  price: string | number;
  stock: number;
  size?: string;
  is_active: boolean;
  image_url?: string;
}

interface PreviewItem extends Producto {
  _status: 'nuevo' | 'repetido';
  _selected: boolean;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

const AdminProducts = () => {
  const { data: productos, error, isLoading, mutate } = useSWR('/products', fetcher);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); 
  const [showModal, setShowModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Producto | null>(null);
  
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [productToToggle, setProductToToggle] = useState<Producto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCols, setExportCols] = useState({
    id: true, name: true, brand: true, category: true, price: true, stock: true, size: true, is_active: true
  });

  const [globalAction, setGlobalAction] = useState<{show: boolean, status: 'loading' | 'success', title: string, desc: string}>({
    show: false, status: 'loading', title: '', desc: ''
  });

  const productosArray = productos || [];

  const filtered = productosArray.filter((p: Producto) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (prod: Producto) => {
    setProductToEdit(prod);
    setShowModal(true);
  };

  const handleOpenExportModal = () => {
    if (productosArray.length === 0) return toast.error('No tienes ningún producto en inventario.');
    if (filtered.length === 0) return toast.error('Ningún producto coincide con la búsqueda.');
    setShowExportModal(true);
  };

  const downloadTemplate = () => {
    const headers = "Nombre,Marca,Categoría,Precio,Stock,Tamaño,Estado\n";
    const exampleRow = "Shampoo de Ejemplo,L'Oréal,Cuidado Capilar,250.50,15,250ml,Activo\n";
    const blob = new Blob(["\uFEFF" + headers + exampleRow], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.setAttribute('download', 'plantilla_productos.csv');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast.success('Plantilla descargada');
  };

  const confirmExportCSV = async () => {
    setShowExportModal(false);
    setGlobalAction({ show: true, status: 'loading', title: 'Exportando Inventario', desc: 'Generando archivo Excel con tus productos...' });

    try {
      const cols = [];
      if (exportCols.id) cols.push('ID');
      if (exportCols.name) cols.push('Nombre');
      if (exportCols.brand) cols.push('Marca');
      if (exportCols.category) cols.push('Categoría');
      if (exportCols.price) cols.push('Precio');
      if (exportCols.stock) cols.push('Stock');
      if (exportCols.size) cols.push('Tamaño');
      if (exportCols.is_active) cols.push('Estado');
      
      const csvHeaders = cols.join(',') + '\n';
      const escape = (text: string | number | boolean | undefined): string => `"${String(text || '').replace(/"/g, '""')}"`;

      const csvRows = filtered.map((p: Producto) => {
        const row = [];
        if (exportCols.id) row.push(p.id);
        if (exportCols.name) row.push(escape(p.name));
        if (exportCols.brand) row.push(escape(p.brand));
        if (exportCols.category) row.push(escape(p.category));
        if (exportCols.price) row.push(p.price);
        if (exportCols.stock) row.push(p.stock);
        if (exportCols.size) row.push(escape(p.size));
        if (exportCols.is_active) row.push(p.is_active ? 'Activo' : 'Inactivo');
        return row.join(',');
      }).join('\n');
      
      const blob = new Blob(["\uFEFF" + csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
      const defaultFileName = `inventario_${new Date().getTime()}.csv`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', defaultFileName);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      
      setGlobalAction({ show: true, status: 'success', title: '¡Exportación Exitosa!', desc: 'Tu inventario ha sido exportado correctamente.' });
      setTimeout(() => setGlobalAction(prev => ({ ...prev, show: false })), 2500);

    } catch (error) { 
      console.error(error);
      setGlobalAction(prev => ({ ...prev, show: false }));
      toast.error('Error al generar el archivo'); 
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'preview'); 

    setGlobalAction({ show: true, status: 'loading', title: 'Analizando Archivo', desc: 'Leyendo estructura del documento CSV...' });

    try {
      const res = await api.post('/products/import/csv', formData);
      
      const combined: PreviewItem[] = [
        ...res.data.nuevos.map((p: Producto) => ({ ...p, _status: 'nuevo' as const, _selected: true })),
        ...res.data.repetidos.map((p: Producto) => ({ ...p, _status: 'repetido' as const, _selected: false }))
      ];
      
      setGlobalAction(prev => ({ ...prev, show: false }));

      if (combined.length === 0) {
        toast.error('No se encontraron productos válidos. Verifica que el archivo no esté vacío.', { duration: 5000 });
      } else {
        setPreviewItems(combined);
      }

    } catch (error) { 
      console.error(error);
      setGlobalAction(prev => ({ ...prev, show: false }));
      toast.error('Error al leer el archivo CSV'); 
    }
    e.target.value = ''; 
  };

  const togglePreviewSelection = (index: number) => {
    const updated = [...previewItems];
    updated[index]._selected = !updated[index]._selected;
    setPreviewItems(updated);
  };

  const toggleAllPreview = (select: boolean) => {
    setPreviewItems(previewItems.map(p => ({ ...p, _selected: select })));
  };

  const confirmImport = async (type: 'ignore' | 'update' | 'selection') => {
    let fileToSend = selectedFile;
    let actionType = type;

    if (type === 'selection') {
      const selectedItems = previewItems.filter(p => p._selected);
      if (selectedItems.length === 0) return toast.error('Selecciona al menos un producto para importar');

      const headers = "Nombre,Marca,Categoría,Precio,Stock,Tamaño,Estado\n";
      const rows = selectedItems.map(p => `"${p.name}","${p.brand || ''}","${p.category || ''}",${p.price},${p.stock},"${p.size || ''}","Activo"`).join('\n');
      const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
      fileToSend = new File([blob], 'selected_import.csv', { type: 'text/csv' });
      actionType = 'update'; 
    }

    if (!fileToSend) return;

    setGlobalAction({ show: true, status: 'loading', title: 'Procesando Importación', desc: 'Guardando productos en la base de datos...' });

    try {
      const formData = new FormData();
      formData.append('file', fileToSend);
      formData.append('action', actionType); 
      await api.post('/products/import/csv', formData);
      
      mutate();
      setPreviewItems([]); 
      setSelectedFile(null);

      const itemsCount = type === 'selection' ? previewItems.filter(p => p._selected).length : 'todos los';
      
      setGlobalAction({ show: true, status: 'success', title: '¡Importación Completada!', desc: `Se integraron ${itemsCount} productos a tu inventario.` });
      setTimeout(() => setGlobalAction(prev => ({ ...prev, show: false })), 2500);

    } catch(error) { 
      console.error(error);
      setGlobalAction(prev => ({ ...prev, show: false }));
      toast.error('Error al procesar la importación'); 
    }
  };

  const confirmToggleStatus = async () => {
    if (!productToToggle) return;
    try {
      await api.patch(`/products/${productToToggle.id}/toggle`);
      toast.success(`Estado actualizado`);
      mutate();
    } catch (error) { 
      console.error(error);
      toast.error('Error al cambiar estado'); 
    } 
    finally { setShowToggleModal(false); setProductToToggle(null); }
  };

  if (error) return <div className="p-10 flex justify-center text-rose-500 font-bold">Error al cargar productos. Verifica tu conexión.</div>;
  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="admin-products-page p-4 md:p-8 max-w-7xl mx-auto">
      <Breadcrumbs />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <p className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-1 flex items-center gap-2">
            <Package size={16} /> Inventario
          </p>
          <h1 className="text-3xl font-black text-slate-800 m-0">Inventario de Productos ({filtered.length})</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={downloadTemplate} className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition">
            <FileDown size={18} /> Plantilla
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition">
            <Upload size={18} /> Importar CSV
          </button>
          <button onClick={handleOpenExportModal} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition">
            <Download size={18} /> Exportar CSV
          </button>
          <button onClick={() => { setProductToEdit(null); setShowModal(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-transform active:scale-95">
            <Plus size={20} /> Nuevo Producto
          </button>
        </div>
      </div>
      
      {/* CONTROLES: BÚSQUEDA + FILTRO SELECT */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o marca..." 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer font-medium text-slate-700"
          >
            <option value="">Todas las Categorías</option>
            <option value="Cuidado Capilar">Cuidado Capilar</option>
            <option value="Fijación y Peinado">Fijación y Peinado</option>
            <option value="Cuidado de Barba">Cuidado de Barba</option>
            <option value="Herramientas">Herramientas</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest">
                <th className="p-4 font-bold border-b border-slate-200">Imagen</th>
                <th className="p-4 font-bold border-b border-slate-200">Producto</th>
                <th className="p-4 font-bold border-b border-slate-200">Marca</th>
                <th className="p-4 font-bold border-b border-slate-200">Categoría</th>
                <th className="p-4 font-bold border-b border-slate-200">Tamaño</th>
                <th className="p-4 font-bold border-b border-slate-200">Precio</th>
                <th className="p-4 font-bold border-b border-slate-200">Stock</th>
                <th className="p-4 font-bold border-b border-slate-200 text-center">Estado</th>
                <th className="p-4 font-bold border-b border-slate-200 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p: Producto) => (
                <tr key={p.id} className={`hover:bg-slate-50 transition-colors ${!p.is_active ? 'opacity-60 bg-slate-50/50' : ''}`}>
                  <td className="p-4">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover rounded-xl border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-slate-400" />
                      {p.name}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">{p.brand}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100">
                      {p.category || 'General'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{p.size || '—'}</td>
                  <td className="p-4 font-black text-emerald-600">${Number(p.price).toFixed(2)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Layers size={14}/> {p.stock} pzas
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {p.is_active ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { setProductToToggle(p); setShowToggleModal(true); }} 
                        className={`p-2 rounded-lg transition-colors ${p.is_active ? 'text-rose-500 hover:bg-rose-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                        title={p.is_active ? 'Ocultar' : 'Activar'}
                      >
                        {p.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-500 font-medium">
                    <Package size={40} className="mx-auto text-slate-300 mb-3" />
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR/EDITAR PRODUCTO */}
      {showModal && createPortal(
        <ProductForm onClose={() => setShowModal(false)} onSuccess={() => mutate()} productToEdit={productToEdit} />, 
        document.body
      )}

      {/* MODAL EXPORTACIÓN */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center animate-fade-in">
            <Download size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Exportar Inventario</h2>
            <p className="text-slate-500 mb-6">Selecciona las columnas que deseas incluir en tu archivo CSV:</p>
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              {Object.keys(exportCols).map((col) => (
                <label key={col} className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input type="checkbox" checked={exportCols[col as keyof typeof exportCols]} onChange={() => setExportCols({...exportCols, [col]: !exportCols[col as keyof typeof exportCols]})} className="accent-indigo-600" />
                  <span className="text-sm">{col === 'id' ? 'ID Producto' : col === 'name' ? 'Nombre' : col === 'brand' ? 'Marca' : col === 'category' ? 'Categoría' : col === 'price' ? 'Precio' : col === 'stock' ? 'Stock' : col === 'size' ? 'Tamaño' : 'Estado'}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowExportModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full">Cancelar</button>
              <button onClick={confirmExportCSV} className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 w-full transition-transform active:scale-95">Guardar Archivo</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* MODAL VISTA PREVIA IMPORTACIÓN */}
      {previewItems.length > 0 && createPortal(
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Vista Previa de Importación</h2>
              <button onClick={() => setPreviewItems([])} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-4 border-b flex gap-4 flex-wrap bg-slate-50">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold"><CheckCircle2 size={16} className="inline mr-1" /> Nuevos: {previewItems.filter(p => p._status === 'nuevo').length}</span>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold"><AlertTriangle size={16} className="inline mr-1" /> Repetidos: {previewItems.filter(p => p._status === 'repetido').length}</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold"><PackageCheck size={16} className="inline mr-1" /> Seleccionados: {previewItems.filter(p => p._selected).length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3"><input type="checkbox" onChange={(e) => toggleAllPreview(e.target.checked)} checked={previewItems.length > 0 && previewItems.every(p => p._selected)} /></th>
                    <th className="p-3 text-left">Estado</th>
                    <th className="p-3 text-left">Producto</th>
                    <th className="p-3 text-left">Marca</th>
                    <th className="p-3 text-left">Precio</th>
                    <th className="p-3 text-left">Stock</th>
                    <th className="p-3 text-left">Tamaño</th>
                  </tr>
                </thead>
                <tbody>
                  {previewItems.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3"><input type="checkbox" checked={item._selected} onChange={() => togglePreviewSelection(idx)} /></td>
                      <td className="p-3">{item._status === 'nuevo' ? <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Nuevo</span> : <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Repetido</span>}</td>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.brand || '-'}</td>
                      <td className="p-3 font-semibold text-emerald-600">${Number(item.price).toFixed(2)}</td>
                      <td className="p-3 text-blue-600 font-bold">+{item.stock}</td>
                      <td className="p-3">{item.size || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
              <button onClick={() => setPreviewItems([])} className="px-5 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancelar</button>
              <div className="flex gap-3">
                {previewItems.some(p => p._status === 'repetido') && (
                  <>
                    <button onClick={() => confirmImport('ignore')} className="px-5 py-2 rounded-xl font-bold text-amber-700 bg-amber-50 hover:bg-amber-100">Ignorar Repetidos</button>
                    <button onClick={() => confirmImport('update')} className="px-5 py-2 rounded-xl font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100">Actualizar Todos</button>
                  </>
                )}
                <button onClick={() => confirmImport('selection')} className="px-5 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50" disabled={previewItems.filter(p => p._selected).length === 0}>
                  Importar ({previewItems.filter(p => p._selected).length})
                </button>
              </div>
            </div>
          </div>
        </div>, document.body
      )}

      {/* MODAL GLOBAL DE CARGA/ÉXITO */}
      {globalAction.show && createPortal(
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center animate-fade-in min-h-[280px] flex flex-col items-center justify-center">
            {globalAction.status === 'loading' ? (
              <>
                <Loader2 size={64} className="animate-spin text-indigo-500 mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{globalAction.title}</h2>
                <p className="text-slate-500 font-medium">{globalAction.desc}</p>
              </>
            ) : (
              <>
                <div className="bg-emerald-100 p-5 rounded-full mb-6 border border-emerald-200"><CheckCircle size={64} className="text-emerald-500" /></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{globalAction.title}</h2>
                <p className="text-slate-500 font-medium">{globalAction.desc}</p>
              </>
            )}
          </div>
        </div>, document.body
      )}

      {/* MODAL OCULTAR/ACTIVAR PRODUCTO */}
      {showToggleModal && productToToggle && createPortal(
        <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex justify-center items-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center animate-fade-in">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${productToToggle.is_active ? 'bg-rose-100' : 'bg-emerald-100'}`}>
              {productToToggle.is_active ? <AlertCircle size={36} className="text-rose-500" /> : <CheckCircle2 size={36} className="text-emerald-500" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">{productToToggle.is_active ? '¿Ocultar producto?' : '¿Activar producto?'}</h2>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              Se cambiará la visibilidad de <br/><strong className="text-slate-900 bg-slate-100 px-2 py-1 rounded mt-2 inline-block">{productToToggle.name}</strong>
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowToggleModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors w-full">Cancelar</button>
              <button onClick={confirmToggleStatus} className={`px-6 py-2.5 rounded-xl font-bold text-white w-full transition-transform hover:scale-105 ${productToToggle.is_active ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}`}>
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default AdminProducts;
