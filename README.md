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

# Start the server
npm run dev
```

The API will be running at `http://localhost:3000`

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

## Example Usage

```bash
# Register a user
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'

# Get books
curl http://localhost:3000/books
```

## Environment

Copy `.env.example` to `.env` and configure as needed.

## Tech Stack

- Node.js + Express
- TypeScript
- SQLite
- JWT Authentication
- Jest for testing
