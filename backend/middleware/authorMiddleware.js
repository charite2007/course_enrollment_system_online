import jwt from "jsonwebtoken";
import Author from "../models/author.js";

function getTokenFromCookies(req) {
  return req.cookies?.token;
}

export const protection = async (req, res, next) => {
  try {
    const token = getTokenFromCookies(req);
    if (!token) return res.status(401).json({ message: "Not authorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Author.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Not authorized" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

