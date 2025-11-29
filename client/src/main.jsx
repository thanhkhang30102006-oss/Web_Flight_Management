import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import HomePage from "./pages/HomePageScript.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  </StrictMode>
);
