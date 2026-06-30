import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Info, CheckCircle, Truck, Shield, Droplets } from 'lucide-react';
import './ProductDetail.css';

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

interface ProductDetailProps {
  product: Producto;
  onBack: () => void;
  getImageUrl: (url?: string) => string | null;
  addToCart: (product: Producto, quantity?: number) => void;
  openCart: () => void;
}

const ProductDetail = ({ product, onBack, getImageUrl, addToCart, openCart }: ProductDetailProps) => {
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  const aumentarCantidad = () => {
    if (cantidad < product.stock) setCantidad(c => c + 1);
  };
  const disminuirCantidad = () => {
    if (cantidad > 1) setCantidad(c => c - 1);
  };
  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart(product, cantidad);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const precioUnit = Number(product.price);
  const precioTotal = precioUnit * cantidad;

  return (
    <div className="product-detail-container">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Volver al catálogo
      </button>

      <div className="detail-card">
        <div className="detail-image">
          <div className="image-wrapper">
            {getImageUrl(product.image_url) ? (
              <img src={getImageUrl(product.image_url)!} alt={product.name} />
            ) : (
              <div className="no-image-placeholder">
                <Droplets size={48} />
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          {product.stock === 0 && <div className="image-overlay out">Agotado</div>}
          {product.stock <= 5 && product.stock > 0 && <div className="image-overlay low">¡Últimas unidades!</div>}
        </div>

        <div className="detail-info">
          <div className="brand-tag">
            <span className="brand-dot"></span>
            {product.brand}
          </div>
          <h1>{product.name}</h1>
          <div className="sku">Referencia: PROD-{product.id}</div>

          <div className="price-section">
            <div className="price-main">${precioTotal.toFixed(2)}</div>
            {cantidad > 1 && <div className="price-unit">${precioUnit.toFixed(2)} c/u</div>}
            <div className="price-tax">
              <Info size={12} />
              IVA incluido · Precio de contado
            </div>
          </div>

          <div className="stock-status">
            <div className={`stock-dot ${product.stock === 0 ? 'out' : 'in'}`}></div>
            <span className="stock-text">{product.stock > 0 ? 'Disponible' : 'Agotado'}</span>
            {product.stock > 0 && <span className="stock-count">({product.stock} unidades)</span>}
          </div>

          {product.stock > 0 && (
            <div className="quantity-cart">
              <div className="quantity-selector">
                <label>Cantidad</label>
                <div className="qty-controls">
                  <button onClick={disminuirCantidad} disabled={cantidad <= 1}>−</button>
                  <input type="text" value={cantidad} readOnly />
                  <button onClick={aumentarCantidad} disabled={cantidad >= product.stock}>+</button>
                </div>
              </div>
              <button className="add-to-cart" onClick={handleAddToCart}>
                {added ? <CheckCircle size={18} /> : <ShoppingCart size={18} />}
                {added ? 'Agregado' : `Agregar al carrito · $${precioTotal.toFixed(2)}`}
              </button>
              <button className="view-cart-button" onClick={openCart}>
                Ver carrito
              </button>
            </div>
          )}

          <div className="benefits">
            <div className="benefit-item"><Truck size={16} /><span>Envíos a toda la ciudad</span></div>
            <div className="benefit-item"><Shield size={16} /><span>Producto 100% original</span></div>
          </div>

          <div className="divider"></div>

          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Marca</span>
              <span className="detail-value">{product.brand}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Categoría</span>
              <span className="detail-value">{product.category}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tamaño</span>
              <span className="detail-value">{product.size || 'No especificado'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Condición</span>
              <span className="detail-value">Nuevo · Original</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Envío</span>
              <span className="detail-value">A domicilio o retiro en sucursal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
