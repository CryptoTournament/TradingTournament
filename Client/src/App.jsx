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
import BasicInfoPage from "./pages/BasicInfoPage";
import SettingsPage from "./pages/SettingsPage";
import Shop from "./pages/Shop";
import LeaderBoard from "./pages/LeaderBoard";
import TournamentsPage from "./pages/TournamentsPage";
import UserContext from "./contexts/UserContext";
import { useState } from "react";
function App() {
  const [navBarDisplayName, setNavBarDisplayName] = useState("");
  const [color, setColor] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  return (
    <UserContext.Provider
      value={{
        navBarDisplayName,
        setNavBarDisplayName,
        color,
        setColor,
        setUserBalance,
        userBalance,
      }}
    >
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
              <Route path="/chart" element={<TournamentsPage />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/info" element={<BasicInfoPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/leaderboard" element={<LeaderBoard />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
