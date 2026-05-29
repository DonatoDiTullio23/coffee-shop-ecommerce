// src/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar({ cartCount = 0, onCartClick }) {
  const [open, setOpen] = useState(false);

  const baseLink = "text-sm font-medium transition-colors duration-150";
  const inactive = "text-gray-700 hover:text-gray-900";
  const active = "text-green-700";

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="h-16 grid grid-cols-[auto_1fr_auto] items-center px-3 sm:px-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/Logo2.jpg"
              alt="Mug & Bean Logo"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center justify-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `${baseLink} ${isActive ? active : inactive}`
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Right Side */}
        <div className="ml-auto md:ml-0 flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md border border-gray-300 w-9 h-9 hover:bg-gray-50"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <span className="text-lg">✕</span>
            ) : (
              <span className="text-lg">☰</span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="relative inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
          >
            🛒 <span>Cart</span>
            <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-green-600 text-white text-xs">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-3 py-2 flex flex-col gap-1">
            <NavLink
              to="/"
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${baseLink} ${
                  isActive ? "text-green-700 bg-green-50" : inactive
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${baseLink} ${
                  isActive ? "text-green-700 bg-green-50" : inactive
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${baseLink} ${
                  isActive ? "text-green-700 bg-green-50" : inactive
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded px-3 py-2 ${baseLink} ${
                  isActive ? "text-green-700 bg-green-50" : inactive
                }`
              }
            >
              Contact
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
