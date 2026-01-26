import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessages,
} from "../controllers/message.controller.js";
const router = Router();

router.get("/users", protectRoute, getUsersForSidebar);
// router.get("/groups", protectRoute, getGroupsForSidebar);
router.get("/:chatType/:chatId", protectRoute, getMessages);
// router.get("/:id", protectRoute, getMessages);
router.post("/send/", protectRoute, sendMessages);

export default router;
