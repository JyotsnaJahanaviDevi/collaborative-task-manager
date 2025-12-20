# 🚀 Collaborative Task Manager

A modern, full-stack task management application with real-time collaboration features built with React, TypeScript, Express, PostgreSQL, and Socket.io.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Database Schema](#-database-schema)
- [Design Decisions](#-design-decisions)
- [Testing](#-testing)
- [Deployment](#-deployment)

## ✨ Features

### Core Functionality
- **User Authentication**: Secure registration and login with JWT tokens and bcrypt password hashing
- **Task Management**: Full CRUD operations with rich task attributes
- **Real-Time Collaboration**: Live updates using Socket.io
- **User Dashboard**: Personalized views for assigned, created, and overdue tasks
- **Advanced Filtering**: Filter tasks by status, priority, and due date
- **Responsive Design**: Mobile-first UI with Tailwind CSS

### Task Attributes
- Title (max 100 characters)
- Description (multi-line text)
- Due Date (date/time)
- Priority (Low, Medium, High, Urgent)
- Status (To Do, In Progress, Review, Completed)
- Creator and Assignee tracking

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations
- **Data Fetching**: SWR for efficient caching and revalidation
- **Form Management**: React Hook Form with Zod validation
- **Real-Time**: Socket.io Client
- **Routing**: React Router v7
- **UI Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with HttpOnly cookies
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Real-Time**: Socket.io
- **Testing**: Jest with ts-jest

## 🏗 Architecture Overview

### Backend Architecture

The backend follows a clean, layered architecture:

```
backend/src/
├── controllers/     # HTTP request handlers
├── services/        # Business logic layer
├── repositories/    # Data access layer
├── routes/          # API route definitions
├── middleware/      # Authentication & validation
├── dtos/            # Data Transfer Objects with Zod
├── socket/          # WebSocket handlers
├── config/          # Database & app configuration
└── __tests__/       # Unit tests
```

**Pattern: Service/Repository Pattern**
- **Controllers**: Handle HTTP requests/responses, input validation
- **Services**: Contain business logic, coordinate between layers
- **Repositories**: Direct database operations via Prisma
- **DTOs**: Validate and transform data using Zod schemas

### Frontend Architecture

```
frontend/src/
├── components/      # Reusable UI components
├── pages/           # Route-level components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # API client & utilities
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 📦 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JyotsnaJahanaviDevi/collaborative-task-manager.git
cd collaborative-task-manager
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Configure your environment variables in .env
# DATABASE_URL=postgresql://username:password@localhost:5432/collaborative_task_manager
# JWT_SECRET=your-secret-key
# CLIENT_URL=http://localhost:5173

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Configure your environment variables in .env
# VITE_API_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "token": "jwt_token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Task Endpoints

All task endpoints require authentication via JWT token.

#### Create Task
```http
POST /tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "dueDate": "2024-12-31T23:59:59Z",
  "priority": "HIGH",
  "status": "TODO",
  "assignedToId": "user_id" // optional
}

Response: 201 Created
```

#### Get All Tasks
```http
GET /tasks?status=IN_PROGRESS&priority=HIGH&sortBy=dueDate&sortOrder=asc
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": [...]
}
```

#### Get Single Task
```http
GET /tasks/:id
Authorization: Bearer {token}

Response: 200 OK
```

#### Update Task
```http
PUT /tasks/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED",
  "priority": "URGENT"
}

Response: 200 OK
```

#### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Get Dashboard Data
```http
GET /tasks/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "assignedTasks": [...],
    "createdTasks": [...],
    "overdueTasks": [...]
  }
}
```

#### Get My Assigned Tasks
```http
GET /tasks/my/assigned
Authorization: Bearer {token}
```

#### Get My Created Tasks
```http
GET /tasks/my/created
Authorization: Bearer {token}
```

#### Get Overdue Tasks
```http
GET /tasks/overdue
Authorization: Bearer {token}
```

### User Endpoints

#### Get Profile
```http
GET /users/profile
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated"
}

