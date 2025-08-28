import { PaginationOptions, PaginatedResult } from "../types";

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginatedResult<any>["pagination"] {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Validate and normalize pagination parameters
 */
export function validatePaginationParams(
  page?: string | number,
  limit?: string | number,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationOptions {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.max(
    1,
    Math.min(maxLimit, parseInt(String(limit || defaultLimit), 10))
  );

  return {
    page: pageNum,
    limit: limitNum,
  };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
