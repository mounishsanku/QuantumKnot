import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-[#1A1A1A] text-white border border-blue-500/40 rounded-xl",
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
