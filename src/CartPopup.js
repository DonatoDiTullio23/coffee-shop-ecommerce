// src/CartPopup.js
import React from "react";
import { Link } from "react-router-dom";

function getKey(it) {
  return String(it.id || it._id || "");
}
function getQty(it) {
  const q = Number(it.quantity ?? it.qty ?? 0);
  return Number.isFinite(q) ? q : 0;
}
function getStock(it) {
  const s = Number(it.stock ?? it.inventory ?? it.inStock ?? it.quantityAvailable ?? 0);
  return Number.isFinite(s) ? s : 0;
}

export default function CartPopup({ cart, removeFromCart, updateQuantity, onClose }) {
  const total = cart.reduce((sum, it) => sum + (Number(it.price) || 0) * getQty(it), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="w-96 bg-white h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center">Your cart is empty.</p>
          ) : (
            cart.map((item) => {
              const id = getKey(item);
              const qty = getQty(item);
              const stock = getStock(item);

              return (
                <div key={id} className="flex items-center gap-4 border-b pb-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded border"
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/64")}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">${Number(item.price || 0).toFixed(2)}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(id, -1)}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        onClick={() => updateQuantity(id, 1)}
                        disabled={qty >= stock}
                        className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(id)}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
