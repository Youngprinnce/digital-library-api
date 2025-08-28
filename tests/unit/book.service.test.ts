import { BookService } from "../../src/services/book.service";
import { BookRepository } from "../../src/repositories/book.repository";
import { Book, BookInput } from "../../src/types";

// Mock the repository
jest.mock("../../src/repositories/book.repository");

const mockedBookRepository = BookRepository as jest.Mocked<
  typeof BookRepository
>;

describe("BookService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBook", () => {
    const validBookInput: BookInput = {
      title: "Test Book",
      author: "Test Author",
      published_year: 2023,
    };

    const mockCreatedBook: Book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2023,
      available: 1,
      created_at: "2023-01-01 00:00:00",
    };

    it("should create a book with valid input", () => {
      mockedBookRepository.create.mockReturnValue(mockCreatedBook);

      const result = BookService.createBook(validBookInput);

      expect(mockedBookRepository.create).toHaveBeenCalledWith({
        title: "Test Book",
        author: "Test Author",
        published_year: 2023,
      });
      expect(result).toEqual(mockCreatedBook);
    });

    it("should trim whitespace from title and author", () => {
      const inputWithWhitespace: BookInput = {
        title: "  Test Book  ",
        author: "  Test Author  ",
        published_year: 2023,
      };

      mockedBookRepository.create.mockReturnValue(mockCreatedBook);

      BookService.createBook(inputWithWhitespace);

      expect(mockedBookRepository.create).toHaveBeenCalledWith({
        title: "Test Book",
        author: "Test Author",
        published_year: 2023,
      });
    });

    it("should throw error for empty title", () => {
      const invalidInput: BookInput = {
        title: "",
        author: "Test Author",
        published_year: 2023,
      };

      expect(() => BookService.createBook(invalidInput)).toThrow(
        "Title and author are required"
      );
    });

    it("should throw error for empty author", () => {
      const invalidInput: BookInput = {
        title: "Test Book",
        author: "",
        published_year: 2023,
      };

      expect(() => BookService.createBook(invalidInput)).toThrow(
        "Title and author are required"
      );
    });

    it("should throw error for whitespace-only title", () => {
      const invalidInput: BookInput = {
        title: "   ",
        author: "Test Author",
        published_year: 2023,
      };

      expect(() => BookService.createBook(invalidInput)).toThrow(
        "Title and author are required"
      );
    });
  });

  describe("getBooks", () => {
    const mockBooks: Book[] = [
      {
        id: 1,
        title: "Book 1",
        author: "Author 1",
        published_year: 2021,
        available: 1,
        created_at: "2023-01-01 00:00:00",
      },
      {
        id: 2,
        title: "Book 2",
        author: "Author 2",
        published_year: 2022,
        available: 0,
        created_at: "2023-01-02 00:00:00",
      },
    ];

    it("should return paginated books with default pagination", () => {
      mockedBookRepository.findAll.mockReturnValue(mockBooks);
      mockedBookRepository.getTotalCount.mockReturnValue(2);

      const result = BookService.getBooks();

      expect(mockedBookRepository.findAll).toHaveBeenCalledWith(10, 0);
      expect(mockedBookRepository.getTotalCount).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockBooks,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it("should return paginated books with custom pagination", () => {
      mockedBookRepository.findAll.mockReturnValue([mockBooks[0]]);
      mockedBookRepository.getTotalCount.mockReturnValue(2);

      const result = BookService.getBooks(2, 1);

      expect(mockedBookRepository.findAll).toHaveBeenCalledWith(1, 1);
      expect(result).toEqual({
        data: [mockBooks[0]],
        pagination: {
          page: 2,
          limit: 1,
          total: 2,
          totalPages: 2,
          hasNext: false,
          hasPrev: true,
        },
      });
    });
  });

  describe("getBookById", () => {
    const mockBook: Book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2023,
      available: 1,
      created_at: "2023-01-01 00:00:00",
    };

    it("should return book when found", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);

      const result = BookService.getBookById(1);

      expect(mockedBookRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBook);
    });

    it("should throw error when book not found", () => {
      mockedBookRepository.findById.mockReturnValue(null);

      expect(() => BookService.getBookById(999)).toThrow("Book not found");
    });
  });

  describe("borrowBook", () => {
    const mockBook: Book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2023,
      available: 1,
      created_at: "2023-01-01 00:00:00",
    };

    const mockBorrowRecord = {
      id: 1,
      user_id: 1,
      book_id: 1,
      borrowed_at: "2023-01-01 00:00:00",
      returned_at: undefined,
      due_date: "2023-01-15 00:00:00",
    };

    beforeEach(() => {
      // Mock Date to get consistent due dates in tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2023-01-01"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should successfully borrow an available book", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.isBookAvailable.mockReturnValue(true);
      mockedBookRepository.isBookBorrowedByUser.mockReturnValue(false);
      mockedBookRepository.createBorrowRecord.mockReturnValue(mockBorrowRecord);
      mockedBookRepository.updateAvailability.mockReturnValue(mockBook);

      const result = BookService.borrowBook(1, 1);

      expect(mockedBookRepository.findById).toHaveBeenCalledWith(1);
      expect(mockedBookRepository.isBookAvailable).toHaveBeenCalledWith(1);
      expect(mockedBookRepository.isBookBorrowedByUser).toHaveBeenCalledWith(
        1,
        1
      );
      expect(mockedBookRepository.createBorrowRecord).toHaveBeenCalledWith(
        1,
        1,
        expect.any(String)
      );
      expect(mockedBookRepository.updateAvailability).toHaveBeenCalledWith(
        1,
        0
      );

      expect(result).toEqual({
        book: mockBook,
        borrowRecord: mockBorrowRecord,
        dueDate: expect.any(String),
      });

      // Check that due date is 14 days from now
      const expectedDueDate = new Date(
        "2023-01-15T00:00:00.000Z"
      ).toISOString();
      expect(result.dueDate).toBe(expectedDueDate);
    });

    it("should throw error when book not found", () => {
      mockedBookRepository.findById.mockReturnValue(null);

      expect(() => BookService.borrowBook(1, 999)).toThrow("Book not found");
    });

    it("should throw error when book is not available", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.isBookAvailable.mockReturnValue(false);

      expect(() => BookService.borrowBook(1, 1)).toThrow(
        "Book is not available for borrowing"
      );
    });

    it("should throw error when user already borrowed the book", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.isBookAvailable.mockReturnValue(true);
      mockedBookRepository.isBookBorrowedByUser.mockReturnValue(true);

      expect(() => BookService.borrowBook(1, 1)).toThrow(
        "You have already borrowed this book"
      );
    });
  });

  describe("updateBook", () => {
    const mockBook: Book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2023,
      available: 1,
      created_at: "2023-01-01 00:00:00",
    };

    const updatedBook: Book = {
      ...mockBook,
      title: "Updated Book",
      author: "Updated Author",
    };

    it("should successfully update an existing book", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.update.mockReturnValue(updatedBook);

      const updates = {
        title: "Updated Book",
        author: "Updated Author",
      };

      const result = BookService.updateBook(1, updates);

      expect(mockedBookRepository.findById).toHaveBeenCalledWith(1);
      expect(mockedBookRepository.update).toHaveBeenCalledWith(1, updates);
      expect(result).toEqual(updatedBook);
    });

    it("should trim whitespace from updated fields", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.update.mockReturnValue(updatedBook);

      const updates = {
        title: "  Updated Book  ",
        author: "  Updated Author  ",
      };

      BookService.updateBook(1, updates);

      expect(mockedBookRepository.update).toHaveBeenCalledWith(1, {
        title: "Updated Book",
        author: "Updated Author",
      });
    });

    it("should throw error when book not found", () => {
      mockedBookRepository.findById.mockReturnValue(null);

      expect(() => BookService.updateBook(999, { title: "New Title" })).toThrow(
        "Book not found"
      );
    });

    it("should throw error when update fails", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.update.mockReturnValue(null);

      expect(() => BookService.updateBook(1, { title: "New Title" })).toThrow(
        "Failed to update book"
      );
    });
  });

  describe("deleteBook", () => {
    const mockBook: Book = {
      id: 1,
      title: "Test Book",
      author: "Test Author",
      published_year: 2023,
      available: 1,
      created_at: "2023-01-01 00:00:00",
    };

    it("should successfully delete an existing book", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.delete.mockReturnValue(true);

      expect(() => BookService.deleteBook(1)).not.toThrow();

      expect(mockedBookRepository.findById).toHaveBeenCalledWith(1);
      expect(mockedBookRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error when book not found", () => {
      mockedBookRepository.findById.mockReturnValue(null);

      expect(() => BookService.deleteBook(999)).toThrow("Book not found");
    });

    it("should throw error when deletion fails", () => {
      mockedBookRepository.findById.mockReturnValue(mockBook);
      mockedBookRepository.delete.mockReturnValue(false);

      expect(() => BookService.deleteBook(1)).toThrow("Failed to delete book");
    });
  });
});
