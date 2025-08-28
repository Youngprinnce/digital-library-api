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
   * Find user by username
   */
  static findByUsername(username: string): User | null {
    return get("SELECT * FROM users WHERE username = ?", [username]);
  }

  /**
   * Update user
   */
  static update(id: number, userData: Partial<UserInput>): User | null {
    const fields = Object.keys(userData);
    const values = Object.values(userData);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const sql = `UPDATE users SET ${setClause} WHERE id = ?`;

    query(sql, [...values, id]);
    return this.findById(id);
  }

  /**
   * Delete user
   */
  static delete(id: number): boolean {
    const result = query("DELETE FROM users WHERE id = ?", [id]);
    return result.changes > 0;
  }

  /**
   * Get all users with pagination
   */
  static findAll(limit: number = 10, offset: number = 0): User[] {
    return query(
      "SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
  }

  /**
   * Get total count of users
   */
  static getTotalCount(): number {
    const result = get("SELECT COUNT(*) as count FROM users");
    return result.count;
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
