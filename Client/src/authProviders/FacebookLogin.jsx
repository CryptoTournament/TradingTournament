import React from "react";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { addNewUserToDb } from "../api/users";
import { auth } from "../components/FireBaseAuth";
import { FaFacebook } from "react-icons/fa";

const FacebookLogin = () => {
  const provider = new FacebookAuthProvider();

  const signIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, provider);
      console.log(userCredential);
      // Check if the user is new and add to the database
      if (userCredential._tokenResponse.isNewUser) {
        const user = userCredential.user;

        await addNewUserToDb(user);
      }
      console.log("successfully logged in with Facebook account");

      // Handle successful login
    } catch (error) {
      console.log("Error with signing in with Facebook provider:", error);
    }
  };

  return (
    <FaFacebook
      onClick={signIn}
      className="w-12 h-12 cursor-pointer transition duration-200 ease-in-out hover:scale-110 border-2 border-gray-300 hover:border-black rounded-md text-white"
    />
  );
};

export default FacebookLogin;
