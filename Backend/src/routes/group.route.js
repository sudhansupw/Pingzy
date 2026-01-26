import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  joinGroup,
  getGroupsForSidebar,
  endGroup,
  extendGroup,
  generateInviteLink,
  joinGroupViaInvite,
} from "../controllers/group.controller.js";

const router = Router();
router.post("/create", protectRoute, createGroup);
router.post("/join", protectRoute, joinGroup);
router.get("/", protectRoute, getGroupsForSidebar);
router.delete("/:groupId", protectRoute, endGroup);
router.patch("/:groupId/extend", protectRoute, extendGroup);
router.post("/:groupId/invite", protectRoute, generateInviteLink);
router.post("/join/invite/:token", protectRoute, joinGroupViaInvite);

export default router;
