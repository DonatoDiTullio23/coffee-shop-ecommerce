// src/App.js
import React, { useState, useEffect, useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import AdminLogin from "./admin/AdminLogin.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import Navbar from "./Navbar.js";
import Footer from "./Footer.js";
import CartPopup from "./CartPopup.js";

import { CartProvider, CartContext } from "./context/CartContext.js";

// Pages
import Home from "./pages/Home.js";
import Shop from "./pages/Shop.js";
import Contact from "./pages/Contact.js";
import About from "./pages/About.js";
import Checkout from "./pages/Checkout.js";
import ProductPage from "./pages/ProductPage.js";
import Orders from "./pages/Orders.js";
import OrderConfirmation from "./pages/OrderConfirmation.js";

/* -------------------- helpers -------------------- */
const toNum = (v, f = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : f;
};
const stockOf = (p) =>
  toNum(p?.stock ?? p?.quantity ?? p?.inventory ?? p?.inStock ?? 0);

export const normalizeProduct = (raw = {}) => {
  const src = typeof raw === "object" ? (raw._doc || raw) : {};
  const _id = raw?._id || raw?.id || src?._id || src?.id || "";
  return {
    id: String(_id),           
    _id: String(_id),
    name: src.name ?? "",
    price: toNum(src.price, 0),
    stock: stockOf(src),
    category: src.category ?? "",
    image: src.image ?? "",
    description: src.description ?? "",
  };
};

/* -------------------- App content -------------------- */

function AppContent() {
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cart, removeFromCart, updateQuantity } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    setIsCartOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Load products
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const base = process.env.REACT_APP_BACKEND_URL || "";
        const res = await fetch(`${base}/api/products`);
        const data = await res.json();
        if (!ignore) {
          const list = Array.isArray(data) ? data : [];
          setProducts(list.map(normalizeProduct));
        }
      } catch (e) {
        console.error("Failed to fetch products:", e);
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoadingProducts(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Admin app */}
          <Route path="/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminApp />
              </PrivateRoute>
            }
          />
          {/* Public site */}
          <Route path="/" element={<Home products={products} loading={loadingProducts} />} />
          <Route path="/shop" element={<Shop products={products} loading={loadingProducts} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/product/:id"
            element={<ProductPage products={products} />}
          />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <div className="p-12 text-center">
                Page not found.{" "}
                <a className="text-green-600" href="/">
                  Go home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartPopup
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Cart context wraps everything so every page can access it */}
      <CartProvider>
        <AppContent />
      </CartProvider>
    </div>
  );
}
