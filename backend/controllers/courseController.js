import Course from "../models/course.js";
import Lesson from "../models/lesson.js";

export async function getCourses(req, res) {
  const courses = await Course.find().sort({ createdAt: -1 });
  return res.json({ courses });
}

export async function getCourse(req, res) {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const lessons = await Lesson.find({ courseId: id }).sort({ order: 1, createdAt: 1 });
  return res.json({ course, lessons });
}

export async function createCourse(req, res) {
  const course = await Course.create(req.body);
  return res.status(201).json({ course });
}

export async function updateCourse(req, res) {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) return res.status(404).json({ message: "Course not found" });
  return res.json({ course });
}

export async function deleteCourse(req, res) {
  const { id } = req.params;
  await Lesson.deleteMany({ courseId: id });
  await Course.findByIdAndDelete(id);
  return res.json({ ok: true });
}

export async function addLesson(req, res) {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  const lesson = await Lesson.create({ ...req.body, courseId: id });
  return res.status(201).json({ lesson });
}

export async function updateLesson(req, res) {
  const { id, lessonId } = req.params;
  const lesson = await Lesson.findOneAndUpdate(
    { _id: lessonId, courseId: id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  return res.json({ lesson });
}

export async function deleteLesson(req, res) {
  const { id, lessonId } = req.params;
  await Lesson.findOneAndDelete({ _id: lessonId, courseId: id });
  return res.json({ ok: true });
}

