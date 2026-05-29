// src/context/CartContext.js
import React, { createContext, useEffect, useState } from "react";

export const CartContext = createContext();

/* ---------- helpers ---------- */
const getId = (p) => p?._id || p?.id || (p?._doc?._id) || "";
const toNum = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};
const getStock = (p) =>
  toNum(p?.stock ?? p?.quantity ?? p?.inventory ?? p?.inStock ?? 0);

const normalizeProduct = (raw = {}) => {
  const src = typeof raw === "object" ? (raw._doc || raw) : {};
  const id = getId(raw);
  return {
    id,
    _id: id,
    name: src.name ?? "",
    price: toNum(src.price, 0),
    stock: getStock(src),
    category: src.category ?? "",
    image: src.image ?? "",
    description: src.description ?? "",
  };
};

/* ---------- context ---------- */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("cart");
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list
        .map((item) => {
          const p = normalizeProduct(item);
          const id = p.id || (p.name ? `name:${p.name}` : "");
          if (!id) return null;
          const qty = toNum(item.quantity ?? item.qty ?? 1, 1);
          const stock = getStock(item) || p.stock || 0;
          const clamped = stock > 0 ? Math.min(qty, stock) : qty; 
          return { ...p, id, _id: id, quantity: Math.max(1, clamped) };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const keyOf = (idOrProduct) => {
    if (typeof idOrProduct === "string") return idOrProduct;
    return getId(idOrProduct) || (idOrProduct?.name ? `name:${idOrProduct.name}` : "");
  };

  const addToCart = (product) => {
    const p = normalizeProduct(product);
    const id = p.id || (p.name ? `name:${p.name}` : "");
    const stock = p.stock;

    if (stock <= 0) {
      alert("Sorry, this item is out of stock!");
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((i) => (i.id || i._id) === id || (i.name && `name:${i.name}` === id));
      if (idx > -1) {
        const curr = prev[idx];
        if ((curr.quantity || 1) >= stock) {
          alert("No more stock available!");
          return prev;
        }
        const copy = [...prev];
        copy[idx] = { ...curr, quantity: (curr.quantity || 1) + 1, stock };
        return copy;
      }
      return [...prev, { ...p, id, _id: id, quantity: 1 }];
    });
  };

  const removeFromCart = (idOrProduct) => {
    const key = keyOf(idOrProduct);
    setCart((prev) =>
      prev.filter(
        (i) =>
          (i.id || i._id) !== key && (!i.name || `name:${i.name}` !== key)
      )
    );
  };

  const updateQuantity = (idOrProduct, deltaOrQty) => {
    const key = keyOf(idOrProduct);
    setCart((prev) =>
      prev.flatMap((i) => {
        const matches =
          (i.id || i._id) === key || (i.name && `name:${i.name}` === key);
        if (!matches) return [i];

        const stock = getStock(i) || 0;
        const current = toNum(i.quantity, 1);
        const next =
          Math.abs(deltaOrQty) < 1e6
            ? current + deltaOrQty
            : toNum(deltaOrQty, current);

        if (next <= 0) return [];
        if (stock > 0) return [{ ...i, quantity: Math.min(next, stock) }];
        return [{ ...i, quantity: Math.max(1, next) }];
      })
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
