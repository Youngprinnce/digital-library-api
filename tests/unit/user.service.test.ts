import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";
import { User, UserInput } from "../../src/types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock the dependencies
jest.mock("../../src/repositories/user.repository");
jest.mock("../../src/repositories/book.repository", () => ({
  BookRepository: {
    getUserBorrowedBooks: jest.fn(),
  },
}));
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

const mockedUserRepository = UserRepository as jest.Mocked<
  typeof UserRepository
>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock the BookRepository that's used in getUserBorrowedBooks
const mockedBookRepository = {
  getUserBorrowedBooks: jest.fn(),
};

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    const validUserInput: UserInput = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "user",
    };

    const mockUser: User = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password_hash: "hashedpassword",
      role: "user",
      created_at: "2023-01-01 00:00:00",
    };

    it("should successfully register a new user", async () => {
      mockedUserRepository.emailExists.mockReturnValue(false);
      mockedUserRepository.usernameExists.mockReturnValue(false);
      mockedBcrypt.hash.mockResolvedValue("hashedpassword" as never);
      mockedUserRepository.create.mockReturnValue(mockUser);

      const result = await UserService.registerUser(validUserInput);

      expect(mockedUserRepository.emailExists).toHaveBeenCalledWith(
        validUserInput.email
      );
      expect(mockedUserRepository.usernameExists).toHaveBeenCalledWith(
        validUserInput.username
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        validUserInput.password,
        12
      );
      expect(mockedUserRepository.create).toHaveBeenCalledWith({
        username: validUserInput.username,
        email: validUserInput.email,
        password_hash: "hashedpassword",
        role: validUserInput.role,
      });

      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        created_at: mockUser.created_at,
      });
    });

    it("should throw error for duplicate email", async () => {
      mockedUserRepository.emailExists.mockReturnValue(true);

      await expect(UserService.registerUser(validUserInput)).rejects.toThrow(
        "Email already exists"
      );
    });

    it("should throw error for duplicate username", async () => {
      mockedUserRepository.emailExists.mockReturnValue(false);
      mockedUserRepository.usernameExists.mockReturnValue(true);

      await expect(UserService.registerUser(validUserInput)).rejects.toThrow(
        "Username already exists"
      );
    });

    it("should default role to user if not provided", async () => {
      const inputWithoutRole: UserInput = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      mockedUserRepository.emailExists.mockReturnValue(false);
      mockedUserRepository.usernameExists.mockReturnValue(false);
      mockedBcrypt.hash.mockResolvedValue("hashedpassword" as never);
      mockedUserRepository.create.mockReturnValue(mockUser);

      await UserService.registerUser(inputWithoutRole);

      expect(mockedUserRepository.create).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password_hash: "hashedpassword",
        role: "user",
      });
    });
  });

  describe("loginUser", () => {
    const mockUser: User = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password_hash: "hashedpassword",
      role: "user",
      created_at: "2023-01-01 00:00:00",
    };

    const mockToken = "jwt.token.here";

    it("should successfully login with valid credentials", async () => {
      mockedUserRepository.findByEmail.mockReturnValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue(mockToken as never);

      const result = await UserService.loginUser(
        "test@example.com",
        "password123"
      );

      expect(mockedUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedpassword"
      );
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        },
        expect.any(String),
        { expiresIn: "24h" }
      );

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
          created_at: mockUser.created_at,
        },
        token: mockToken,
      });
    });

    it("should throw error for non-existent user", async () => {
      mockedUserRepository.findByEmail.mockReturnValue(null);

      await expect(
        UserService.loginUser("nonexistent@example.com", "password123")
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw error for incorrect password", async () => {
      mockedUserRepository.findByEmail.mockReturnValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        UserService.loginUser("test@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("getUserProfile", () => {
    const mockUser: User = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password_hash: "hashedpassword",
      role: "user",
      created_at: "2023-01-01 00:00:00",
    };

    it("should return user when found", () => {
      mockedUserRepository.findById.mockReturnValue(mockUser);

      const result = UserService.getUserProfile(1);

      expect(mockedUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        created_at: mockUser.created_at,
      });
    });

    it("should throw error when user not found", () => {
      mockedUserRepository.findById.mockReturnValue(null);

      expect(() => UserService.getUserProfile(999)).toThrow("User not found");
    });
  });

  describe("getUserBorrowedBooks", () => {
    const mockBorrowedBooks = [
      {
        id: 1,
        title: "Book 1",
        author: "Author 1",
        published_year: 2021,
        available: 0,
        created_at: "2023-01-01 00:00:00",
        borrowed_at: "2023-01-01 10:00:00",
        due_date: "2023-01-15T10:00:00.000Z",
        returned_at: undefined,
      },
      {
        id: 2,
        title: "Book 2",
        author: "Author 2",
        published_year: 2022,
        available: 0,
        created_at: "2023-01-02 00:00:00",
        borrowed_at: "2023-01-02 10:00:00",
        due_date: "2023-01-16T10:00:00.000Z",
        returned_at: "2023-01-10 10:00:00",
      },
    ];

    beforeEach(() => {
      // Mock the require for BookRepository in the UserService
      jest.doMock("../../src/repositories/book.repository", () => ({
        BookRepository: mockedBookRepository,
      }));
    });

    it("should return borrowed books for user", () => {
      mockedBookRepository.getUserBorrowedBooks.mockReturnValue(
        mockBorrowedBooks
      );

      const result = UserService.getUserBorrowedBooks(1);

      expect(mockedBookRepository.getUserBorrowedBooks).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBorrowedBooks);
    });

    it("should return empty array when user has no borrowed books", () => {
      mockedBookRepository.getUserBorrowedBooks.mockReturnValue([]);

      const result = UserService.getUserBorrowedBooks(1);

      expect(result).toEqual([]);
    });
  });
});
