import { query, get } from "../config/db";
import { Book, BookInput, BorrowRecord, BorrowedBook } from "../types";

export class BookRepository {
  /**
   * Create a new book
   */
  static create(bookData: BookInput): Book {
    const { title, author, published_year } = bookData;

    const result = query(
      "INSERT INTO books (title, author, published_year, available) VALUES (?, ?, ?, 1)",
      [title, author, published_year]
    );

    const book = this.findById(result.lastInsertRowid);
    if (!book) {
      throw new Error("Failed to create book");
    }
    return book;
  }

  /**
   * Find book by ID
   */
  static findById(id: number): Book | null {
    return get("SELECT * FROM books WHERE id = ?", [id]);
  }

  /**
   * Get all books with pagination
   */
  static findAll(limit: number = 10, offset: number = 0): Book[] {
    return query(
      "SELECT * FROM books ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
  }

  /**
   * Get total count of books
   */
  static getTotalCount(): number {
    const result = get("SELECT COUNT(*) as count FROM books");
    return result.count;
  }

  /**
   * Update book availability
   */
  static updateAvailability(id: number, available: number): Book | null {
    query("UPDATE books SET available = ? WHERE id = ?", [available, id]);
    return this.findById(id);
  }

  /**
   * Create borrow record
   */
  static createBorrowRecord(
    userId: number,
    bookId: number,
    dueDate: string
  ): BorrowRecord {
    const result = query(
      "INSERT INTO borrow_records (user_id, book_id, due_date) VALUES (?, ?, ?)",
      [userId, bookId, dueDate]
    );

    return get("SELECT * FROM borrow_records WHERE id = ?", [
      result.lastInsertRowid,
    ]);
  }

  /**
   * Get user's borrowed books
   */
  static getUserBorrowedBooks(userId: number): BorrowedBook[] {
    return query(
      `
      SELECT 
        b.*,
        br.borrowed_at,
        br.due_date,
        br.returned_at
      FROM books b
      INNER JOIN borrow_records br ON b.id = br.book_id
      WHERE br.user_id = ? AND br.returned_at IS NULL
      ORDER BY br.borrowed_at DESC
    `,
      [userId]
    );
  }

  /**
   * Check if book is currently borrowed by user
   */
  static isBookBorrowedByUser(userId: number, bookId: number): boolean {
    const result = get(
      "SELECT 1 FROM borrow_records WHERE user_id = ? AND book_id = ? AND returned_at IS NULL",
      [userId, bookId]
    );
    return !!result;
  }

  /**
   * Check if book is available for borrowing
   */
  static isBookAvailable(bookId: number): boolean {
    const book = this.findById(bookId);
    return book ? book.available > 0 : false;
  }
}
