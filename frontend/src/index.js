import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import App from "./App";
import { AuthProvider } from "./context/authContext";
import { LanguageProvider } from "./context/languageContext";

// Configure axios baseURL
axios.defaults.baseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <LanguageProvider>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </LanguageProvider>
);
