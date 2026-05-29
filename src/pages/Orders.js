// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import { getOrders } from "../utils/orderStorage.js";

function formatCurrency(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleClear = () => {
    if (window.confirm("Clear ALL saved orders? This cannot be undone.")) {
      localStorage.setItem("orders", JSON.stringify([]));
      setOrders([]);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-3">Orders</h1>
        <p className="text-gray-500">No orders saved yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <button
          onClick={handleClear}
          className="text-sm bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4">
        {orders
          .slice()
          .reverse()
          .map((order) => (
            <details key={order.id} className="bg-white border rounded-lg shadow p-4">
              <summary className="cursor-pointer flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    Order #{order.id} — {new Date(order.date).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer?.name} • {order.customer?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                  <p className="text-sm text-gray-600">
                    Subtotal {formatCurrency(order.subtotal)} · Tax {formatCurrency(order.tax)} ·{" "}
                    {order.shipping === 0 ? "Free shipping" : `Shipping ${formatCurrency(order.shipping)}`}
                  </p>
                </div>
              </summary>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Items</h3>
                  <ul className="divide-y">
                    {order.items.map((item) => (
                      <li key={item.id} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Shipping</h3>
                  <div className="text-sm text-gray-800 space-y-1">
                    <p>{order.customer?.name}</p>
                    <p>{order.customer?.address}</p>
                    <p>
                      {order.customer?.city} {order.customer?.postalCode}
                    </p>
                    <p>{order.customer?.country}</p>
                    <p className="text-gray-600 mt-2">{order.customer?.email}</p>
                  </div>
                </div>
              </div>
            </details>
          ))}
      </div>
    </div>
  );
}

export default Orders;
