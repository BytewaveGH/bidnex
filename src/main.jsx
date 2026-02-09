import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Signup from "./pages/auth/Signup";
import VerifyOtp from "./pages/auth/VerifyOtp";
import AllItems from "./pages/AllItems";
import ItemDetails from "./pages/ItemDetails";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        
        {/* Auth flow */}
        <Route path="/" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/verify" element={<VerifyOtp />} />

        {/* Marketplace */}
        <Route path="/items" element={<AllItems />} />
        <Route path="/items/:id" element={<ItemDetails />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/auth/signup" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);