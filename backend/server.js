import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import connectDb from "./database/db.js";
import configurePassport from "./middleware/passport.js";
import authorRouter from "./router/authorRouter.js";
import userRouter from "./router/userRouter.js";
import courseRouter from "./router/courseRouter.js";
import enrollmentRouter from "./router/enrollmentRouter.js";
import oauthRouter from "./router/oauthRouter.js";

dotenv.config();

const app = express();

// Support multiple allowed origins (comma-separated in CLIENT_ORIGIN)
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

configurePassport();
app.use(passport.initialize());

app.get("/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

app.use("/api/auth", authorRouter);
app.use("/api/auth/oauth", oauthRouter);
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/enrollments", enrollmentRouter);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Server error";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("Failed to start server:", e);
    process.exit(1);
  });
