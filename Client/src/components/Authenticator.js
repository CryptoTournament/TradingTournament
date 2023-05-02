import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./FireBaseAuth";

export function login(email, password) {
  try {
    return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("logged in");
        return userCredential.user;
      })
      .catch((error) => {
        console.log("Error in login caught" + error);
      });
  } catch (error) {
    console.log("Error in login caught" + error);
  }
}

export async function logout() {
  try {
    await signOut(auth);
    console.log("Logged out");
  } catch (error) {
    console.log("Error in logout caught" + error);
  }
}
