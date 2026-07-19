import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

const normalizeItem = (item) => ({
  productId: item.productId,
  slug: item.slug,
  name: item.name,
  image: item.image,
  price: Number(item.price),
  quantity: Number(item.quantity) || 1,
  size: item.size || "M",
  stock: Number(item.stock) || 0
});

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const raw = localStorage.getItem("wishly_cart");
    return raw ? JSON.parse(raw) : [];
  });

  const sync = (nextItems) => {
    setItems(nextItems);
    localStorage.setItem("wishly_cart", JSON.stringify(nextItems));
  };

  const addToCart = (item) => {
    const normalized = normalizeItem(item);
    const key = `${normalized.productId}-${normalized.size}`;
    const existing = items.find((entry) => `${entry.productId}-${entry.size}` === key);

    if (existing) {
      const merged = items.map((entry) =>
        `${entry.productId}-${entry.size}` === key
          ? {
              ...entry,
              quantity: Math.min(entry.quantity + normalized.quantity, entry.stock || 99)
            }
          : entry
      );
      sync(merged);
    } else {
      sync([...items, normalized]);
    }
  };

  const removeFromCart = (productId, size) => {
    sync(items.filter((item) => !(item.productId === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    sync(
      items.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: Math.min(qty, item.stock || qty) }
          : item
      )
    );
  };

  const clearCart = () => sync([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 2500 || subtotal === 0 ? 0 : 99;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;
    return { subtotal, shipping, tax, total };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totals
    }),
    [items, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
