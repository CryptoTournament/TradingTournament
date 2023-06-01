// PrivateRoute.js
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function PrivateRoute({ user, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: location } });
    }
  }, [user, navigate, location]);

  if (!user) {
    return null;
  }

  return children;
}

export default PrivateRoute;
