# UMP Redux Backend API

A Node.js/Express backend with MongoDB, JWT authentication, and bcrypt password hashing.

## Features

- User registration and authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (admin/user)
- Protected routes
- MongoDB integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/umpRedux
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
NODE_ENV=development
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Public Routes (No Authentication Required)

#### POST `/api/users/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // optional, defaults to "user"
}
```

#### POST `/api/users/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Returns:
```json
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "jwt_token_here"
}
```

### Protected Routes (Authentication Required)

All protected routes require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

#### GET `/api/users/profile`
Get current user's profile

#### GET `/api/users`
Get all users (requires authentication)

#### GET `/api/users/:id`
Get user by ID (requires authentication)

#### POST `/api/users`
Create new user (requires admin role)
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "user"
}
```

#### PUT `/api/users/:id`
Update user (requires authentication)

#### DELETE `/api/users/:id`
Delete user (requires admin role)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid token or credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- Role-based access control
- Input validation
- Secure password comparison
