// src/pages/Contact.jsx
import React, { useState } from "react";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ loading: false, success: null, error: "All fields are required." });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setStatus({ loading: false, success: null, error: "Please enter a valid email." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });

    if (!validate()) return;

    try {
      const res = await fetch(process.env.REACT_APP_BACKEND_URL + "/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Network response not ok");
      setStatus({ loading: false, success: "Message sent successfully!", error: null });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus({ loading: false, success: null, error: "Something went wrong. Try again later." });
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Your Message"
          className="w-full border p-2 rounded h-32"
          required
        />
        <button
          type="submit"
          disabled={status.loading}
          className={`px-6 py-2 rounded text-white ${
            status.loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {status.loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Feedback Messages */}
      {status.error && (
        <p className="mt-4 text-red-600 font-medium">{status.error}</p>
      )}
      {status.success && (
        <p className="mt-4 text-green-600 font-medium">{status.success}</p>
      )}
    </main>
  );
}

export default Contact;
