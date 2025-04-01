# Digital Library API Documentation

A native PHP digital library system with JWT authentication, file management, and role-based access control.

## Base URL

```
http://localhost/digital_books
```

All API endpoints should be prefixed with this base URL. For example:

```
POST http://localhost/digital_books/auth/login
GET http://localhost/digital_books/books
```

## Default Admin Account

After importing the database schema, create an admin account with these credentials:

```
{
    "username": "archivus123",
    "password": "securePass456",
    "email": "admin2@library.com",
    "full_name": "Archivus Sterling",
    "gender": "male",
    "role": "admin"
}
```

## Profile Requirements

### Admin Profile

Required fields:

```
{
    "username": "string (5-50 characters)",
    "email": "valid email format",
    "password": "string (min 8 characters)",
    "full_name": "string",
    "gender": (male, female),
    "contact_number": "string",
    "address": "string",
    "role": "admin" (automatically set)
}
```

### Reader Profile

Required fields:

```
{
    "username": "string (5-50 characters)",
    "email": "valid email format",
    "password": "string (min 8 characters)",
    "full_name": "string",
    "gender": (male, female),
    "contact_number": "string (optional)",
    "address": "string (optional)",
    "role": "reader" (automatically set)
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### Register

```
POST /auth/register

Request:
{
    "username": "string",
    "email": "string",
    "password": "string",
    "full_name": "string",
    "gender": "Male | Female"
}

Response:
{
    "success": true,
    "message": "User registered successfully"
    "user": {
        "id": number,
        "username": "string",
        "email": "string",
        "full_name": "string",
        "gender": "string",
        "contact_number": "string",
        "address": "string",
        "role": "admin"
    }
}
```

#### Login

```
POST /auth/login

Request:
{
    "username": "string",
    "password": "string"
}

Response:
{
  "success": true,
  "message": "User logged in successfully",
  "user": {
    "id":number,
    "username": "string",
    "email": "string",
    "role": "admin | reader",
    "full_name": "string"
  },
  "token": "JWT_TOKEN"
}
```

## Books API

### Create a Book

- **URL**: `/api/books`
- **Method**: `POST`
- **Auth Required**: Yes (Admin only)
- **Content-Type**: `multipart/form-data`

**Request Body**:

```

{
"title": "string (required)",
"author": "string (required)",
"description": "string (optional)",
"category_id": "integer (optional)",
"book_file": "file (optional) - Book file in PDF, EPUB, DOC, MOBI, RTF, or AZW format (max 50MB)",
"cover_image": "file (optional) - Book cover image (max 5MB)"
}

