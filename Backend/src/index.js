import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

import app from "./app.js";
import { setupSocket } from "./lib/socket.js";
import { connectDB } from "./lib/DB.lib.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    setupSocket(server);

    server.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();
