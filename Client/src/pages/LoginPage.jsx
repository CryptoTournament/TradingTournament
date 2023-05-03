import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../components/Authenticator";
import { CgProfile } from "react-icons/cg";
import useUser from "../hooks/useUser";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const logIn = async () => {
    let logStatus = await login(email, password);

    if (logStatus) {
      navigate("/");
    } else {
      setError("Invalid email or password");
      console.log("error in login");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); // clear error message state

    // Check if form data is valid
    if (!email || !password) {
      setError("Please enter valid email and password");
      return;
    }

    try {
      await logIn(); // wait for login to complete
    } catch (error) {
      console.log(error);
      setError(error.message); // set error message state
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/"); // navigate to home page on successful login
    }
  }, [user]);

  return (
    <div className="mt-20">
      <div className="flex items-center justify-center">
        <form
          className="bg-slate-200 shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleSubmit}
        >
          <div className="text-center flex mb-3">
            <CgProfile className="text-2xl mr-2" />
            <h1>Login</h1>
          </div>
          {error && (
            <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative select-none hover:bg-red-200">
              {error}
            </p>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              placeholder="Insert Email Address Here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <button
              className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-24 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleSubmit}
            >
              Sign In
            </button>

            <Link
              className="  text-blue-800  pt-4 px-4 mx-24 rounded focus:outline-none focus:shadow-outline"
              to="/register"
            >
              Don't have an account? sign up here!
            </Link>
          </div>
          <div className=" mt-2"></div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
