import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { User, UserInput, JWTPayload } from "../types";
import { createError } from "../middleware/error.middleware";
import config from "../config/env";

export class UserService {
  /**
   * Register a new user
   */
  static async registerUser(
    userData: UserInput
  ): Promise<Omit<User, "password_hash">> {
    const { username, email, password, role = "user" } = userData;

    // Check if email already exists
    if (UserRepository.emailExists(email)) {
      throw createError("Email already exists", 409);
    }

    // Check if username already exists
    if (UserRepository.usernameExists(username)) {
      throw createError("Username already exists", 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = UserRepository.create({
      username,
      email,
      password_hash: passwordHash,
      role,
    });

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Login user
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<{
    user: Omit<User, "password_hash">;
    token: string;
  }> {
    // Find user by email
    const user = UserRepository.findByEmail(email);
    if (!user) {
      throw createError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw createError("Invalid email or password", 401);
    }

    // Generate JWT token
    const tokenPayload: JWTPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, {
      expiresIn: "24h",
    });

    // Return user without password hash and token
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Get user profile
   */
  static getUserProfile(userId: number): Omit<User, "password_hash"> {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw createError("User not found", 404);
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Get user's borrowed books
   */
  static getUserBorrowedBooks(userId: number): any[] {
    // Import BookRepository here to avoid circular dependency
    const { BookRepository } = require("../repositories/book.repository");
    return BookRepository.getUserBorrowedBooks(userId);
  }
}
