import { config as dotenvConfig } from "dotenv";

// Load environment variables
dotenvConfig();

interface Config {
  port: number;
  nodeEnv: string;
  dbFile: string;
  jwtSecret: string;
  listPerPage: number;
  openLibraryBaseUrl: string;
  logLevel: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  dbFile: process.env.DATABASE_FILE || "./library.sqlite",
  jwtSecret: process.env.JWT_SECRET || "secret",
  listPerPage: parseInt(process.env.LIST_PER_PAGE || "10", 10),
  openLibraryBaseUrl:
    process.env.OPENLIBRARY_BASE_URL || "https://openlibrary.org",
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;
