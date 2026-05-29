// src/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* About Us */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
          <p className="text-sm leading-relaxed">
            At <span className="font-semibold text-green-400">Mug & Bean</span>,
            we believe every cup tells a story. 
            From responsibly sourced beans to expert roasting, 
            we’re passionate about delivering coffee that fuels your day 
            and brings people together.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-green-400">Home</Link></li>
            <li><Link to="/shop" className="hover:text-green-400">Shop</Link></li>
            <li><Link to="/about" className="hover:text-green-400">About</Link></li>
            <li><Link to="/contact" className="hover:text-green-400">Contact</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-green-400">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-green-400">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-green-400">Terms of Service</a></li>
            <li><a href="#" className="hover:text-green-400">FAQ</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-4">Get in Touch</h3>
          <p className="text-sm">📍 Montreal, QC, Canada</p>
          <p className="text-sm">✉️ support@mugandbean.com</p>
          <p className="text-sm">📞 (123) 456-7890</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-green-400">🌐</a>
            <a href="#" className="hover:text-green-400">🐦</a>
            <a href="#" className="hover:text-green-400">📸</a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Mug & Bean. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
