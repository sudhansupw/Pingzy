import { io } from "socket.io-client";

const BASE_URL = import.meta.env.BACKEND_URL


const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
