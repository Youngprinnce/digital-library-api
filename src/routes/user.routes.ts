import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  userRegistrationSchema,
  userLoginSchema,
} from "../validators/user.validators";

const router = Router();

// Public routes
router.post(
  "/register",
  validateBody(userRegistrationSchema),
  UserController.register
);
router.post("/login", validateBody(userLoginSchema), UserController.login);

// Protected routes
router.get("/me", authenticate, UserController.getCurrentUser);
router.get("/me/borrowed-books", authenticate, UserController.getBorrowedBooks);

export default router;
