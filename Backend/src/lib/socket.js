import { Server } from "socket.io";
import { Message } from "../models/message.model.js";
import Group from "../models/group.model.js";

let io;

// userId -> Set(socketIds)
const userSocketMap = {};

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const { userId } = socket.handshake.query;

    // 🔒 Reject unauthenticated sockets
    if (!userId) {
      socket.disconnect();
      return;
    }

    // =========================
    // TRACK USER SOCKETS
    // =========================
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // =========================
    // GROUP ROOMS
    // =========================
    socket.on("joinGroup", async (groupId) => {
      if (!groupId) return;

      const group = await Group.findById(groupId);
      if (!group) return; // group expired or deleted

      socket.join(groupId);
    });

    socket.on("leaveGroup", (groupId) => {
      if (!groupId) return;
      socket.leave(groupId);
    });

    // =========================
    // SEND DM MESSAGE
    // =========================
    socket.on("sendMessage", async ({ receiverId, text, image }) => {
      if (!receiverId || (!text && !image)) return;

      try {
        const message = await Message.create({
          senderId: userId,
          receiverId,
          text,
          image,
          messageType: "dm",
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "fullName profilePic")
          .populate("receiverId", "fullName profilePic");

        // send to receiver (all tabs)
        const receiverSockets = userSocketMap[receiverId];
        receiverSockets?.forEach((socketId) => {
          io.to(socketId).emit("newMessage", populatedMessage);
        });

        // echo back to sender
        socket.emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("DM socket error:", error);
      }
    });

    // =========================
    // SEND GROUP MESSAGE ✅ FIXED
    // =========================
    socket.on("sendGroupMessage", async ({ groupId, text, image }) => {
      if (!groupId || (!text && !image)) return;

      try {
        const group = await Group.findById(groupId);
        if (!group) return;

        // 🔥 FIXED membership check
        const isMember = group.members.some(
          (memberId) => memberId.toString() === userId,
        );
        if (!isMember) return;

        const message = await Message.create({
          senderId: userId,
          groupId,
          messageType: "group",
          text,
          image,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          "senderId",
          "fullName profilePic",
        );

        io.to(groupId).emit("newGroupMessage", populatedMessage);
      } catch (error) {
        console.error("Group socket error:", error);
      }
    });

    // =========================
    // DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      userSocketMap[userId]?.delete(socket.id);

      if (userSocketMap[userId]?.size === 0) {
        delete userSocketMap[userId];
      }

      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

// =========================
// HELPERS
// =========================
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const getReceiverSocketIds = (userId) => {
  return Array.from(userSocketMap[userId] || []);
};
