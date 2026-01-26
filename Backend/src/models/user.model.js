import mongoose, { Schema } from "mongoose";

const userSchema = Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
