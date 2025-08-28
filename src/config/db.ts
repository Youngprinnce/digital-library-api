import Database, { Database as BetterSqlite3Database } from "better-sqlite3";
import config from "./env";
import logger from "../utils/logger";

// Initialize SQLite database connection
const db: BetterSqlite3Database = new Database(config.dbFile);

// Enable foreign key constraints
db.pragma("foreign_keys = ON");

/**
 * Execute a query with parameters
 */
export function query(sql: string, params: any[] = []): any {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      return stmt.all(params);
    } else {
      return stmt.run(params);
    }
  } catch (error) {
    logger.error("Database query error", {
      error: error instanceof Error ? error.message : error,
      sql,
    });
    throw error;
  }
}

/**
 * Get a single row
 */
export function get(sql: string, params: any[] = []): any {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(params);
  } catch (error) {
    logger.error("Database get error", {
      error: error instanceof Error ? error.message : error,
      sql,
    });
    throw error;
  }
}

/**
 * Initialize database tables
 */
export function initializeDatabase(): void {
  try {
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create books table
    db.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        published_year INTEGER,
        available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create borrow_records table
    db.exec(`
      CREATE TABLE IF NOT EXISTS borrow_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        borrowed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        returned_at DATETIME,
        due_date DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      )
    `);

    logger.info("Database tables initialized successfully");
  } catch (error) {
    logger.error("Error initializing database", {
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }
}

export default db;
