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
}
