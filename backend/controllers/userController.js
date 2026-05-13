import bcrypt from "bcryptjs";

import Author from "../models/author.js";
import Course from "../models/course.js";
import Enrollment from "../models/enrollment.js";
import Certificate from "../models/certificate.js";

export async function getProfile(req, res) {
  try {
    return res.json({ user: req.user });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowed = ["Fullname", "phone", "bio", "photo"];
    const updates = {};
    for (const key of allowed) {
      if (typeof req.body?.[key] !== "undefined") updates[key] = req.body[key];
    }
    const user = await Author.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword required" });
    }
    const user = await Author.findById(req.user._id);
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid current password" });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await Author.find().select("-password").sort({ createdAt: -1 });
    return res.json({ users });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    await Author.findByIdAndDelete(id);
    await Enrollment.deleteMany({ studentId: id });
    await Certificate.deleteMany({ studentId: id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function promoteUser(req, res) {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }
    const user = await Author.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    user.role = user.role === "admin" ? "student" : "admin";
    await user.save();
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getAdminStats(req, res) {
  try {
    const validStudentIds = (await Author.find({}, "_id")).map((u) => u._id);
    const [usersCount, coursesCount, enrollmentsCount, certificatesCount] = await Promise.all([
      Author.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments({ studentId: { $in: validStudentIds } }),
      Certificate.countDocuments({ studentId: { $in: validStudentIds } }),
    ]);
    return res.json({ stats: { usersCount, coursesCount, enrollmentsCount, certificatesCount } });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getStudentStats(req, res) {
  try {
    const studentId = req.user._id;
    const [enrolledCount, certificatesCount, inProgressCount] = await Promise.all([
      Enrollment.countDocuments({ studentId }),
      Certificate.countDocuments({ studentId }),
      Enrollment.countDocuments({ studentId, progress: { $gt: 0, $lt: 100 } }),
    ]);
    return res.json({ stats: { enrolledCount, inProgressCount, certificatesCount } });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function getPublicUsers(req, res) {
  try {
    const users = await Author.find({ emailVerified: true })
      .select("Fullname photo bio role following createdAt")
      .sort({ createdAt: -1 });
    return res.json({ users });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function followUser(req, res) {
  try {
    const { id } = req.params;
    if (String(id) === String(req.user._id)) return res.status(400).json({ message: "Cannot follow yourself" });
    const me = await Author.findById(req.user._id);
    const alreadyFollowing = me.following.some((f) => String(f) === String(id));
    if (alreadyFollowing) {
      me.following = me.following.filter((f) => String(f) !== String(id));
    } else {
      me.following.push(id);
    }
    await me.save();
    return res.json({ following: me.following });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

