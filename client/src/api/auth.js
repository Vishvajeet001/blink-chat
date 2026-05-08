import axiosInstance from "./index";

const signup = async (user) => {
    try {
        const response = await axiosInstance.post("/api/auth/signup", user);
        return response.data;
    } catch (error) {
        return error;
    }
}

const login = async (user) => {
    try {
        const response = await axiosInstance.post("/api/auth/login", user);
        return response.data;
    } catch (error) {
        return error;
    }
}

export { signup, login };