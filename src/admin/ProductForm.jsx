import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/api.js";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();          
  const isEdit = Boolean(id);

  const [values, setValues] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    image: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing product for edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const p = await api(`/api/products/${id}`);
        setValues({
          name: p.name ?? "",
          price: p.price ?? "",
          stock: p.stock ?? "",
          category: p.category ?? "",
          image: p.image ?? "",
          description: p.description ?? "",
        });
      } catch (e) {
        setError(e.message || "Failed to load product");
      }
    })();
  }, [id, isEdit]);

  function set(field, v) {
    setValues(prev => ({ ...prev, [field]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const price = Number(values.price);
    const stock = Number(values.stock || 0);
    if (!values.name.trim()) return setError("Name is required");
    if (Number.isNaN(price) || price < 0) return setError("Price must be a non-negative number");
    if (Number.isNaN(stock) || stock < 0) return setError("Stock must be a non-negative number");

    const payload = {
      name: values.name.trim(),
      price,
      stock,
      category: values.category.trim(),
      image: values.image.trim(),
      description: values.description.trim(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await api(`/api/products`, { method: "POST", body: JSON.stringify(payload) });
      }
      navigate("/admin/products");
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border p-5 shadow-sm max-w-3xl">
      <h3 className="font-semibold mb-4">{isEdit ? "Edit Product" : "New Product"}</h3>
      {error && <div className="mb-3 p-2 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Name</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={values.name} onChange={e=>set("name", e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Category</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" value={values.category} onChange={e=>set("category", e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Price</span>
          <input type="number" step="0.01" className="mt-1 w-full border rounded-xl px-3 py-2" value={values.price} onChange={e=>set("price", e.target.value)} />
        </label>

        <label className="block">
          <span className="text-sm">Stock</span>
          <input type="number" className="mt-1 w-full border rounded-xl px-3 py-2" value={values.stock} onChange={e=>set("stock", e.target.value)} />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm">Image URL</span>
          <input className="mt-1 w-full border rounded-xl px-3 py-2" placeholder="https://…" value={values.image} onChange={e=>set("image", e.target.value)} />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm">Description</span>
          <textarea rows={4} className="mt-1 w-full border rounded-xl px-3 py-2" value={values.description} onChange={e=>set("description", e.target.value)} />
        </label>

        <div className="md:col-span-2 flex gap-3 pt-2">
          <button disabled={saving} className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? "Saving…" : (isEdit ? "Update" : "Create")}
          </button>
          <button type="button" onClick={()=>navigate("/admin/products")} className="px-4 py-2 rounded-xl border hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
