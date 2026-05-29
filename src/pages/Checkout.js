// src/pages/Checkout.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { saveOrder } from "../utils/orderStorage.js";
import { CartContext } from "../context/CartContext.js"; 

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PK);
const CUSTOMER_KEY = "checkout_customer";

function Checkout(props) {
  const ctx = useContext(CartContext);
  const rawCart = props?.cart ?? ctx?.cart ?? [];
  const cart = Array.isArray(rawCart) ? rawCart : [];

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_KEY);
      if (raw) setCustomer(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
  }, [customer]);

  const lineQty = (item) => Number(item.quantity ?? item.qty ?? 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * lineQty(item),
    0
  );
  const tax = subtotal * 0.05;
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 9.99 : 0;
  const total = subtotal + tax + shipping;

  const handleStripeCheckout = async () => {
    if (!customer.name || !customer.email || !customer.address) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    const order = {
      id: Date.now(),
      items: cart,
      subtotal,
      tax,
      shipping,
      total,
      customer,
      date: new Date().toISOString(),
    };
    saveOrder(order);

    try {
      await stripePromise; 

      const res = await fetch(
        (process.env.REACT_APP_BACKEND_URL || "") + "/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: customer.email,
            items: cart.map((i) => ({
              name: i.name,
              image: i.image || "",
              price: Number(i.price || 0), 
              quantity: lineQty(i),
            })),
          }),
        }
      );

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong creating Stripe session.");
      }
    } catch (err) {
      console.error("Stripe Checkout error:", err);
      alert("Payment failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link
            to="/shop"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Go Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold mb-2">Shipping Information</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="Street Address"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              className="w-full border p-2 rounded"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="City"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={customer.postalCode}
                onChange={(e) =>
                  setCustomer({ ...customer, postalCode: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
            </div>
            <input
              type="text"
              placeholder="Country"
              value={customer.country}
              onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Order Summary */}
          <div className="border rounded-lg p-6 bg-gray-50 shadow">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (5%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping:</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className={`w-full mt-4 py-2 rounded transition text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
