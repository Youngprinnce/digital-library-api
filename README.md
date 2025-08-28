# Digital Library API

A simple REST API for managing books and users in a digital library.

## Features

- User registration and authentication
- Book management (admin only)
- Book borrowing system
- JWT token-based security

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server (production)
npm start
```

The API will be running at `http://localhost:3000`

## Database Setup

The SQLite database is automatically created when you first start the server. To rebuild the database:

```bash
# Remove existing database
rm library.sqlite

# Start the server (database will be recreated)
npm start
```

## Testing

```bash
# Run all tests
npm test
```

## Manual API Testing

After starting the server, you can test the endpoints:

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Register a user
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# 3. Login and get token
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# 4. Create admin user
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "admin@example.com", "password": "admin123", "role": "admin"}'

# 5. Login as admin and create a book (use token from login response)
TOKEN="your-admin-token-here"
curl -X POST http://localhost:3000/books \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "JavaScript: The Good Parts", "author": "Douglas Crockford", "published_year": 2008}'

# 6. Get books list
curl http://localhost:3000/books

# 7. Borrow a book (use user token)
USER_TOKEN="your-user-token-here"
curl -X POST http://localhost:3000/books/1/borrow \
  -H "Authorization: Bearer $USER_TOKEN"
```

## API Endpoints

### Users

- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `GET /users/me` - Get current user profile
- `GET /users/me/borrowed-books` - Get user's borrowed books

### Books

- `GET /books` - Get all books
- `POST /books` - Create a book (admin only)
- `POST /books/:id/borrow` - Borrow a book

### Other

- `GET /health` - Health check
- `GET /books/search` - Search external books

## Environment Setup

Copy `.env.example` to `.env` and configure as needed.

## Tech Stack

- Node.js + Express
- TypeScript
- SQLite
- JWT Authentication
- Jest for testing
