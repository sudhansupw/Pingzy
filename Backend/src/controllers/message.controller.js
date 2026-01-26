import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketIds, getIO } from "../lib/socket.js";
import Group from "../models/group.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const fetchUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );

    res.status(200).json(fetchUsers, { message: "The users are fetched" });
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatType, chatId } = req.params;

    if (!chatType || !["dm", "group"].includes(chatType)) {
      return res.status(400).json({ message: "Invalid chat type" });
    }

    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }

    let query = {};

    // DM messages
    if (chatType === "dm") {
      query = {
        messageType: "dm",
        $or: [
          { senderId: userId, receiverId: chatId },
          { senderId: chatId, receiverId: userId },
        ],
      };
    }

    //group messages
    if (chatType === "group") {
      query = {
        messageType: "group",
        groupId: chatId,
      };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 }) // oldest → newest
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const senderId = req.user.id;

    // 🔑 normalize input
    const {
      chatType,
      messageType: rawMessageType,
      receiverId,
      groupId,
      text,
      image,
    } = req.body;

    const messageType = chatType || rawMessageType;

    if (!messageType || !["dm", "group"].includes(messageType)) {
      return res.status(400).json({ message: "Invalid chat type" });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (messageType === "dm" && !receiverId) {
      return res.status(400).json({ message: "receiverId is required for DM" });
    }

    if (messageType === "group" && !groupId) {
      return res.status(400).json({ message: "groupId is required for group" });
    }

    // =========================
    // IMAGE UPLOAD
    // =========================
    let imageURL = null;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURL = uploadResponse.secure_url;
    }

    // =========================
    // CREATE MESSAGE ✅
    // =========================

    const group = Group.findById({ groupId });

    const message = await Message.create({
      senderId,
      receiverId: messageType === "dm" ? receiverId : null, // 🔥 explicit
      groupId: messageType === "group" ? groupId : null,
      messageType, // 🔥 guaranteed correct
      text,
      image: imageURL,
      expiresAt: group.expiresAt,
    });

    // update group last message
    if (messageType === "group") {
      await Group.findByIdAndUpdate(groupId, {
        lastMessage: message._id,
      });
    }

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "fullName profilePic")
      .populate("receiverId", "fullName profilePic");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