Response: 200 OK
```

## ⚡ Real-Time Features

### Socket.io Integration

The application uses Socket.io for real-time collaboration:

#### Client-Side Connection
```typescript
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join user's personal room
socket.emit('join', userId);
```

#### Real-Time Events

**Server → Client Events:**
- `task-created`: Emitted when a new task is created
- `task-updated`: Emitted when a task is modified
- `task-deleted`: Emitted when a task is deleted
- `task-assigned`: Emitted to assignee when task is assigned to them

**Client → Server Events:**
- `join`: User joins their notification room
- `task:assign`: Manual task assignment notification

#### Implementation Details

**Backend** ([taskSocket.ts](backend/src/socket/taskSocket.ts)):
```typescript
export const initializeTaskSocket = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('join', (userId: string) => {
      socket.join(`user:${userId}`);
    });
    
    socket.on('task:assign', (data) => {
      io.to(`user:${data.assignedToId}`).emit('task-assigned', {
        taskId: data.taskId,
        taskTitle: data.task.title,
        assignedBy: data.task.creator?.name
      });
    });
  });
};
```

**Frontend** ([useTaskRealtime.ts](frontend/src/hooks/useTaskRealtime.ts)):
```typescript
export function useTaskRealtime(mutate: () => void) {
  const { socket } = useSocket();

  useEffect(() => {
    socket.on('task-created', () => mutate());
    socket.on('task-updated', () => mutate());
    socket.on('task-deleted', () => mutate());
    
    return () => {
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-deleted');
    };
  }, [socket, mutate]);
}
```

## 🗄 Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdTasks  Task[] @relation("TaskCreator")
  assignedTasks Task[] @relation("TaskAssignee")
}

model Task {
  id          String   @id @default(cuid())
  title       String   @db.VarChar(100)
  description String   @db.Text
  dueDate     DateTime
  priority    Priority @default(MEDIUM)
  status      Status   @default(TODO)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  creatorId    String
  assignedToId String?

  creator    User  @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  assignedTo User? @relation("TaskAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum Status {
  TODO
  IN_PROGRESS
  REVIEW
  COMPLETED
}
```

## 💡 Design Decisions

### 1. Database Choice: PostgreSQL

**Rationale:**
- **ACID Compliance**: Critical for task management data integrity
- **Relationships**: Strong support for foreign keys and complex queries
- **Prisma Support**: Excellent TypeScript integration
- **Scalability**: Proven production reliability
- **JSON Support**: Flexible for future feature additions

### 2. JWT Authentication

**Implementation:**
- Tokens stored in HttpOnly cookies for XSS protection
- 7-day expiration with automatic refresh
- Secure flag enabled in production
- SameSite strict policy

**Rationale:**
- Stateless authentication
- Easy to scale horizontally
- Native support for mobile clients
- Industry standard

### 3. Service/Repository Pattern

**Rationale:**
- **Separation of Concerns**: Business logic isolated from data access
- **Testability**: Easy to mock repositories for unit tests
- **Maintainability**: Changes to database don't affect business logic
- **Scalability**: Can swap database implementations

### 4. SWR for Data Fetching

**Rationale:**
- **Automatic Caching**: Reduces API calls
- **Real-time Updates**: Integrates perfectly with Socket.io
- **Optimistic UI**: Better user experience
- **Built-in Error Handling**: Simplifies component logic

### 5. Zod for Validation

**Rationale:**
- **Type Safety**: Schema and TypeScript types in sync
- **Runtime Validation**: Catches invalid data
- **Error Messages**: User-friendly validation errors
- **Composability**: Reusable schemas

### 6. Socket.io Room Pattern

**Implementation:**
- Each user joins a personal room (`user:${userId}`)
- Targeted notifications to specific users
- Broadcast events for global updates

**Rationale:**
- Efficient message routing
- Privacy-preserving notifications
- Scalable to thousands of concurrent users

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test

# With coverage
npm test -- --coverage
```

### Test Coverage

Current test coverage includes:
- Auth Service: User registration and login validation
- Task Service: Task creation and business logic
- Repository Layer: Database operations

**Sample Test** ([auth.service.test.ts](backend/src/__tests__/auth.service.test.ts)):
```typescript
describe('AuthService', () => {
  it('should register a new user with hashed password', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const result = await authService.register(userData);
    
    expect(result.user.email).toBe(userData.email);
    expect(result.token).toBeDefined();
  });
});
```

## 🚀 Deployment

### Backend Deployment (Railway/Render)

1. **Create PostgreSQL Database**
   - Set up managed PostgreSQL instance
   - Note the connection string

2. **Environment Variables**
   ```
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_production_secret
   CLIENT_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```
   - `CLIENT_URL` supports a comma-separated list for multiple frontends.

3. **Build Command**
   ```bash
   npm run build
   ```

4. **Run Migrations**
   ```bash
   npm run prisma:deploy
   ```

5. **Start Command**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.com/api/v1
   ```

2. **Build Command**
   ```bash
   npm run build
   ```

3. **Output Directory**
   ```
   dist
   ```

### Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] CORS settings updated with production URLs
- [ ] JWT secret changed from development
- [ ] SSL/HTTPS enabled
- [ ] Socket.io connection tested
- [ ] API endpoints verified

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Jyotsna Jahanavi Devi**
- GitHub: [@JyotsnaJahanaviDevi](https://github.com/JyotsnaJahanaviDevi)

## 🙏 Acknowledgments

Built as part of a full-stack engineering assessment demonstrating:
- Modern TypeScript/JavaScript best practices
- RESTful API design
- Real-time communication
- Database modeling
- Authentication & Authorization
- Production-ready architecture
