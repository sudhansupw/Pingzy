import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

export const signup = async (req, res) => {
  try {
    const { email, fullName, password, profilePic } = req.body;
    if (!email || !fullName || !password)
      return res.status(400).json({ message: "credentials are required" });

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be greater than 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user)
      return res.status(400).json({ message: "User already exits,try Login" });

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashPass,
      profilePic,
    });

    if (newUser) {
      //generate token and send it with cookies
      const token = generateToken(newUser._id, res);

      await newUser.save();

      res.status(201).json(newUser, {
        message: "Signup completed",
      });
    } else {
      return res.status(400).json({ message: "Invalid User data " });
    }
  } catch (error) {
    console.log("error in signup", error.message);
    res.status(500).json({ message: "Signup error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json(user, {
      message: "Login completed",
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(401).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile", error.message);
    res.status(500).json({ message: "Internal server errors" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("error in checkauth controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// const getGoogleUser = async (accessToken) => {
//   const { data } = await axios.get(
//     "https://www.googleapis.com/oauth2/v3/userinfo",
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );
//   return data;
// };

const getPayload = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    return null;
  }
  return payload;
};

export const googleSignup = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    const payload = getPayload(token);
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        profilePic: picture,
        googleId: sub,
      });
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({ user });
  } catch (error) {
    res.status(401).json({ message: "Google auth failed" });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 1️⃣ Validate request
    if (!token) {
      return res.status(400).json({ message: "Google token missing" });
    }

    // 2️⃣ Verify Google ID token
    const payload = getPayload(token);

    const { email, name, picture, sub } = payload;

    // 3️⃣ Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        profilePic: picture,
        googleId: sub,
      });
    }

    // 4️⃣ Generate JWT (your app’s authority)
    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5️⃣ Set cookie
    res
      .cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};
