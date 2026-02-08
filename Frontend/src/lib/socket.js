import { io } from "socket.io-client";

const BASE_URL = "https://pingzy-1.onrender.com"

const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
