import { Router } from "express";
import { protection, adminOnly } from "../middleware/authorMiddleware.js";
import {
  getProfile, updateProfile, updatePassword,
  getAllUsers, deleteUser, promoteUser,
  getAdminStats, getStudentStats,
  getPublicUsers, followUser,
} from "../controllers/userController.js";

const router = Router();

router.get("/profile", protection, getProfile);
router.put("/profile", protection, updateProfile);
router.put("/password", protection, updatePassword);
router.get("/stats/student", protection, getStudentStats);
router.get("/stats/admin", protection, adminOnly, getAdminStats);
router.get("/all", protection, adminOnly, getAllUsers);
router.get("/people", protection, getPublicUsers);
router.put("/:id/follow", protection, followUser);
router.put("/:id/promote", protection, adminOnly, promoteUser);
router.delete("/:id", protection, adminOnly, deleteUser);

export default router;
