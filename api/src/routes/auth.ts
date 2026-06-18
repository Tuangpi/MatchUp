import { Router } from "express";
import { authController } from "@/controllers";
import { authenticate } from "@/middlewares/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
