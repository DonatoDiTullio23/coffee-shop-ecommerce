// src/pages/Shop.jsx
import React, { useState } from "react";
import ProductCard from "../ProductCard.js";

function Shop({ products }) {
  const categories = ["All", "Single Origin", "Blend", "Espresso"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar */}
      <aside className="hidden md:block">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedCategory === cat
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Products */}
      <div className="md:col-span-3">
        <div className="md:hidden mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border p-2 rounded"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-gray-500">No products found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shop;
