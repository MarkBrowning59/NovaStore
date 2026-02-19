// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import RequestsPage from "./pages/RequestsPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <BrowserRouter> */}
    <HashRouter>
      <Routes>
        {/* Optional: redirect root to a default store */}
        <Route path="/" element={<Navigate to="/requests?storeNumber=1" replace />} />

        {/* Query param style: /requests?storeNumber=1 */}
        <Route path="/requests" element={<RequestsPage />} />

        {/* Path param style: /requests/1 */}
        <Route path="/requests/:storeNumber" element={<RequestsPage />} />
      </Routes>
    </HashRouter>
    {/* </BrowserRouter> */}
  </React.StrictMode>
);
