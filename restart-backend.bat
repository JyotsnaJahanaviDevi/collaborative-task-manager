@echo off
echo Killing old backend process...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul

echo Generating Prisma Client...
cd backend
call npx prisma generate

echo Starting backend server...
call npm run dev
