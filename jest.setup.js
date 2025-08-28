// Jest setup file
process.env.NODE_ENV = 'test';
process.env.DATABASE_FILE = './test-library.sqlite';
process.env.JWT_SECRET = 'test-secret-key';

// Clean up test database before tests
const fs = require('fs');
const path = require('path');

beforeAll(() => {
  const testDbPath = path.join(process.cwd(), 'test-library.sqlite');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

afterAll(() => {
  const testDbPath = path.join(process.cwd(), 'test-library.sqlite');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});
