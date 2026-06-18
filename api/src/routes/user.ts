import { Router } from "express";
import { userController } from "@/controllers";
import { validateCreateUser, validateUpdateUser } from "@/validators/userValidator";

const router = Router();

router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);
router.post("/", validateCreateUser, userController.createUser);
router.patch("/:id", validateUpdateUser, userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
