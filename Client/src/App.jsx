import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";

import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <div className=" App bg-gray-100">
        <div className=" relative z-20">
          <NavBar />
        </div>
        <div className="relative p-20 z-10 min-h-screen bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
