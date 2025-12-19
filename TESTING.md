# 🧪 Testing Guide - Collaborative Task Manager

## ✅ Current Status

**Backend**: Running on `http://localhost:5000` ✅  
**Frontend**: Running on `http://localhost:5174` ✅

---

## 📋 Step-by-Step Testing Checklist

### 1️⃣ Test Authentication

#### Register a New User
1. Open browser: `http://localhost:5174`
2. Click "Sign up" or go to `/register`
3. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Create Account"

**Expected Result**: 
- ✅ Redirected to `/dashboard`
- ✅ See welcome dashboard with your name
- ✅ Toast notification: "Account created successfully!"

#### Login
1. Logout (click logout in sidebar)
2. Go to `/login`
3. Login with:
   - Email: `test@example.com`
   - Password: `password123`

**Expected Result**:
- ✅ Redirected to `/dashboard`
- ✅ Toast notification: "Welcome back! 👋"

---

### 2️⃣ Test Task Creation

1. Click "New Task" button on Dashboard
2. Fill in the form:
   - **Title**: `Complete project documentation`
   - **Description**: `Write comprehensive README and API docs`
   - **Due Date**: Select tomorrow's date
   - **Priority**: `High`
   - **Status**: `To Do`
   - **Assign To**: Leave empty (assigns to yourself)
3. Click "Create Task"

**Expected Result**:
- ✅ Modal closes
- ✅ Task appears on dashboard
- ✅ Toast notification: "Task created successfully!"

---

### 3️⃣ Test Task Filtering & Sorting

1. Go to "All Tasks" page (`/tasks`)
2. Create 3-4 tasks with different:
   - Priorities (Low, Medium, High, Urgent)
   - Status (To Do, In Progress, Review, Completed)
   - Due dates (past and future)

3. **Test Filtering**:
   - Click "Filters" button
   - Select Status: "In Progress"
   - **Expected**: Only shows In Progress tasks
   
   - Select Priority: "High"
   - **Expected**: Shows High priority tasks

4. **Test Sorting**:
   - Sort by: "Due Date (Earliest)"
   - **Expected**: Tasks ordered by due date (earliest first)

5. **Test Search**:
   - Type in search box: "documentation"
   - **Expected**: Only shows tasks with "documentation" in title/description

---

### 4️⃣ Test Task Updates

1. Click on any task card
2. Edit the task:
   - Change Status to "In Progress"
   - Change Priority to "Urgent"
3. Click "Update Task"

**Expected Result**:
- ✅ Task updated
- ✅ Badge colors update immediately
- ✅ Toast: "Task updated successfully!"

---

### 5️⃣ Test Real-Time Features (Advanced)

#### Setup: Open TWO browser windows side-by-side

**Window 1**: Login as User 1 (`test@example.com`)  
**Window 2**: Register/Login as User 2 (`test2@example.com`)

#### Test Real-Time Task Updates

1. **Window 1**: Create a new task
2. **Window 2**: Should see the task appear immediately (without refresh)

**Expected**: ✅ Task appears in real-time in Window 2

#### Test Assignment Notifications

1. **Window 1**: Go to Profile page and copy your User ID
2. **Window 2**: Create a task and assign it to User 1's ID
3. **Window 1**: Check notifications (bell icon)

**Expected**:
- ✅ Notification badge shows "1"
- ✅ Toast notification appears
- ✅ Notification says: "test2@example.com assigned you a task..."

---

### 6️⃣ Test Dashboard Statistics

1. Create tasks with different statuses
2. Go to Dashboard (`/dashboard`)
3. Verify statistics cards:
   - **Assigned to Me**: Count of your assigned tasks
   - **Created by Me**: Count of tasks you created
   - **Overdue Tasks**: Count of tasks past due date
   - **In Progress**: Count of tasks with "In Progress" status

**Expected**: ✅ All counts are accurate

---

### 7️⃣ Test Profile Management

