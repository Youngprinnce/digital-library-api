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
   * Update user profile
   */
  static async updateUserProfile(
    userId: number,
    updates: Partial<Omit<UserInput, "password">>
  ): Promise<Omit<User, "password_hash">> {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw createError("User not found", 404);
    }

    // Check if email is being updated and already exists
    if (updates.email && updates.email !== user.email) {
      if (UserRepository.emailExists(updates.email)) {
        throw createError("Email already exists", 409);
      }
    }

    // Check if username is being updated and already exists
    if (updates.username && updates.username !== user.username) {
      if (UserRepository.usernameExists(updates.username)) {
        throw createError("Username already exists", 409);
      }
    }

    const updatedUser = UserRepository.update(userId, updates);
    if (!updatedUser) {
      throw createError("Failed to update user", 500);
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw createError("User not found", 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isCurrentPasswordValid) {
      throw createError("Current password is incorrect", 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    UserRepository.update(userId, { password_hash: newPasswordHash } as any);
  }

  /**
   * Get all users (admin only)
   */
  static getAllUsers(
    page: number = 1,
    limit: number = 10
  ): {
    users: Omit<User, "password_hash">[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } {
    const offset = (page - 1) * limit;
    const users = UserRepository.findAll(limit, offset);
    const total = UserRepository.getTotalCount();
    const totalPages = Math.ceil(total / limit);

    const usersWithoutPasswords = users.map(
      ({ password_hash, ...user }) => user
    );

    return {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Delete user (admin only)
   */
  static deleteUser(userId: number): void {
    const user = UserRepository.findById(userId);
    if (!user) {
      throw createError("User not found", 404);
    }

    const deleted = UserRepository.delete(userId);
    if (!deleted) {
      throw createError("Failed to delete user", 500);
    }
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
