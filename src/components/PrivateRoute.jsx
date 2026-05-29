import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("admintoken") || localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}
