import { Router } from "express";
import bookRoutes from "./book.routes";
import userRoutes from "./user.routes";

const router = Router();

// Root endpoint - API information
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Digital Library API",
    version: "2.0.0",
    description: "A REST API for managing books and users in a digital library",
    endpoints: {
      health: "/health",
      books: "/books",
      users: "/users",
      search: "/books/search",
    },
  });
});

// Health check endpoint - system status
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    message: "Digital Library API is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
router.use("/books", bookRoutes);
router.use("/users", userRoutes);

export default router;
