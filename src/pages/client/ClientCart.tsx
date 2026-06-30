import toast from 'react-hot-toast';
import { Minus, Package, Plus, ShoppingBag, Trash2, Wallet, X } from 'lucide-react';
import type { CartItem } from '../../hooks/useCart';

interface ClientCartProps {
  items: CartItem[];
  subtotal: number;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  goToProducts: () => void;
}

const getImageUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const apiOrigin = apiUrl.replace(/\/api\/?$/, '');

  return `${apiOrigin}${url}`;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
};

const ClientCart = ({
  items,
  subtotal,
  updateQuantity,
  removeItem,
  clearCart,
  goToProducts,
}: ClientCartProps) => {
  const handleCheckout = () => {
    toast.success('Pedido preparado. El siguiente paso sera conectar ventas en linea.');
  };

  if (items.length === 0) {
    return (
      <div className="client-cart-container">
        <div className="cart-empty-state">
          <div className="cart-empty-icon">
            <ShoppingBag size={42} />
          </div>
          <span className="section-badge">Carrito</span>
          <h1>Tu carrito esta vacio</h1>
          <p>Agrega productos de la boutique para preparar tu pedido.</p>
          <button className="cart-primary-button" onClick={goToProducts}>
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-cart-container">
      <div className="cart-header">
        <div>
          <span className="section-badge">Carrito</span>
          <h1>Resumen de compra</h1>
          <p>Revisa tus productos antes de solicitar el pedido.</p>
        </div>

        <button className="cart-clear-button" onClick={clearCart}>
          <X size={16} />
          Vaciar carrito
        </button>
      </div>

      <div className="cart-layout">
        <section className="cart-items-panel">
          {items.map((item) => {
            const price = Number(item.price) || 0;
            const lineTotal = price * item.quantity;

            return (
              <article key={item.id} className="cart-item-card">
                <div className="cart-item-image">
                  {getImageUrl(item.image_url) ? (
                    <img src={getImageUrl(item.image_url)!} alt={item.name} />
                  ) : (
                    <Package size={28} />
                  )}
                </div>

                <div className="cart-item-info">
                  <span>{item.brand || 'Producto profesional'}</span>
                  <h3>{item.name}</h3>
                  <p>{item.size || item.category || 'Presentacion no especificada'}</p>
                  <strong>{formatCurrency(price)} c/u</strong>
                </div>

                <div className="cart-quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="cart-item-total">
                  <strong>{formatCurrency(lineTotal)}</strong>
                  <button onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                    Quitar
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="cart-summary-panel">
          <div className="cart-summary-title">
            <Wallet size={20} />
            <h2>Total del pedido</h2>
          </div>

          <div className="summary-row">
            <span>Productos</span>
            <strong>{items.reduce((acc, item) => acc + item.quantity, 0)}</strong>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Envio</span>
            <strong>Por confirmar</strong>
          </div>

          <div className="cart-total-row">
            <span>Total estimado</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>

          <button className="cart-primary-button" onClick={handleCheckout}>
            Finalizar compra
          </button>
          <button className="cart-secondary-button" onClick={goToProducts}>
            Seguir comprando
          </button>

          <p className="cart-note">
            Este carrito prepara el pedido. Pagos, envios y ventas en linea se conectan en el siguiente modulo.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default ClientCart;
