import { Router } from "express";
import { messageController } from "@/controllers";
import { authenticate } from "@/middlewares/auth";

const router = Router();

router.get("/:gameId/messages", authenticate, messageController.getMessages);
router.post("/:gameId/messages", authenticate, messageController.createMessage);

export default router;
