import axios from "axios";

export const addNewUserToDb = async (user) => {
  const token = user && (await user.getIdToken());
  const headers = token ? { authtoken: token } : {};

  const response = await axios.post(
    "/api/create-account",
    // {
    //   school: school,
    //   id: idFromFB,
    // },
    { headers }
  );
};
