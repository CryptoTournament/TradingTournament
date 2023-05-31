import axios from "axios";

export const addNewUserToDb = async (user) => {
  // const token = user && (await user.getIdToken());
  // const headers = token ? { authtoken: token } : {};
  const uid = user.uid;
  console.log(user.uid);
  const response = await axios.post("/api/users/signUp", {
    uid: uid,
  });
};

export const getUsers = async () => {
  const response = await axios.get("/api/users", {});
  return response.data;
};

export const getUser = async (uid) => {
  const response = await axios.get(`/api/users/${uid}`);

  return response.data;
};

export const buyColorChangeProduct = async (uid, color) => {
  const response = await axios.put(`/api/users/${uid}/color`, {
    color: color,
  });
  return response.data;
};

export const upgradeToVip = async (uid) => {
  console.log("got heresss");
  try {
    const response = await axios.put(`/api/users/${uid}/upgradeToVip`);
    return response.data;
  } catch (error) {
    console.error("Error upgrading to VIP:", error);
    throw error;
  }
};
