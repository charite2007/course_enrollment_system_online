import Enrollment from "../models/enrollment.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Certificate from "../models/certificate.js";

export async function enrollCourse(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId: req.user._id, courseId },
      { $setOnInsert: { studentId: req.user._id, courseId, completedLessons: [], progress: 0 } },
      { new: true, upsert: true }
    );
    return res.status(201).json({ enrollment });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getMyEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate("courseId")
      .sort({ createdAt: -1 });
    return res.json({ enrollments });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function completeLesson(req, res) {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.body || {};
    if (!lessonId) return res.status(400).json({ message: "lessonId required" });

    const [lesson, totalLessons] = await Promise.all([
      Lesson.findOne({ _id: lessonId, courseId }),
      Lesson.countDocuments({ courseId }),
    ]);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (totalLessons === 0) return res.status(400).json({ message: "No lessons for course" });

    const enrollment = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (!enrollment) return res.status(404).json({ message: "Not enrolled" });

    const already = enrollment.completedLessons.some((id) => String(id) === String(lessonId));
    if (!already) enrollment.completedLessons.push(lessonId);

    enrollment.progress = Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100));
    await enrollment.save();

    if (enrollment.progress === 100) {
      await Certificate.findOneAndUpdate(
        { studentId: req.user._id, courseId },
        { $setOnInsert: { studentId: req.user._id, courseId, issuedAt: new Date() } },
        { upsert: true, new: true }
      );
    }
    return res.json({ enrollment });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getMyCertificates(req, res) {
  try {
    const certificates = await Certificate.find({ studentId: req.user._id })
      .populate("courseId")
      .sort({ issuedAt: -1 });
    return res.json({ certificates });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getAllEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find()
      .populate("studentId", "-password")
      .populate("courseId")
      .sort({ createdAt: -1 });
    // Filter out orphaned enrollments where the student was deleted
    const valid = enrollments.filter((e) => e.studentId != null && e.courseId != null);
    return res.json({ enrollments: valid });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function unenrollCourse(req, res) {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOneAndDelete({ studentId: req.user._id, courseId });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

