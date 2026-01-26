import mongoose, { Schema } from "mongoose";

const messageSchema = Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: function () {
        return this.messageType === "dm";
      },
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
      required: function () {
        return this.messageType === "group";
      },
    },
    messageType: {
      type: String,
      enum: ["dm", "group"],
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: { expires: 0 }, // TTL
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Ensure message belongs to exactly one chat type
messageSchema.pre("validate", function () {
  if (this.messageType === "dm" && !this.receiverId) {
    throw new Error("DM message must have receiverId");
  }

  if (this.messageType === "group" && !this.groupId) {
    throw new Error("Group message must have groupId");
  }
});

export const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
