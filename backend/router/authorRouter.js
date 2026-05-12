import { Router } from "express";
import { register, login, logout, getToken } from "../controllers/authorController.js";
import { registerValidation, loginValidation, handleValidation } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/register", registerValidation, handleValidation, register);
router.post("/login", loginValidation, handleValidation, login);
router.post("/logout", logout);
router.get("/token", getToken);

export default router;
