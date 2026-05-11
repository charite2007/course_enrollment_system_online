import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

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

function oauthSuccess(req, res) {
  const token = signToken(req.user._id);
  setAuthCookie(res, token);
  const client = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.redirect(`${client}/dashboard`);
}

function oauthFailure(req, res) {
  const client = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.redirect(`${client}/login?error=oauth_failed`);
}

// ── Which providers are configured ─────────────────────
router.get("/providers", (req, res) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
});

// ── Google ──────────────────────────────────────────────
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) return res.status(501).json({ message: "Google OAuth not configured" });
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

// ── GitHub ──────────────────────────────────────────────
router.get("/github", (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) return res.status(501).json({ message: "GitHub OAuth not configured" });
  passport.authenticate("github", { scope: ["user:email"], session: false })(req, res, next);
});

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/api/auth/oauth/failure" }),
  oauthSuccess
);

// ── Failure fallback ────────────────────────────────────
router.get("/failure", oauthFailure);

export default router;
