import axios from "axios";
import config from "../config/env";
import { OpenLibraryResponse, BookSearchResult } from "../types";
import { createError } from "../middleware/error.middleware";
import logger from "../utils/logger";

export class OpenLibraryClient {
  private static readonly baseUrl = config.openLibraryBaseUrl;
  private static readonly timeout = 5000; // 5 seconds

  /**
   * Search books using OpenLibrary API
   */
  static async searchBooks(
    query: string,
    limit: number = 10,
    page: number = 1
  ): Promise<{
    books: BookSearchResult[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Validate input before try-catch
    if (!query?.trim()) {
      throw createError("Search query is required", 400);
    }

    try {
      const offset = (page - 1) * limit;
      const searchUrl = `${this.baseUrl}/search.json`;

      const response = await axios.get<OpenLibraryResponse>(searchUrl, {
        params: {
          q: query.trim(),
          limit,
          offset,
          fields: "key,title,author_name,first_publish_year,isbn",
        },
        timeout: this.timeout,
      });

      const { docs, numFound } = response.data;

      // Transform the response to match our interface
      const books: BookSearchResult[] = docs.map((doc) => ({
        key: doc.key,
        title: doc.title,
        author_name: doc.author_name,
        first_publish_year: doc.first_publish_year,
        isbn: doc.isbn,
      }));

      logger.info("OpenLibrary search completed", {
        query,
        resultsCount: books.length,
        totalFound: numFound,
      });

      return {
        books,
        total: numFound,
        page,
        limit,
      };
    } catch (error) {
      logger.error("OpenLibrary search failed", {
        query,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw createError("Search request timed out", 408);
        }
        const status = error.response?.status;
        if (status === 429) {
          throw createError("Too many requests to OpenLibrary API", 429);
        }
        if (status && status >= 500) {
          throw createError(
            "OpenLibrary service is temporarily unavailable",
            503
          );
        }
      }

      throw createError("Failed to search external library", 500);
    }
  }
}
