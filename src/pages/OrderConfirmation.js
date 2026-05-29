// src/pages/OrderConfirmation.js
import React, { useEffect, useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext.js";
import { api } from "../utils/api.js";

const CUSTOMER_KEY = "checkout_customer";           
const DEDUPE_KEY   = "last_order_posted_signature"; 

export default function OrderConfirmation() {
  const { cart, clearCart } = useContext(CartContext);
  const { search } = useLocation();
  const status = new URLSearchParams(search).get("status");
  const ok = status === "success";

  const [message, setMessage] = useState(ok ? "Finalizing your order…" : "");

  const qtyOf = (i) => Number(i.quantity ?? i.qty ?? 0);
  const subtotal = cart.reduce((s, i) => s + Number(i.price || 0) * qtyOf(i), 0);
  const tax = subtotal * 0.05;
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 9.99 : 0;
  const total = subtotal + tax + shipping;

  useEffect(() => {
    let ignore = false;

    async function finalize() {
      document.body.style.overflow = "";
      window.scrollTo(0, 0);

      if (!ok) return;

      try {
        const customer = JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "null");
        const signature = JSON.stringify({
          items: cart.map((i) => ({
            id: i._id || i.id || i.name,
            q: qtyOf(i),
            p: Number(i.price || 0),
          })),
          email: customer?.email || "",
          total: Number(total.toFixed(2)),
        });

        if (localStorage.getItem(DEDUPE_KEY) === signature) {
          setMessage("Order complete. Thank you!");
          clearCart();                        
          return;
        }

        if (!customer || !Array.isArray(cart) || cart.length === 0) {
          setMessage("Payment succeeded but we couldn't rebuild your order. If you don't receive a confirmation, please contact support.");
          return;
        }

        const payload = {
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
            address1: customer.address || "",
            city: customer.city || "",
            region: customer.region || "",
            postalCode: customer.postalCode || "",
            country: customer.country || "",
          },
          items: cart.map((i) => ({
            productId: i._id || i.id || undefined,
            name: i.name,
            price: Number(i.price || 0),
            quantity: qtyOf(i),
            image: i.image || "",
          })),
          subtotal: Number(subtotal.toFixed(2)),
          shipping: Number(shipping.toFixed(2)),
          tax: Number(tax.toFixed(2)),
          total: Number(total.toFixed(2)),
          paymentStatus: "paid",
          status: "new",
        };

        setMessage("Saving your order…");

        await api("/api/orders", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        localStorage.setItem(DEDUPE_KEY, signature);

        if (!ignore) {
          setMessage("Order complete. Thank you!");
          clearCart();
        }
      } catch (err) {
        console.error("Finalize order error:", err);
        if (!ignore) {
          setMessage(
            "We received your payment, but saving the order failed. Please contact support with your email and we’ll sort it out."
          );
        }
      }
    }

    finalize();
    return () => { ignore = true; };
  }, [ok, cart, clearCart, total]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      {ok ? (
        <>
          <h1 className="text-3xl font-bold text-green-700 mb-4">
            Thank you for your order!
          </h1>
          <p className="text-gray-700 mb-6">{message}</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-6">
            We couldn’t process your order. Please try again or contact support.
          </p>
        </>
      )}

      <Link
        to="/shop"
        className="inline-block px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
