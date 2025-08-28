import axios from "axios";
import { OpenLibraryClient } from "../../src/integrations/openLibrary.client";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("OpenLibraryClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchBooks", () => {
    const mockApiResponse = {
      data: {
        docs: [
          {
            key: "/works/OL123W",
            title: "JavaScript: The Good Parts",
            author_name: ["Douglas Crockford"],
            first_publish_year: 2008,
            isbn: ["9780596517748", "0596517742"],
          },
          {
            key: "/works/OL456W",
            title: "Eloquent JavaScript",
            author_name: ["Marijn Haverbeke"],
            first_publish_year: 2011,
            isbn: ["9781593272821"],
          },
        ],
        numFound: 2802,
      },
    };

    it("should search books successfully", async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      const result = await OpenLibraryClient.searchBooks("javascript", 2, 1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/search.json"),
        {
          params: {
            q: "javascript",
            limit: 2,
            offset: 0,
            fields: "key,title,author_name,first_publish_year,isbn",
          },
          timeout: 5000,
        }
      );

      expect(result).toEqual({
        books: [
          {
            key: "/works/OL123W",
            title: "JavaScript: The Good Parts",
            author_name: ["Douglas Crockford"],
            first_publish_year: 2008,
            isbn: ["9780596517748", "0596517742"],
          },
          {
            key: "/works/OL456W",
            title: "Eloquent JavaScript",
            author_name: ["Marijn Haverbeke"],
            first_publish_year: 2011,
            isbn: ["9781593272821"],
          },
        ],
        total: 2802,
        page: 1,
        limit: 2,
      });
    });

    it("should handle pagination correctly", async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      await OpenLibraryClient.searchBooks("javascript", 10, 3);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/search.json"),
        expect.objectContaining({
          params: expect.objectContaining({
            offset: 20, // (3-1) * 10
          }),
        })
      );
    });

    it("should use default pagination when not provided", async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      await OpenLibraryClient.searchBooks("javascript");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/search.json"),
        expect.objectContaining({
          params: expect.objectContaining({
            limit: 10,
            offset: 0,
          }),
        })
      );
    });

    it("should trim query string", async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      await OpenLibraryClient.searchBooks("  javascript  ");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/search.json"),
        expect.objectContaining({
          params: expect.objectContaining({
            q: "javascript",
          }),
        })
      );
    });

    it("should throw error for empty query", async () => {
      await expect(OpenLibraryClient.searchBooks("")).rejects.toThrow(
        "Search query is required"
      );

      await expect(OpenLibraryClient.searchBooks("   ")).rejects.toThrow(
        "Search query is required"
      );
    });

    it("should handle API errors gracefully", async () => {
      const apiError = new Error("Network Error");
      mockedAxios.get.mockRejectedValue(apiError);

      await expect(OpenLibraryClient.searchBooks("javascript")).rejects.toThrow(
        "Failed to search external library"
      );
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("timeout of 5000ms exceeded") as any;
      timeoutError.code = "ECONNABORTED";
      timeoutError.isAxiosError = true;
      mockedAxios.get.mockRejectedValue(timeoutError);
      (
        mockedAxios.isAxiosError as jest.MockedFunction<
          typeof mockedAxios.isAxiosError
        >
      ).mockReturnValue(true);

      await expect(OpenLibraryClient.searchBooks("javascript")).rejects.toThrow(
        "Search request timed out"
      );
    });

    it("should handle empty response from API", async () => {
      const emptyResponse = {
        data: {
          docs: [],
          numFound: 0,
        },
      };
      mockedAxios.get.mockResolvedValue(emptyResponse);

      const result = await OpenLibraryClient.searchBooks("nonexistentbook");

      expect(result).toEqual({
        books: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it("should handle missing fields in API response", async () => {
      const incompleteResponse = {
        data: {
          docs: [
            {
              key: "/works/OL123W",
              title: "Incomplete Book",
              // Missing author_name, first_publish_year, isbn
            },
          ],
          numFound: 1,
        },
      };
      mockedAxios.get.mockResolvedValue(incompleteResponse);

      const result = await OpenLibraryClient.searchBooks("incomplete");

      expect(result.books[0]).toEqual({
        key: "/works/OL123W",
        title: "Incomplete Book",
        author_name: undefined,
        first_publish_year: undefined,
        isbn: undefined,
      });
    });

    it("should respect timeout configuration", async () => {
      mockedAxios.get.mockResolvedValue(mockApiResponse);

      await OpenLibraryClient.searchBooks("javascript");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });
  });
});
