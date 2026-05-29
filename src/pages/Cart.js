// src/pages/Cart.js
import React from "react";
import { Link } from "react-router-dom";

export default function Cart({ cart = [], removeFromCart, updateQuantity }) {
  const subtotal = cart.reduce((sum, p) => sum + Number(p.price || 0) * (p.qty || 1), 0);

  if (!cart.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <div className="bg-white border rounded-xl p-6 text-center">
          <p className="mb-4">Your cart is empty.</p>
          <Link to="/shop" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        {cart.map((p) => (
          <div key={String(p._id || p.id)} className="flex items-center gap-4 p-4 border-b last:border-0">
            <img
              src={p.image || "/placeholder.png"}
              alt={p.name}
              className="w-16 h-16 rounded object-cover border"
              onError={(e) => (e.currentTarget.src = "/placeholder.png")}
            />
            <div className="flex-1">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">${Number(p.price || 0).toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded-lg"
                onClick={() => updateQuantity(p._id || p.id, Math.max(1, (p.qty || 1) - 1))}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                className="w-14 border rounded-lg px-2 py-1 text-center"
                value={p.qty || 1}
                onChange={(e) => updateQuantity(p._id || p.id, Math.max(1, Number(e.target.value) || 1))}
              />
              <button
                className="px-2 py-1 border rounded-lg"
                onClick={() => updateQuantity(p._id || p.id, (p.qty || 1) + 1)}
              >
                +
              </button>
            </div>

            <div className="w-24 text-right font-medium">
              ${(Number(p.price || 0) * (p.qty || 1)).toFixed(2)}
            </div>

            <button
              className="ml-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              onClick={() => removeFromCart(p._id || p.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="text-lg">
          <span className="text-gray-600 mr-2">Subtotal:</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>
        <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
          Checkout
        </button>
      </div>
    </div>
  );
}
