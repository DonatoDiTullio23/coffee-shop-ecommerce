import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "./context/CartContext.js";

function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext); 

  return (
    <div className="border rounded-lg shadow hover:shadow-lg transition bg-white flex flex-col">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover rounded-t-lg"
      />

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-bold">{product.name}</h3>
          <p className="text-green-600 font-semibold">
            ${product.price.toFixed(2)}
          </p>

          {product.stock > 0 ? (
            <p className="text-sm text-gray-600 mt-1">
              In Stock: {product.stock}
            </p>
          ) : (
            <p className="text-sm text-red-500 font-semibold mt-1">
              Out of Stock
            </p>
          )}

          {product.stock > 0 && product.stock <= 3 && (
            <p className="text-sm text-orange-600 font-semibold mt-1">
              Hurry! Only {product.stock} left
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/product/${product.id}`}
            className="text-blue-600 hover:underline"
          >
            View
          </Link>

          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product)}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
            >
              Add
            </button>
          ) : (
            <span className="text-gray-400 text-sm">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
