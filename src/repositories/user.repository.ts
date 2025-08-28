import { query, get } from "../config/db";
import { User, UserInput } from "../types";

export class UserRepository {
  /**
   * Create a new user
   */
  static create(
    userData: Omit<UserInput, "password"> & { password_hash: string }
  ): User {
    const { username, email, password_hash, role = "user" } = userData;

    const result = query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, password_hash, role]
    );

    const user = this.findById(result.lastInsertRowid);
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user;
  }

  /**
   * Find user by ID
   */
  static findById(id: number): User | null {
    return get("SELECT * FROM users WHERE id = ?", [id]);
  }

  /**
   * Find user by email
   */
  static findByEmail(email: string): User | null {
    return get("SELECT * FROM users WHERE email = ?", [email]);
  }

  /**
   * Check if email exists
   */
  static emailExists(email: string): boolean {
    const result = get("SELECT 1 FROM users WHERE email = ?", [email]);
    return !!result;
  }

  /**
   * Check if username exists
   */
  static usernameExists(username: string): boolean {
    const result = get("SELECT 1 FROM users WHERE username = ?", [username]);
    return !!result;
  }
}
