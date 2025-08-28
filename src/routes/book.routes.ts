import { Router } from "express";
import { BookController } from "../controllers/book.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { validateBody, validateQuery } from "../middleware/validate.middleware";
import {
  bookCreationSchema,
  bookSearchSchema,
  paginationSchema,
} from "../validators/book.validators";

const router = Router();

// Public routes
router.get("/", validateQuery(paginationSchema), BookController.getBooks);
router.get(
  "/search",
  validateQuery(bookSearchSchema.merge(paginationSchema)),
  BookController.searchBooksExternal
);

// Protected routes (authenticated users)
router.post("/:id/borrow", authenticate, BookController.borrowBook);

// Admin-only routes
router.post(
  "/",
  authenticate,
  requireAdmin,
  validateBody(bookCreationSchema),
  BookController.createBook
);

export default router;
