import { Request, Response } from "express";
import { BookService } from "../services/book.service";
import { OpenLibraryClient } from "../integrations/openLibrary.client";
import { asyncHandler } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { validatePaginationParams } from "../utils/pagination";

export class BookController {
  /**
   * Get all books with pagination
   */
  static getBooks = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { page, limit } = validatePaginationParams(
        req.query.page as string,
        req.query.limit as string
      );

      const result = BookService.getBooks(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    }
  );

  /**
   * Create a new book (admin only)
   */
  static createBook = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const book = BookService.createBook(req.body);

      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: { book },
      });
    }
  );

  /**
   * Borrow a book
   */
  static borrowBook = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const bookId = parseInt(req.params.id, 10);
      const userId = req.user!.id;

      const result = BookService.borrowBook(userId, bookId);

      res.status(200).json({
        success: true,
        message: "Book borrowed successfully",
        data: result,
      });
    }
  );

  /**
   * Search books using Open Library API
   */
  static searchBooksExternal = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { q: query, page = 1, limit = 10 } = req.query;
      const { page: validatedPage, limit: validatedLimit } =
        validatePaginationParams(page as string, limit as string);

      const results = await OpenLibraryClient.searchBooks(
        query as string,
        validatedPage,
        validatedLimit
      );

      res.status(200).json({
        success: true,
        data: results,
      });
    }
  );
}