1. Go to Profile page (`/profile`)
2. Click "Edit Profile"
3. Change your name to: `Updated Test User`
4. Click "Save Changes"

**Expected**:
- ✅ Profile updated
- ✅ Name updates in sidebar
- ✅ Toast: "Profile updated successfully!"

---

### 8️⃣ Test Notifications Page

1. Get assigned to a few tasks (or assign yourself)
2. Go to Notifications page (`/notifications`)
3. Check notifications list

**Actions to test**:
- Click "Mark as read" on individual notification
- Click "Mark all read"
- Click "Clear all"

**Expected**: ✅ All actions work correctly

---

### 9️⃣ Test Task Deletion

1. Go to Tasks page
2. Click on a task
3. Click "Delete" (if you have a delete button)
4. Or test via API (see API Testing below)

**Expected**:
- ✅ Task removed from list
- ✅ Toast: "Task deleted successfully!"

---

### 🔟 Test Mobile Responsiveness

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

**Expected**:
- ✅ Sidebar adapts/collapses
- ✅ Task grid adjusts columns
- ✅ All buttons/forms are accessible

---

## 🔧 API Testing (Using VS Code REST Client)

Open `backend/api-tests.http` and test:

### Register User
```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "API Test User",
  "email": "apitest@example.com",
  "password": "password123"
}
```

### Login
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "apitest@example.com",
  "password": "password123"
}
```

### Get All Tasks (with token)
```http
GET http://localhost:5000/api/v1/tasks
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🐛 Common Issues & Solutions

### Issue: Backend not connecting
**Solution**: 
```bash
cd backend
npm run dev
```
Check it's running on port 5000

### Issue: Frontend shows blank page
**Solution**: 
- Check browser console (F12) for errors
- Verify `.env` file exists with `VITE_API_URL=http://localhost:5000/api/v1`
- Restart frontend: `npm run dev`

### Issue: "Network Error" on login/register
**Solution**: 
- Verify backend is running
- Check CORS settings in `backend/src/app.ts`
- Ensure `CLIENT_URL` in backend `.env` matches frontend port

### Issue: Real-time features not working
**Solution**:
- Check browser console for WebSocket errors
- Verify Socket.io connection in Network tab
- Ensure backend Socket.io server is initialized

### Issue: Database errors
**Solution**:
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## ✅ Success Criteria

All features working if you can:

1. ✅ Register and login
2. ✅ Create, view, update, delete tasks
3. ✅ Filter by status and priority
4. ✅ Sort by due date
5. ✅ Search tasks
6. ✅ See dashboard statistics
7. ✅ Receive notifications when assigned
8. ✅ View profile and update name
9. ✅ See real-time updates (multi-window test)
10. ✅ Mobile responsive design works

---

## 📊 Performance Checks

### Frontend Loading
- Initial page load: < 2 seconds
- Task list render: < 500ms
- Filter/search response: Instant

### Backend API
- Authentication: < 200ms
- Get tasks: < 300ms
- Create task: < 200ms

### Real-Time
- Socket.io connection: < 1 second
- Notification delivery: < 100ms

---

## 🎯 Next Steps

Once all tests pass:

1. ✅ **Deploy Backend** to Render/Railway
2. ✅ **Deploy Frontend** to Vercel/Netlify
3. ✅ **Update Environment Variables** in production
4. ✅ **Test production deployment**
5. ✅ **Submit assignment** with live URLs

---

## 📝 Testing Notes Template

Use this to track your testing:

```
Date: ___________
Tester: ___________

[ ] Authentication (Register/Login)
[ ] Task CRUD operations
[ ] Filtering & Sorting
[ ] Search functionality
[ ] Real-time updates
[ ] Notifications
[ ] Dashboard statistics
[ ] Profile management
[ ] Mobile responsive
[ ] API endpoints

Issues Found:
1. _______________________
2. _______________________

Notes:
_______________________
```

---

**Happy Testing! 🚀**

If you encounter any issues, check the browser console (F12) and backend terminal for error messages.
