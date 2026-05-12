import { Router } from "express";
import { protection } from "../middleware/authorMiddleware.js";
import { getMessages } from "../controllers/chatController.js";

const router = Router();

router.get("/", protection, getMessages);

export default router;
