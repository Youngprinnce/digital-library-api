import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../middleware/error.middleware";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export class UserController {
  /**
   * Register a new user
   */
  static register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const user = await UserService.registerUser(req.body);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user },
      });
    }
  );

  /**
   * Login user
   */
  static login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;
      const result = await UserService.loginUser(email, password);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    }
  );

  /**
   * Get current user profile
   */
  static getCurrentUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const user = UserService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    }
  );

  /**
   * Get user's borrowed books
   */
  static getBorrowedBooks = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user!.id;
      const borrowedBooks = UserService.getUserBorrowedBooks(userId);

      res.status(200).json({
        success: true,
        data: borrowedBooks,
      });
    }
  );
}
