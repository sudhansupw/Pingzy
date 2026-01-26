import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Message } from "./message.model.js";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔐 Password-protected group
    password: {
      type: String,
      required: true,
      select: false,
    },

    // ⏱ Expiry time (2 hours)
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },

    inviteToken: String,
    inviteTokenExpiry: Date,
  },
  { timestamps: true }
);

// 🔒 Hash password before save
groupSchema.pre("save", async function () {
  if (!this.isModified("password")) return null;

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔐 Password check
groupSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// 🧹 Cleanup messages when group expires
groupSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Message.deleteMany({ groupId: doc._id });
  }
});

const Group = mongoose.models.Group || mongoose.model("Group", groupSchema);
export default Group;
