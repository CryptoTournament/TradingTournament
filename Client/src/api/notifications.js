import axios from "axios";

export const addNotification = async (uid, message, type) => {
  try {
    const res = await axios.post("/api/notifications", {
      uid,
      message,
      type,
    });
    console.log(res.data);
    // return res.data; // Optionally, you can return the response data
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const markNotificationAsSeen = async (notification) => {
  console.log(notification);
  try {
    if (!notification.seen) {
      await axios.patch(`/api/notifications/${notification._id}`, {
        seen: true,
      });
      return true;
    }
  } catch (error) {
    // Handle the error, e.g., display an error message or log it
    console.error("Error marking notification as seen:", error);
    return false;
  }
};
