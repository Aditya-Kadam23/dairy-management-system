# Milk Distribution Management System

A comprehensive MERN stack application for managing milk distribution, consumer billing, and employee assignments.

## Features

- **Admin Panel**
  - Dashboard with statistics
  - Consumer management with CRUD operations
  - Employee management
  - Consumer-employee assignments
  - Daily milk entry and distribution
  - Monthly billing with WhatsApp integration
  - System settings

- **Employee View**
  - View assigned consumers (mobile-optimized)
  - View-only access (no editing capabilities)

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Security**: bcrypt, CORS, rate limiting

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string if needed
   - Change JWT_SECRET to a secure random string

4. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will run on `http://localhost:5173`

## Initial Setup

### Create Admin Account

1. Start both backend and frontend servers
2. Open `http://localhost:5173`
3. You'll see the login page
4. First, create an admin account by making a POST request to `/api/auth/register-admin`:

   ```bash
   curl -X POST http://localhost:5000/api/auth/register-admin \
   -H "Content-Type: application/json" \
   -d '{
     "username": "admin",
     "email": "admin@example.com",
     "password": "admin123"
   }'
   ```

5. Now login with these credentials

## Default Credentials

After registration:
- **Username**: admin
- **Password**: admin123

For employees:
- **Username**: Employee's mobile number
- **Password**: Employee's mobile number (set during creation)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register-admin` - Register admin
- `GET /api/auth/me` - Get current user

### Consumers
- `GET /api/consumers` - Get all consumers
- `POST /api/consumers` - Create consumer
- `PUT /api/consumers/:id` - Update consumer
- `DELETE /api/consumers/:id` - Delete consumer

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `GET /api/assignments/my-assignments` - Get employee's assignments (employee only)

### Daily Milk
- `POST /api/daily-milk` - Create daily entry
- `GET /api/daily-milk` - Get all entries
- `POST /api/daily-milk/delivery` - Record delivery

### Billing
- `GET /api/billing/consumer/:id/monthly` - Get consumer monthly billing
- `GET /api/billing/report` - Get monthly report
- `GET /api/billing/outstanding` - Get outstanding amounts

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## Security Features

- JWT authentication with role-based access control
- Password hashing with bcrypt
- CORS protection
- Rate limiting on login endpoint
- Input validation on all routes
- Protected routes for admin-only operations

## Mobile Optimization

- Employee interface is mobile-first
- Large touch targets
- Simple, error-preventive UI
- View-only access for employees

## WhatsApp Integration

- Send billing messages directly to consumers
- Click-to-call for employee view
- Message template for billing

## Project Structure

```
Dairy/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── contexts/
        ├── pages/
        ├── utils/
        └── App.jsx
```

## License

MIT
