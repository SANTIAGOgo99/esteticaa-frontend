import { useEffect, useMemo, useState } from 'react';
import { getSessionStorageId } from '../utils/session';

const LEGACY_CART_STORAGE_KEY = 'estetica_client_cart';
const CART_STORAGE_PREFIX = 'estetica_client_cart';
const CART_UPDATED_EVENT_PREFIX = 'estetica-cart-updated';

export interface CartProduct {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  price: string | number;
  stock: number;
  size?: string;
  image_url?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

const normalizeCart = (items: CartItem[]) => {
  return items
    .filter((item) => item.id && item.quantity > 0)
    .map((item) => ({
      ...item,
      quantity: Math.min(item.quantity, Math.max(1, Number(item.stock) || 1)),
    }));
};

const getCartStorageKey = () => {
  const sessionId = getSessionStorageId();
  return `${CART_STORAGE_PREFIX}:${sessionId || 'anonymous'}`;
};

const readCart = (storageKey: string): CartItem[] => {
  try {
    const rawCart = localStorage.getItem(storageKey);
    if (!rawCart) return [];

    const parsed = JSON.parse(rawCart);
    return Array.isArray(parsed) ? normalizeCart(parsed) : [];
  } catch {
    return [];
  }
};

const persistCart = (storageKey: string, eventName: string, nextItems: CartItem[]) => {
  const normalized = normalizeCart(nextItems);
  localStorage.setItem(storageKey, JSON.stringify(normalized));
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent(eventName, { detail: normalized }));
  });
  return normalized;
};

export const useCart = () => {
  const [storageKey] = useState(getCartStorageKey);
  const eventName = `${CART_UPDATED_EVENT_PREFIX}:${storageKey}`;
  const [items, setItems] = useState<CartItem[]>(() => readCart(storageKey));

  useEffect(() => {
    // La llave antigua era compartida por todas las cuentas del navegador.
    // Se elimina para evitar que un cliente herede el carrito de otro.
    localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    setItems(readCart(storageKey));

    const syncCart = (event: Event) => {
      const customEvent = event as CustomEvent<CartItem[]>;
      setItems(Array.isArray(customEvent.detail) ? customEvent.detail : readCart(storageKey));
    };

    const syncStorageCart = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setItems(readCart(storageKey));
      }
    };

    window.addEventListener(eventName, syncCart);
    window.addEventListener('storage', syncStorageCart);

    return () => {
      window.removeEventListener(eventName, syncCart);
      window.removeEventListener('storage', syncStorageCart);
    };
  }, [eventName, storageKey]);

  const addItem = (product: CartProduct, quantity = 1) => {
    if (!product.stock || product.stock <= 0) return;

    setItems((currentItems) => {
      const nextItems = [...currentItems];
      const itemIndex = nextItems.findIndex((item) => item.id === product.id);

      if (itemIndex >= 0) {
        const currentItem = nextItems[itemIndex];
        nextItems[itemIndex] = {
          ...currentItem,
          ...product,
          quantity: Math.min(currentItem.quantity + quantity, product.stock),
        };
      } else {
        nextItems.push({
          ...product,
          quantity: Math.min(quantity, product.stock),
        });
      }

      return persistCart(storageKey, eventName, nextItems);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((currentItems) => {
      const nextItems = currentItems.map((item) => {
        if (item.id !== productId) return item;

        return {
          ...item,
          quantity: Math.min(Math.max(1, quantity), Math.max(1, Number(item.stock) || 1)),
        };
      });

      return persistCart(storageKey, eventName, nextItems);
    });
  };

  const removeItem = (productId: number) => {
    setItems((currentItems) => persistCart(storageKey, eventName, currentItems.filter((item) => item.id !== productId)));
  };

  const clearCart = () => {
    setItems(() => persistCart(storageKey, eventName, []));
  };

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const price = Number(item.price) || 0;
        acc.totalItems += item.quantity;
        acc.subtotal += price * item.quantity;
        return acc;
      },
      { totalItems: 0, subtotal: 0 }
    );
  }, [items]);

  return {
    items,
    totalItems: totals.totalItems,
    subtotal: totals.subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
};
