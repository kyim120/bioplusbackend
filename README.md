# Bio Plus Backend API

A comprehensive backend API for the Bio Plus biology learning platform, built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Student, admin, and owner role-based authentication
- **Content Management**: Subjects, chapters, notes, tests, animations, and books
- **Analytics**: Comprehensive learning analytics and performance tracking
- **AI Integration**: AI-powered study recommendations and content generation
- **File Management**: Secure file upload and management system
- **Email Services**: Automated email notifications and communications
- **XML Import/Export**: Bulk content import via XML files

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Validation**: Express-validator
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate limiting
- **XML Processing**: xmldom

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd bio-plus-backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`

5. Start MongoDB service

6. Run the development server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Subject Management

- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:subjectId` - Get subject details
- `POST /api/subjects` - Create subject (Admin/Owner)
- `PUT /api/subjects/:subjectId` - Update subject (Admin/Owner)
- `DELETE /api/subjects/:subjectId` - Delete subject (Admin/Owner)

### Content Management

- `GET /api/books` - Get all books
- `GET /api/books/:bookId` - Get book details
- `POST /api/books` - Create book (Admin/Owner)
- `PUT /api/books/:bookId` - Update book (Admin/Owner)
- `DELETE /api/books/:bookId` - Delete book (Admin/Owner)

### Analytics

- `GET /api/analytics/student/:studentId` - Get student analytics
- `GET /api/analytics/system` - Get system analytics (Admin/Owner)
- `GET /api/analytics/leaderboard` - Get leaderboard
- `GET /api/analytics/trends/:studentId` - Get performance trends

## Project Structure

```
backend/
├── config/              # Database and configuration files
├── controllers/         # Route controllers
├── middleware/          # Custom middleware
├── models/             # Mongoose models
├── routes/             # API routes
├── services/           # Business logic services
├── utils/              # Utility functions
├── uploads/            # File uploads directory
├── scripts/            # Database scripts and seeders
├── tests/              # Test files
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Environment Variables

See `.env.example` for all required environment variables.

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## API Response Format

All API responses follow a consistent format:

Success Response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error Response:
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API endpoints are protected with rate limiting:
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- AI requests: 10 requests per minute
- File uploads: 5 uploads per minute

## File Upload

Supported file types:
- Images: JPG, PNG, GIF (max 5MB)
- Documents: PDF, DOC, DOCX, TXT (max 10MB)
- Videos: MP4, AVI, MOV (max 100MB)
- XML files: For bulk import (max 5MB)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
