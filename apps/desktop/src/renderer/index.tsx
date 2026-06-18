import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

// Import kutlass CSS — Vite will bundle this
import "kutlass/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
