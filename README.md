# Digital Library System

A modern web-based digital library application built with React and TailwindCSS that allows users to browse, read, and manage digital books.

## Features

### User Features

- **User Authentication**: Secure login and registration system
- **Book Browsing**: Browse through a collection of digital books with cover images
- **Search & Filter**: Search books by title/author and filter by categories
- **Book Details**: View detailed information about each book
- **Online Reading**: Read books directly in the browser with PDF viewer
- **Bookmarks**: Save and manage favorite books
- **User Profiles**: Manage personal information and preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Admin Features

- **Dashboard**: Overview of system statistics and recent activity
- **Book Management**: Add, edit, and delete books
- **Category Management**: Create and manage book categories
- **User Management**: View and manage user accounts
- **Access Control**: Role-based access control (Admin/Reader)

## Technology Stack

- **Frontend**: React (Vite)
- **UI Framework**: TailwindCSS
- **State Management**: React Query
- **HTTP Client**: Axios
- **Routing**: React Router
- **Notifications**: React Hot Toast
- **Icons**: HeroIcons
- **PDF Handling**: React PDF
- **Confirmation Dialogs**: SweetAlert2

## Project Structure

```
src/
├── components/       # Reusable UI components
├── contexts/        # React contexts (Auth)
├── layouts/         # Layout components
├── pages/          # Application pages
│   └── admin/      # Admin-specific pages
├── services/       # API services
└── assets/         # Static assets
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features in Detail

### Authentication

- Secure login/registration system
- Password change functionality
- Token-based authentication
- Role-based access control

### Book Management

- PDF file upload and management
- Cover image support
- Category organization
- Search and filter capabilities
- Bookmark functionality

### User Management

- Profile management
- Gender-based avatars
- Contact information
- Address management

### Admin Dashboard

- System statistics
- Recent activity tracking
- User management
- Book and category management
