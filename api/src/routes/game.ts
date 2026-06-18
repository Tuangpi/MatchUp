import { Router } from "express";
import { gameController } from "@/controllers";
import { authenticate, optionalAuth } from "@/middlewares/auth";
import { validateCreateGame, validateJoinGame } from "@/validators/gameValidator";

const router = Router();

router.get("/", optionalAuth, gameController.getGames);
router.get("/:id", optionalAuth, gameController.getGameById);
router.post("/", authenticate, validateCreateGame, gameController.createGame);
router.patch("/:id", authenticate, gameController.updateGame);
router.post("/:id/join", authenticate, validateJoinGame, gameController.joinGame);
router.post("/:id/leave", authenticate, gameController.leaveGame);
router.post("/:id/attendance", authenticate, gameController.markAttendance);
router.delete("/:id", authenticate, gameController.deleteGame);

export default router;
