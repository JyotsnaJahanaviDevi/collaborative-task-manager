# TaskFlow Frontend 🎨

Modern, real-time collaborative task management application built with React, TypeScript, and Tailwind CSS.

## ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based with protected routes
- 📋 **Complete Task Management** - Create, edit, delete, assign tasks
- 🔄 **Real-Time Updates** - Live collaboration via Socket.io
- 📊 **Analytics Dashboard** - Personal stats and overdue tracking
- 🔍 **Advanced Filtering** - Filter by status, priority; sort by date
- 🔔 **Smart Notifications** - Real-time task assignments and updates
- 👤 **Profile Management** - Edit profile, view user ID for assignments
- 🎨 **Beautiful UI** - Glass-morphism design with smooth animations

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS 4 |
| Data Fetching | **SWR** (required by specs) |
| Form Handling | React Hook Form + Zod validation |
| Real-Time | **Socket.io Client** (required) |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Routing | React Router v7 |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 5000

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:5174`

### Environment Variables

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
frontend/src/
├── components/
│   ├── layout/          # DashboardLayout, Sidebar
│   ├── tasks/           # TaskCard, TaskFormModal
│   └── ui/              # Button, Card, Input, Modal, Skeleton
├── contexts/
│   ├── AuthContext.tsx         # Authentication state
│   ├── SocketContext.tsx       # Socket.io connection
│   └── NotificationContext.tsx # Notifications management
├── hooks/
│   ├── useTasks.ts             # SWR hooks for tasks
│   └── useTaskRealtime.ts      # Real-time updates
├── lib/
│   └── api.ts                  # Axios instance & API clients
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Tasks.tsx
│   ├── Notifications.tsx
│   └── Profile.tsx
└── types/
    └── index.ts                # TypeScript definitions
```

## 🔌 API Endpoints Used

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get profile
- `PUT /api/v1/auth/profile` - Update profile

### Tasks
- `GET /api/v1/tasks` - Get all tasks (with filters)
- `GET /api/v1/tasks/:id` - Get single task
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/tasks/my/assigned` - My assigned tasks
- `GET /api/v1/tasks/my/created` - My created tasks
- `GET /api/v1/tasks/overdue` - Overdue tasks

### Socket.io Events (Real-Time)

**Client Listens:**
- `task-created` - New task notification
- `task-updated` - Task update notification
- `task-deleted` - Task deletion
- `task-assigned` - Assignment notification
- `task-status-changed` - Status update

## 🎯 Core Requirements Implementation

### ✅ Task Management (CRUD)
Task attributes (per specs):
- `title` (string, max 100 chars) ✓
- `description` (multi-line string) ✓
- `dueDate` (date/time) ✓
- `priority` (Low | Medium | High | Urgent) ✓
- `status` (To Do | In Progress | Review | Completed) ✓
- `creatorId` ✓
- `assignedToId` ✓

### ✅ Real-Time Collaboration (Socket.io)
- Live task updates across all users ✓
- Instant assignment notifications ✓
- Real-time status/priority changes ✓
- Persistent in-app notifications ✓

### ✅ Dashboard & Data Exploration
- Tasks assigned to current user ✓
- Tasks created by current user ✓
- Overdue tasks tracking ✓
- Filtering by Status and Priority ✓
- Sorting by Due Date ✓

### ✅ Frontend UX Requirements
- Responsive design (mobile + desktop) ✓
- Skeleton loading states (SWR) ✓
- React Hook Form + Zod validation ✓
- SWR for server state caching ✓
- Smooth animations (Framer Motion) ✓

## 🔒 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token sent in Authorization header
4. Protected routes check auth state
5. Auto-redirect to login on 401

## 📊 State Management

### SWR for Data Fetching
```typescript
// Auto-caching, revalidation, loading states
const { tasks, isLoading, mutate } = useTasks(filters);
```

### Context API for Global State
- **AuthContext**: User authentication
- **SocketContext**: Socket.io connection
- **NotificationContext**: Real-time notifications

## 🎨 Design System

### Color Scheme
- Primary: Blue-to-Purple gradient
- Secondary: Glass-morphism effects
- Alerts: Red for urgent/overdue
- Success: Green for completed

### Components
All components built with:
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations
- Accessibility best practices

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## ⚡ Performance

- Code splitting with React Router
- SWR caching reduces API calls
- Optimistic UI updates
- Fast HMR with Vite
- Production build < 500KB

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables
Set `VITE_API_URL` in your deployment platform pointing to your backend API.

## 🧪 Testing

Install testing dependencies:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Component-based architecture
- Hooks for reusable logic

## 📝 Key Implementation Details

### Form Validation (Zod)
```typescript
const taskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  dueDate: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Completed']),
});
```

### Real-Time Updates
```typescript
// useTaskRealtime hook listens to Socket.io events
useTaskRealtime(() => {
  mutate(); // Refresh tasks when updates occur
});
```

### Filtering & Sorting
```typescript
const { tasks } = useTasks({
  status: 'In Progress',
  priority: 'High',
  sortBy: 'dueDate-asc'
});
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### API Connection Issues
- Verify backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

### Socket.io Not Connecting
- Verify backend Socket.io server is running
- Check WebSocket connection in browser DevTools
- Ensure CORS is configured on backend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License

---

**Built with ❤️ for the Full-Stack Engineering Assessment**

Meeting all requirements:
- ✅ React + TypeScript + Tailwind CSS
- ✅ SWR for data fetching
- ✅ Socket.io for real-time features
- ✅ React Hook Form + Zod validation
- ✅ Complete CRUD operations
- ✅ Responsive design
- ✅ Loading states
- ✅ Live deployment ready
