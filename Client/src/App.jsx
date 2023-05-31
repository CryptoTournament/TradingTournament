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
import PrivateRoute from "./pages/PrivateRoute";
import useUser from "./hooks/useUser";
import { useState } from "react";
function App() {
  const [navBarDisplayName, setNavBarDisplayName] = useState("");
  const [color, setColor] = useState("");
  const [userBalance, setUserBalance] = useState(0);

  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>; // or your loading component here
  }

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
              <Route
                path="/chart"
                element={
                  <PrivateRoute user={user}>
                    <TournamentsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute user={user}>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <PrivateRoute user={user}>
                    <Friends />
                  </PrivateRoute>
                }
              />

              <Route path="/info" element={<BasicInfoPage />} />

              {/* <Route
                path="/settings"
                element={
                  <PrivateRoute user={user}>
                    <SettingsPage />
                  </PrivateRoute>
                }
              /> */}
              <Route
                path="/shop"
                element={
                  <PrivateRoute user={user}>
                    <Shop />
                  </PrivateRoute>
                }
              />

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
