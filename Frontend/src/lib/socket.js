import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001";

const socket = io(BASE_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;
