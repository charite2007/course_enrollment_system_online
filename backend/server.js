import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

import connectDb from "./database/db.js";
import configurePassport from "./middleware/passport.js";
import authorRouter from "./router/authorRouter.js";
import userRouter from "./router/userRouter.js";
import courseRouter from "./router/courseRouter.js";
import enrollmentRouter from "./router/enrollmentRouter.js";
import oauthRouter from "./router/oauthRouter.js";
import chatRouter from "./router/chatRouter.js";
import Message from "./models/message.js";
import Author from "./models/author.js";
import jwt from "jsonwebtoken";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

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
app.use("/api/chat", chatRouter);

// Serve React frontend in production
const distPath = join(__dirname, "../frontend/dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("{*path}", (req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Authenticate socket via JWT cookie or token query
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Unauthorized"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Author.findById(decoded.id).select("Fullname photo");
    if (!user) return next(new Error("Unauthorized"));
    socket.user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  socket.on("join_room", (room) => {
    socket.join(room || "global");
  });

  socket.on("typing", ({ room = "global", name }) => {
    socket.to(room).emit("typing", { name });
  });

  socket.on("send_message", async ({ text, room = "global", replyTo = null }) => {
    if (!text?.trim()) return;
    const msgData = { sender: socket.user._id, text: text.trim(), room };
    if (replyTo?.messageId) msgData.replyTo = replyTo;
    const msg = await Message.create(msgData);
    const populated = await msg.populate("sender", "Fullname photo");
    io.to(room).emit("new_message", populated);
  });

  socket.on("react_message", async ({ messageId, emoji, room = "global" }) => {
    if (!messageId || !emoji) return;
    const msg = await Message.findById(messageId);
    if (!msg) return;
    if (!msg.reactions) msg.reactions = {};
    const userId = String(socket.user._id);
    // Toggle: if same emoji remove, else set new
    if (msg.reactions[userId] === emoji) {
      delete msg.reactions[userId];
    } else {
      msg.reactions[userId] = emoji;
    }
    msg.markModified("reactions");
    await msg.save();
    io.to(room).emit("reaction_update", { messageId, reactions: msg.reactions });
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  httpServer.listen(PORT, () => console.log(`API running on port ${PORT}`));
}).catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
