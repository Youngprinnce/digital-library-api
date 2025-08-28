import { BookRepository } from "../repositories/book.repository";
import { Book, BookInput, BorrowedBook, PaginatedResult } from "../types";
import { createError } from "../middleware/error.middleware";
import { calculatePagination } from "../utils/pagination";

export class BookService {
  /**
   * Create a new book (admin only)
   */
  static createBook(bookData: BookInput): Book {
    const { title, author, published_year } = bookData;

    // Validate required fields
    if (!title?.trim() || !author?.trim()) {
      throw createError("Title and author are required", 400);
    }

    // Create book
    const book = BookRepository.create({
      title: title.trim(),
      author: author.trim(),
      published_year,
    });

    return book;
  }

  /**
   * Get books with pagination
   */
  static getBooks(page: number = 1, limit: number = 10): PaginatedResult<Book> {
    const offset = (page - 1) * limit;

    const books = BookRepository.findAll(limit, offset);
    const total = BookRepository.getTotalCount();
    const pagination = calculatePagination(page, limit, total);

    return {
      data: books,
      pagination,
    };
  }

  /**
   * Get book by ID
   */
  static getBookById(bookId: number): Book {
    const book = BookRepository.findById(bookId);
    if (!book) {
      throw createError("Book not found", 404);
    }
    return book;
  }

  /**
   * Update book (admin only)
   */
  static updateBook(bookId: number, updates: Partial<BookInput>): Book {
    const book = BookRepository.findById(bookId);
    if (!book) {
      throw createError("Book not found", 404);
    }

    // Trim string fields
    if (updates.title) {
      updates.title = updates.title.trim();
    }
    if (updates.author) {
      updates.author = updates.author.trim();
    }

    const updatedBook = BookRepository.update(bookId, updates);
    if (!updatedBook) {
      throw createError("Failed to update book", 500);
    }

    return updatedBook;
  }

  /**
   * Delete book (admin only)
   */
  static deleteBook(bookId: number): void {
    const book = BookRepository.findById(bookId);
    if (!book) {
      throw createError("Book not found", 404);
    }

    const deleted = BookRepository.delete(bookId);
    if (!deleted) {
      throw createError("Failed to delete book", 500);
    }
  }

  /**
   * Borrow a book
   */
  static borrowBook(
    userId: number,
    bookId: number
  ): {
    book: Book;
    borrowRecord: any;
    dueDate: string;
  } {
    const book = BookRepository.findById(bookId);
    if (!book) {
      throw createError("Book not found", 404);
    }

    // Check if book is available
    if (!BookRepository.isBookAvailable(bookId)) {
      throw createError("Book is not available for borrowing", 400);
    }

    // Check if user already borrowed this book
    if (BookRepository.isBookBorrowedByUser(userId, bookId)) {
      throw createError("You have already borrowed this book", 400);
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateString = dueDate.toISOString();

    // Create borrow record
    const borrowRecord = BookRepository.createBorrowRecord(
      userId,
      bookId,
      dueDateString
    );

    // Update book availability
    BookRepository.updateAvailability(bookId, 0);

    return {
      book,
      borrowRecord,
      dueDate: dueDateString,
    };
  }

  /**
   * Return a book
   */
  static returnBook(
    userId: number,
    bookId: number
  ): {
    book: Book;
    borrowRecord: any;
  } {
    const book = BookRepository.findById(bookId);
    if (!book) {
      throw createError("Book not found", 404);
    }

    // Check if user has borrowed this book
    if (!BookRepository.isBookBorrowedByUser(userId, bookId)) {
      throw createError("You have not borrowed this book", 400);
    }

    // Return the book
    const borrowRecord = BookRepository.returnBook(userId, bookId);
    if (!borrowRecord) {
      throw createError("Failed to return book", 500);
    }

    // Update book availability
    BookRepository.updateAvailability(bookId, 1);

    return {
      book,
      borrowRecord,
    };
  }

  /**
   * Get user's borrowed books
   */
  static getUserBorrowedBooks(userId: number): BorrowedBook[] {
    return BookRepository.getUserBorrowedBooks(userId);
  }

  /**
   * Get book borrow history (admin only)
   */
  static getBookBorrowHistory(bookId: number): any[] {
    const book = BookRepository.findById(bookId);
    if (!book) {
      throw createError("Book not found", 404);
    }

    return BookRepository.getBookBorrowHistory(bookId);
  }

  /**
   * Search books locally
   */
  static searchBooks(
    searchTerm: string,
    page: number = 1,
    limit: number = 10
  ): PaginatedResult<Book> {
    if (!searchTerm?.trim()) {
      throw createError("Search term is required", 400);
    }

    const offset = (page - 1) * limit;

    const books = BookRepository.search(searchTerm.trim(), limit, offset);
    const total = BookRepository.getSearchCount(searchTerm.trim());
    const pagination = calculatePagination(page, limit, total);

    return {
      data: books,
      pagination,
    };
  }
}
