import { Router } from "express";
import { register, login, logout } from "../controllers/authorController.js";
import {
  registerValidation,
  loginValidation,
  handleValidation,
} from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/register", registerValidation, handleValidation, register);
router.post("/login", loginValidation, handleValidation, login);
router.post("/logout", logout);

export default router;

