import app from "./app";
import config from "./config/env";
import logger from "./utils/logger";

// Start the server
const server = app.listen(config.port, () => {
  logger.info("Digital Library API v1.0 started", {
    port: config.port,
    environment: config.nodeEnv,
    database: config.dbFile,
    docsUrl: `http://localhost:${config.port}/`,
  });
});

// Graceful shutdown handlers
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    logger.info("HTTP server closed");
    logger.info("Process terminated");
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", { promise, reason });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

export default server;
