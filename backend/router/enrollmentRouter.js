import { Router } from "express";
import { protection, adminOnly } from "../middleware/authorMiddleware.js";
import {
  enrollCourse,
  getMyEnrollments,
  completeLesson,
  getMyCertificates,
  getAllEnrollments,
} from "../controllers/enrollmentController.js";

const router = Router();

router.get("/my", protection, getMyEnrollments);
router.get("/certificates", protection, getMyCertificates);
router.get("/all", protection, adminOnly, getAllEnrollments);
router.post("/:courseId", protection, enrollCourse);
router.put("/:courseId/lesson", protection, completeLesson);

export default router;

