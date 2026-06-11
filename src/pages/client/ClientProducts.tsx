import { useState } from 'react';
import useSWR from 'swr';
import { ShoppingCart, Package, Tags, Search, Filter, Palette, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import api from '../../services/api';
import ProductDetail from '../../components/client/ProductDetail';

const fetcher = (url: string) => api.get(url).then(res => res.data);

interface Producto {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: string | number;
  stock: number;
  size?: string;
  image_url?: string;
}

const ITEMS_POR_PAGINA = 8;

const ClientProducts = () => {
  const { data: productos, error, isLoading } = useSWR('/products/active', fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const productosArray = productos || [];
  const filteredAll = productosArray.filter((p: Producto) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAll.length / ITEMS_POR_PAGINA);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const currentProducts = filteredAll.slice(
    (validCurrentPage - 1) * ITEMS_POR_PAGINA,
    validCurrentPage * ITEMS_POR_PAGINA
  );

  const totalProductos = productosArray.length;
  const totalCategorias = [...new Set(productosArray.map((p: Producto) => p.category))].length;
  const totalMarcas = [...new Set(productosArray.map((p: Producto) => p.brand))].length;

  if (selectedProduct) {
    return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} getImageUrl={getImageUrl} />;
  }

  return (
    <div className="client-products-container">
      <div className="products-header">
        <div className="header-text">
          <span className="section-badge">Boutique</span>
          <h1>Colección Profesional</h1>
          <p>Productos de alta calidad para tu cuidado personal</p>
        </div>
        <div className="header-actions">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button className="cart-button">
            <ShoppingCart size={18} />
            <span>Carrito (0)</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info"><span>Total Productos</span><strong>{totalProductos}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Tags size={24} /></div>
          <div className="stat-info"><span>Categorías</span><strong>{totalCategorias}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Palette size={24} /></div>
          <div className="stat-info"><span>Marcas</span><strong>{totalMarcas}</strong></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Filter size={24} /></div>
          <div className="stat-info"><span>Último agregado</span><strong className="truncate">{productosArray[0]?.name || '-'}</strong></div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state"><div className="spinner"></div><p>Cargando productos...</p></div>
      )}
      {error && <div className="error-state"><p>Error al cargar los productos.</p></div>}

      {!isLoading && !error && (
        <>
          {filteredAll.length === 0 ? (
            <div className="empty-state"><Package size={48} /><p>No encontramos productos que coincidan con tu búsqueda.</p></div>
          ) : (
            <>
              <div className="products-grid">
                {currentProducts.map((prod: Producto) => (
                  <div key={prod.id} className="product-card" onClick={() => setSelectedProduct(prod)}>
                    <div className="product-image">
                      {prod.stock === 0 && <span className="stock-badge out">Agotado</span>}
                      {prod.stock <= 5 && prod.stock > 0 && <span className="stock-badge low">¡Últimas unidades!</span>}
                      {getImageUrl(prod.image_url) ? (
                        <img src={getImageUrl(prod.image_url)!} alt={prod.name} />
                      ) : (
                        <div className="no-image"><Droplets size={32} /></div>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="product-brand">{prod.brand}</span>
                      <h3>{prod.name}</h3>
                      {prod.size && <p className="product-size">{prod.size}</p>}
                      <p className="product-price">${Number(prod.price).toFixed(2)}</p>
                    </div>
                    <button className="product-button">Ver detalles</button>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={validCurrentPage === 1} className="page-btn"><ChevronLeft size={18} /></button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx+1)} className={`page-number ${validCurrentPage === idx+1 ? 'active' : ''}`}>{idx+1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={validCurrentPage === totalPages} className="page-btn"><ChevronRight size={18} /></button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ClientProducts;