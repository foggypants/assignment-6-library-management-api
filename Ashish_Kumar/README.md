# 📚 Library Management System API

A RESTful backend API for a Library Management System built using **Node.js**, **Express.js**, **JWT (JSON Web Tokens)**, and **Firebase Firestore**.

---

## 🚀 Features

- **Authentication & Security**:
  - JWT-based authentication for students and librarians.
  - Password hashing with `bcryptjs`.
  - Route protection and custom role-based access control (`student` vs `librarian`).
  - Rate limiting (100 requests per 15 minutes) using `express-rate-limit`.
  - Security headers with `helmet` and CORS support.
- **Book Management**:
  - Complete CRUD operations for books.
  - Filter by category, author, and status (`available` / `borrowed`).
  - Search endpoint for quick book discovery.
- **Borrow & Return System**:
  - Students can borrow available books (loan duration tracked for 14 days).
  - Stock/quantity updates automatically when borrowing/returning.
  - Students can return books and overdue status is calculated automatically.
- **Transactions & User Management**:
  - View user transaction history and full library transaction logs.
  - Librarian-only user management (list users, view profile, update roles, delete accounts).
- **API Documentation**:
  - Interactive Swagger UI available at `/api-docs`.
  - Ready-to-import Postman Collection (`postman_collection.json`).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore (`firebase-admin`)
- **Authentication**: `jsonwebtoken` (JWT) & `bcryptjs`
- **Validation**: `express-validator`
- **Documentation**: Swagger / OpenAPI 3.0 (`swagger-ui-express`, `yamljs`)
- **Security & Utilities**: `helmet`, `cors`, `dotenv`, `express-rate-limit`

---

## 📁 Project Structure

```
Ashish_Kumar/
├── server.js                 # Main server entry file
├── package.json             # Project dependencies & scripts
├── .env                     # Environment variables (local)
├── .env.example             # Example environment variables template
├── .gitignore
├── src/
│   ├── config/
│   │   ├── firebase.js      # Firebase Admin & Firestore initialization
│   │   └── swagger.js       # Swagger UI configuration
│   ├── middleware/
│   │   ├── auth.js          # JWT token verification
│   │   ├── role.js          # Role-based access authorization
│   │   ├── logger.js        # Request logging middleware
│   │   ├── rateLimiter.js   # Rate limiting middleware
│   │   └── validator.js     # Request validation error handler
│   ├── routes/
│   │   ├── authRoutes.js    # /api/auth routes
│   │   ├── bookRoutes.js    # /api/books routes
│   │   ├── userRoutes.js    # /api/users routes
│   │   └── transactionRoutes.js # /api/transactions routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── userController.js
│   │   └── transactionController.js
│   ├── models/
│   │   ├── userModel.js     # User Firestore operations
│   │   ├── bookModel.js     # Book Firestore operations
│   │   └── transactionModel.js # Transaction Firestore operations
│   └── utils/
│       ├── jwt.js            # JWT helper functions
│       └── validation.js     # express-validator schemas
├── docs/
│   └── swagger.yaml         # OpenAPI 3.0 specification
├── postman_collection.json  # Postman test collection
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Clone or Extract the Project
```bash
cd "Ashish_Kumar"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your preferred port and secrets:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Optional Firebase credentials (or place serviceAccountKey.json in root folder):
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
> **Note**: If Firebase credentials are not provided, the API will automatically use the built-in local store so that all endpoints and tests function immediately out of the box.

### 4. Run the Server
- **Development Mode (with auto-restart)**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📖 API Documentation & Swagger UI

Once the server is running, visit the interactive Swagger UI at:
👉 **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**

---

## 📋 API Endpoints

### 🔹 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student or librarian |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/profile` | Authenticated | Get current user profile |
| `PUT` | `/api/auth/profile` | Authenticated | Update current user profile |

### 🔹 Book Management (`/api/books`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/books` | Public | Get all books (supports `?category=`, `?status=`, `?author=`) |
| `GET` | `/api/books/search` | Public | Search books (`?q=`, `?title=`, `?author=`) |
| `GET` | `/api/books/:id` | Public | Get book details by ID |
| `POST` | `/api/books` | Librarian | Add a new book |
| `PUT` | `/api/books/:id` | Librarian | Update book details |
| `DELETE` | `/api/books/:id` | Librarian | Delete a book |
| `POST` | `/api/books/:id/borrow` | Student | Borrow a book (sets 14-day due date) |
| `POST` | `/api/books/:id/return` | Student | Return a borrowed book |

### 🔹 Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/transactions` | Librarian | Get all borrow/return transaction records |
| `GET` | `/api/transactions/my` | Authenticated | Get current logged-in user's transaction history |

### 🔹 User Management (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Librarian | Get all registered users |
| `GET` | `/api/users/:id` | Librarian | Get single user details by ID |
| `PUT` | `/api/users/:id/role` | Librarian | Change user role (`student` or `librarian`) |
| `DELETE` | `/api/users/:id` | Librarian | Delete a user account |

---

## 🧪 Testing with Postman

1. Open **Postman**.
2. Click **Import** and select `postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000`.
4. Register a Librarian (`librarian@example.com`) and a Student (`student@example.com`).
5. Copy the JWT token into the headers: `Authorization: Bearer <your-token>`.
