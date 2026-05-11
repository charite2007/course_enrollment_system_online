import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Enrollment from "../models/enrollment.js";
import Author from "../models/author.js";

export async function getPublicCourses(req, res) {
  try {
    const [courses, totalStudents, totalEnrollments, totalCertificates] = await Promise.all([
      Course.find().sort({ createdAt: -1 }),
      Author.countDocuments({ role: "student" }),
      Enrollment.countDocuments(),
      (await import("../models/certificate.js")).default.countDocuments(),
    ]);
    return res.json({ courses, stats: { totalStudents, totalEnrollments, totalCertificates, totalCourses: courses.length } });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getCourses(req, res) {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.json({ courses });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const lessons = await Lesson.find({ courseId: id }).sort({ order: 1, createdAt: 1 });
    return res.json({ course, lessons });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function createCourse(req, res) {
  try {
    const course = await Course.create(req.body);
    return res.status(201).json({ course });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json({ course });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    await Lesson.deleteMany({ courseId: id });
    await Course.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function addLesson(req, res) {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    const lesson = await Lesson.create({ ...req.body, courseId: id });
    return res.status(201).json({ lesson });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function updateLesson(req, res) {
  try {
    const { id, lessonId } = req.params;
    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, courseId: id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    return res.json({ lesson });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function deleteLesson(req, res) {
  try {
    const { id, lessonId } = req.params;
    await Lesson.findOneAndDelete({ _id: lessonId, courseId: id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

