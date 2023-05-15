import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";
import Friends from "./pages/Friends";
import "./App.css";
import Chart from "./pages/Chart";
import Profile from "./pages/Profile";
function App() {
  return (
    <BrowserRouter>
      <div className="">
        <div className=" relative z-20">
          <NavBar />
        </div>
        <div className="relative pt-20 z-10 h-screen bg-gradient-to-r bg-bg-main-custom overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/friends" element={<Friends />} />


            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