```

**Response**:

```json
{
  "success": true,
  "message": "Book created successfully",
  "book": {
    "id": "integer",
    "title": "string",
    "author": "string",
    "description": "string",
    "category_id": "integer",
    "book_file_name": "string",
    "book_file_type": "string",
    "cover_image_name": "string",
    "cover_image_type": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Update a Book

- **URL**: `/api/books/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin only)
- **Content-Type**: `multipart/form-data`

**Request Body**:

```

{
    "title": "string (optional)",
    "author": "string (optional)",
    "description": "string (optional)",
    "category_id": "integer (optional)",
    "book_file": "file (optional) - Book file in PDFformat (max 50MB)",
    "cover_image": "file (optional) - Book cover image (max 5MB)"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Book updated successfully",
  "book": {
    "id": "integer",
    "title": "string",
    "author": "string",
    "description": "string",
    "category_id": "integer",
    "book_file_name": "string",
    "book_file_type": "string",
    "cover_image_name": "string",
    "cover_image_type": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Get All Books

- **URL**: `/api/books/all`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**:

```json
{
  "success": true,
  "books": [
    {
      "id": "integer",
      "title": "string",
      "author": "string",
      "description": "string",
      "category_id": "integer",
      "book_file_name": "string",
      "cover_image_name": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "category_name": "string"
    }
  ]
}
```

### Get Book by ID

- **URL**: `/api/books/{id}`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**:

```json
{
  "success": true,
  "book": {
    "id": "integer",
    "title": "string",
    "author": "string",
    "description": "string",
    "category_id": "integer",
    "book_file_name": "string",
    "cover_image_name": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "category_name": "string"
  }
}
```

### Search Books

- **URL**: `/api/books?q={search_query}`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**:

```json
{
  "success": true,
  "books": [
    {
      "id": "integer",
      "title": "string",
      "author": "string",
      "description": "string",
      "book_file_name": "string",
      "cover_image_name": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "category_name": "string"
    }
  ]
}
```

### Download Book File

- **URL**: `/api/books/{id}/download`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Binary file stream with appropriate Content-Type header

### Get Book Cover Image

- **URL**: `/api/books/{id}/cover`
- **Method**: `GET`
- **Auth Required**: Yes

**Response**: Binary image stream with appropriate Content-Type header

### Delete a Book

- **URL**: `/api/books/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin only)

**Response**:

```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

### Categories

#### Get All Categories

```
GET /categories

Response:
{
  "success": true,
  "categories": [
    {
      "id": number,
      "category_name": "string",
      "description": "string",
      "created_at": "2025-02-22 12:29:48",
      "updated_at": "2025-02-22 12:29:48"
    }
  ]
}
```

#### Get Books by Category

```
GET /categories/books/{category-name}

Response:
{
  "success": true,
  "books": [
    {
      "id": number,
      "title": "string",
      "author": "string",
      "category_id": number,
      "description": "string",
      "file_path": file,
      "cover_image_path": image,
      "created_at": "date and time",
      "updated_at": "date and time",
      "category_name": "string"
    }
  ]
}
```

#### Create Category

```
POST /categories

Request:
{
    "category_name": "string",
    "description": "string"
}

Response:
{
    "success": true,
    "message": "Category created successfully",
    "category": {
        "category_name": "string",
        "description": "string"
    }
}
```

#### Update Category

```
PUT /categories/{id}

Request:
{
    "name": "string",
    "description": "string"
}

Response:
{
    "success": true,
    "message": "Category updated successfully",
    "category": {
        "name": "string",
        "description": "string"
    }
}
```

#### Delete Category

```
DELETE /categories/{id}

Response:
{
    "success": true,
    "message": "Category deleted successfully"
}
```

### User Profile

#### Get Profile

```
GET /profile/{id}

Response:
{
  "success": true,
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    "full_name": "string",
    "gender": "male | female",
    "contact_number": "string",
    "address": "string",
    "role": "reader"
  }
}
```

#### Update Profile

```
PUT /profile/{id}

Request:
{
    "username": "string",
    "email": "string",
    "full_name": "string",
    "gender": "male|female",
    "contact_number": "string",
    "address": "string"
}

Response:
{
    "success": true,
    "message": "Profile updated successfully",
    "user": {
        "id": number,
        "username": "string",
        "email": "string",
        "full_name": "string",
        "gender": "string",
        "contact_number": "string",
        "address": "string"
    }
}
```

#### Change Password

```
POST /users/change-password

Request:
{
    "current_password": "string",
    "new_password": "string"
}

Response:
{
    "success": true,
    "message": "Password updated successfully"
}

Error Response (401):
{
    "error": "Current password is incorrect"
}
```

### Bookmarks

#### Get All Bookmarks

```
GET /bookmarks

Response:
{
    "success": true,
    "books": [
        {
            "id": number,
            "book_id": number,
            "title": "string",
            "author": "string",
            "description": "string",
            "cover_image_path": "string",
            "created_at": "datetime"
        }
    ]
}
```

#### Add Bookmark

```
POST /bookmarks/{id}

Response:
{
    "success": true,
    "message": "Book added to bookmarks"
}
```

#### Remove Bookmark

```
DELETE /bookmarks/{id}

Response:
{
    "success": true,
    "message": "Book removed from bookmarks"
}
```

### Admin Routes

#### Get All Users

```
GET /users

Response:
{
  "success": true,
  "users": [
    {
      "id": number,
      "username": "string",
      "email": "string",
      "full_name": "string",
      "gender": "string",
      "contact_number": "string",
      "address": "string",
      "role": "string",
    },
    /../
  ]
}
```

#### Delete User

```
DELETE /users/{id}

Response:
{
    "success": true,
    "message": "User deleted successfully"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```
{
    "error": "Error message description"
}
```

Common HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

## File Upload Specifications

- Allowed file types: PDF, EPUB, DOC, MOBI, RTF, AZW
- Allowed file types for cover image book: JPEG, PNG, GIF
- Maximum file size: 50MB

## Security Notes

1. JWT tokens expire after 12 hours
2. File uploads are validated for type and size
3. Role-based access control for admin functions
