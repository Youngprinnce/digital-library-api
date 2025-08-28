import { z } from "zod";

export const bookCreationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must not exceed 200 characters")
    .trim(),
  author: z
    .string()
    .min(1, "Author is required")
    .max(100, "Author must not exceed 100 characters")
    .trim(),
  published_year: z
    .number()
    .int("Published year must be an integer")
    .min(1000, "Published year must be a valid year")
    .max(new Date().getFullYear(), "Published year cannot be in the future")
    .optional(),
});

export const bookSearchSchema = z.object({
  q: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must not exceed 100 characters")
    .trim(),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
});

export type BookCreationInput = z.infer<typeof bookCreationSchema>;
export type BookSearchInput = z.infer<typeof bookSearchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
