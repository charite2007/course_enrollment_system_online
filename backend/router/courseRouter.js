import { Router } from "express";
import { protection, adminOnly } from "../middleware/authorMiddleware.js";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addLesson,
  updateLesson,
  deleteLesson,
} from "../controllers/courseController.js";

const router = Router();

router.get("/", protection, getCourses);
router.get("/:id", protection, getCourse);
router.post("/", protection, adminOnly, createCourse);
router.put("/:id", protection, adminOnly, updateCourse);
router.delete("/:id", protection, adminOnly, deleteCourse);
router.post("/:id/lessons", protection, adminOnly, addLesson);
router.put("/:id/lessons/:lessonId", protection, adminOnly, updateLesson);
router.delete("/:id/lessons/:lessonId", protection, adminOnly, deleteLesson);

export default router;

