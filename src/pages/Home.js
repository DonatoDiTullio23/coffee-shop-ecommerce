// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { CartContext } from "../context/CartContext.js";

function Home({ products }) {
  const { addToCart } = useContext(CartContext);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[500px] w-full flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
          alt="Coffee beans"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Mug & Bean
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
            Discover coffee that’s ethically sourced, carefully roasted, and
            always fresh.
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <img
          src="https://images.unsplash.com/photo-1445077100181-a33e9ac94db0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Pouring coffee"
          className="w-full h-80 object-cover rounded-lg shadow"
        />
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900">About Us</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            At <span className="font-semibold text-green-700">Mug & Bean</span>,
            we partner with farmers worldwide to bring you beans that are not
            only delicious but also ethically sourced and sustainably grown.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Every roast is carefully crafted to highlight unique flavors of its
            origin — each cup tells a story of quality, community, and passion.
          </p>
          <Link
            to="/about"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-green-700 font-semibold mb-3">
                  ${product.price.toFixed(2)}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
