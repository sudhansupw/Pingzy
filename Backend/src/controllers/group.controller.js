import Group from "../models/group.model.js";
import { Message } from "../models/message.model.js";
import crypto from "crypto";

export const createGroup = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user._id;

    if (!name || !password) {
      return res.status(400).json({ message: "Name & password required" });
    }

    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hrs

    const group = await Group.create({
      name,
      admin: userId,
      members: [userId],
      password,
      expiresAt,
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Failed to create group" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId, password } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId).select("+password");

    if (!group) {
      return res.status(404).json({ message: "Group not found or expired" });
    }

    const isMatch = await group.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ message: "Failed to join group" });
  }
};

export const getGroupsForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const groups = await Group.find({
      members: loggedInUserId,
    })
      .populate("members", "fullName profilePic")
      .populate("admin", "fullName profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      groups,
      message: "Groups fetched successfully",
    });
  } catch (error) {
    console.error("Error in getGroupsForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const endGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  console.log("END GROUP REQUEST:", groupId);

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      message: "Group not found (expired or already deleted)",
    });
  }

  if (group.admin.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Only admin can end chat" });
  }

  await Message.deleteMany({ groupId });
  await Group.findByIdAndDelete(groupId);

  res.json({ message: "Group ended successfully" });
};

export const extendGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (group.admin.toString() !== userId.toString()) {
    return res.status(403).json({ message: "Only admin can extend chat" });
  }

  // extend by 30 minutes
  group.expiresAt = new Date(
    new Date(group.expiresAt).getTime() + 30 * 60 * 1000
  );

  await group.save();

  res.json({ expiresAt: group.expiresAt });
};

export const generateInviteLink = async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) return res.status(404).json({ error: "Group not found" });

  // admin check
  if (group.admin.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: "Only admin can invite" });
  }

  const token = crypto.randomBytes(24).toString("hex");

  group.inviteToken = token;
  group.inviteTokenExpiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

  await group.save();

  res.status(200).json({
    inviteLink: `${process.env.FRONTEND_URL}/groups/invite/${token}`,
  });
};

export const joinGroupViaInvite = async (req, res) => {
  const { token } = req.params;

  const group = await Group.findOne({
    inviteToken: token,
    inviteTokenExpiry: { $gt: Date.now() },
  });

  if (!group)
    return res.status(400).json({ error: "Invite expired or invalid" });

  if (!group.members.includes(req.user._id)) {
    group.members.push(req.user._id);
    await group.save();
  }

  res.status(200).json({ message: "Joined successfully" });
};
