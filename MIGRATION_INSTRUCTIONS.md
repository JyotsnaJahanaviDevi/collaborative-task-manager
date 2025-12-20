# Database Migration Instructions

## Critical Schema Changes Made

The schema has been updated to match the requirements:
- Changed from many-to-many (TaskAssignment) to one-to-one (assignedToId)
- Removed Team and TeamMember models
- Added missing DATABASE_URL in datasource

## Steps to Apply Changes

1. **Backup your database** (if you have important data)

2. **Reset the database** (this will delete all data):
   ```bash
   cd backend
   npx prisma migrate reset --force
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Create new migration**:
   ```bash
   npx prisma migrate dev --name simplified_task_schema
   ```

5. **Restart the backend server**:
   ```bash
   npm run dev
   ```

## What Changed

### Before (Wrong):
- Task had many assignees via TaskAssignment table
- Had Team and TeamMember models (not in requirements)

### After (Correct):
- Task has single assignedToId field
- Only User and Task models as per requirements
- Matches the assessment specification exactly
