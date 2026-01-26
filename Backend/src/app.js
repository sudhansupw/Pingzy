import express from "express";
import authRoutes from "./routes/auth.route.js";
import msgRoutes from "./routes/message.route.js";
import grpRoutes from "./routes/group.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// import { app } from "./lib/socket.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/msg", msgRoutes);
app.use("/api/groups", grpRoutes);

export default app;
