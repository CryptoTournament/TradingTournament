import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { addNewUserToDb } from "../api/users";
import { auth } from "../components/FireBaseAuth";

const GoogleLogin = () => {
  const provider = new GoogleAuthProvider();

  const signIn = async () => {
    try {
      console.log("came");
      const userCredential = await signInWithPopup(auth, provider);
      console.log(userCredential);
      // Check if the user is new and add to the database
      if (userCredential._tokenResponse.isNewUser) {
        const user = userCredential.user;
        // const userData = {
        //   uid: user.uid,
        //   displayName: user.displayName,
        //   email: user.email,
        //   // Add any other required properties
        // };
        console.log("1");

        await addNewUserToDb(user);
      }
      console.log("successfully logged in with google account");

      // Handle successful login
    } catch (error) {
      console.log("error with signing in with google provider");
    }
  };

  return (
    <button
      onClick={signIn}
      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLogin;
