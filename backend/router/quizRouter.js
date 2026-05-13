import { Router } from "express";
import { protection, adminOnly } from "../middleware/authorMiddleware.js";
import {
  getQuiz, saveQuiz, deleteQuiz,
  getCourseQuiz, saveCourseQuiz, deleteCourseQuiz,
  getQuizForStudent, getCourseQuizForStudent,
  autoCompleteLesson, submitQuiz, submitCourseQuiz,
} from "../controllers/quizController.js";

const router = Router();

// ── Admin: lesson quiz ────────────────────────────────────────
router.get("/lesson/:lessonId",        protection, adminOnly, getQuiz);
router.put("/lesson/:lessonId",        protection, adminOnly, saveQuiz);
router.delete("/lesson/:lessonId",     protection, adminOnly, deleteQuiz);

// ── Admin: course final quiz ──────────────────────────────────
router.get("/course/:courseId",        protection, adminOnly, getCourseQuiz);
router.put("/course/:courseId",        protection, adminOnly, saveCourseQuiz);
router.delete("/course/:courseId",     protection, adminOnly, deleteCourseQuiz);

// ── Student: lesson quiz ──────────────────────────────────────
router.get("/lesson/:lessonId/take",   protection, getQuizForStudent);
router.post("/lesson/:lessonId/submit",protection, submitQuiz);

// ── Student: auto-complete lesson (no quiz) ───────────────────
router.post("/auto-complete/:courseId/:lessonId", protection, autoCompleteLesson);

// ── Student: course final quiz ────────────────────────────────
router.get("/course/:courseId/take",   protection, getCourseQuizForStudent);
router.post("/course/:courseId/submit",protection, submitCourseQuiz);

export default router;
