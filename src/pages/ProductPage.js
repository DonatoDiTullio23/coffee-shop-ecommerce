import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

const API_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "";

const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function ProductPage({ products = [], addToCart = () => {} }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Try to find it from props first
  const local = useMemo(() => {
    return (
      products.find((p) => String(p?._id) === String(id)) ||
      products.find((p) => String(p?.id) === String(id)) ||
      null
    );
  }, [products, id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        if (local) {
          if (!cancelled) setProduct(local);
          return;
        }

        // Try fetching by Mongo _id
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setProduct(data?.product ?? data ?? null);
          return;
        }

        const res2 = await fetch(`${API_BASE}/api/products`);
        const list = await res2.json();
        const arr = Array.isArray(list)
          ? list
          : Array.isArray(list?.items) ? list.items
          : Array.isArray(list?.data) ? list.data
          : Array.isArray(list?.products) ? list.products
          : Array.isArray(list?.docs) ? list.docs
          : [];
        const found =
          arr.find((p) => String(p?._id) === String(id)) ||
          arr.find((p) => String(p?.id) === String(id)) ||
          null;

        if (!cancelled) setProduct(found);
      } catch (e) {
        if (!cancelled) setErr(e.message || "Failed to load product");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, local]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-10 bg-gray-200 rounded w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (err) return <p className="text-center py-12 text-red-600">{err}</p>;
  if (!product) return <p className="text-center py-12">Product not found.</p>;

  const {
    name = "Untitled Product",
    image = "https://via.placeholder.com/600x400?text=No+Image",
    price = 0,
    description = "Delicious coffee from sustainable farms. Roasted for an amazing cup every time.",
    stock: _stock,
    quantity,
    inventory,
    inStock,
  } = product;

  const stock = toNumber(
    _stock ?? quantity ?? inventory ?? (typeof inStock === "boolean" ? (inStock ? 1 : 0) : inStock),
    0
  );

  const priceText = Number(price || 0).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
      <img
        src={image}
        alt={name}
        className="w-full h-96 object-cover rounded-lg shadow border"
        onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/600x400?text=Image+Unavailable"; }}
      />
      <div>
        <h1 className="text-3xl font-bold mb-4">{name}</h1>
        <p className="text-xl text-green-600 font-semibold mb-4">${priceText}</p>

        {stock > 0 ? (
          <>
            <p className="text-gray-600 mb-2">In Stock: {stock}</p>
            {stock <= 3 && <p className="text-orange-600 font-semibold mb-4">Hurry! Only {stock} left</p>}
          </>
        ) : (
          <p className="text-red-500 font-semibold mb-4">Currently Out of Stock</p>
        )}

        <p className="text-gray-700 mb-6">{description}</p>

        {stock > 0 ? (
          <button
            onClick={() => addToCart(product)}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Add to Cart
          </button>
        ) : (
          <span className="text-red-500 font-semibold">This product is out of stock.</span>
        )}
      </div>
    </div>
  );
}
