import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:`${import.meta.env.BACKEND_URL}/api`,
  withCredentials: true,
});
