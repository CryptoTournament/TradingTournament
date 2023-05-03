import axios from "axios";

export const addNewUserToDb = async (user) => {
  // const token = user && (await user.getIdToken());
  // const headers = token ? { authtoken: token } : {};
  const uid = user.uid;
  console.log(user.uid);
  const response = await axios.post("/api/signUp", {
    uid: uid,
  });
};
