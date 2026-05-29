import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API = process.env.REACT_APP_BACKEND_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }
      localStorage.setItem("admintoken", data.token);
      localStorage.setItem("adminuser", JSON.stringify(data.user));

      // Navigate to admin dashboard
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Admin Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-3 rounded"
        />
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Sign In
        </button>
      </form>
    </div>
  );
}
