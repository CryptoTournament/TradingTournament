import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import { signUp } from "../components/Authenticator";
import { auth } from "../components/FireBaseAuth";
const SignUpPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  //   let idFromFB = "initValue";

  const navigate = useNavigate();
  const { user } = useUser();

  //   const auth = getAuth();
  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       idFromFB = user.uid; //get firebase new account's id in order to set it inside mongodb.
  //     }
  //   });

  const createAccount = async () => {
    // try {
    //   if (password !== confirmPassword) {
    //     setError("Password and confirm password do not match.");
    //     return;
    //   }

    //   await createUserWithEmailAndPassword(getAuth(), email, password);
    //   addNewUserToDb();
    //   navigate("/grades");
    // } catch (e) {
    //   setError(e.message);
    // }
    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      console.log("password not match confirmPassword");
      return;
    }
    let result = await signUp(auth, email, password);
    if (result.status) {
      console.log("User created successfully.");
      navigate("/");
    } else {
      console.log("User creation failed:", result.message);
      setError(result.message);
    }
  };
  const handleSubmit = (event) => {
    // 👇️ prevent page refresh
    event.preventDefault();
  };

  return (
    <>
      {/* {user ? (
        navigate("/")
      ) : ( */}
      <div className=" flex items-center justify-center	mt-8">
        <form
          className="bg-slate-200 shadow-md rounded px-8 pt-6 pb-8 mb-4 "
          onSubmit={handleSubmit}
        >
          <h1 className="text-center font-bold mb-4">Create Account </h1>
          {error && (
            <p className="mb-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </p>
          )}
          {/* if error exists, display it */}

          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <input
              className={
                password == ""
                  ? "shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  : "shadow appearance-none  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              }
              type="password"
              placeholder="your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className={
                password != confirmPassword || confirmPassword == ""
                  ? "shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                  : "shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              }
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between m-auto">
            <button
              onClick={createAccount}
              className=" bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mx-auto mb-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Account
            </button>
          </div>
          <div className="text-center">
            <Link to="/login">Already have an account? log in here</Link>
          </div>
        </form>
      </div>
      {/* )} */}
    </>
  );
};

export default SignUpPage;
