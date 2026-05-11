import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Author from "../models/author.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(req, res) {
  try {
    const { Fullname, email, password, adminSecret } = req.body;
    const existing = await Author.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const role =
      adminSecret && adminSecret === process.env.ADMIN_SECRET ? "admin" : "student";

    const hashed = await bcrypt.hash(password, 10);
    const user = await Author.create({ Fullname, email, password: hashed, role });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    const safeUser = await Author.findById(user._id).select("-password");
    return res.status(201).json({ user: safeUser });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await Author.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    const safeUser = await Author.findById(user._id).select("-password");
    return res.json({ user: safeUser });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

export async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

