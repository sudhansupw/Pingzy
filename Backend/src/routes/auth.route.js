import { Router } from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
  checkAuth,
  googleLogin,
  googleSignup,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);

router.post("/google/signup", googleSignup);
router.post("/google/login", googleLogin);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

export default router;
