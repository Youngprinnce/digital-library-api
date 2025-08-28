import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/env";
import { JWTPayload } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * JWT authentication middleware
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Access token is required",
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/**
 * Middleware to check if user is admin
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
}

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
      req.user = decoded;
    } catch (error) {
    }
  }

  next();
}
