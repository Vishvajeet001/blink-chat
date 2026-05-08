import axiosInstance from "./index";

export const getLoggedInUser = async () => {
  try {
    const response = await axiosInstance.get("/api/user/get-user-info");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch user info",
    };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/user/get-all-users");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to fetch users",
    };
  }
};

export const uploadProfilePic = async (image) => {
  try {
    const response = await axiosInstance.post("/api/user/upload-profile-pic", {
      image,
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to upload profile picture",
    };
  }
};
