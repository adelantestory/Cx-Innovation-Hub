@echo off
echo Setting up database...
cd /d "%~dp0"

echo.
echo Step 1: Pushing database schema...
call npx prisma db push --accept-data-loss

echo.
echo Step 2: Generating Prisma client...
call npx prisma generate

echo.
echo Step 3: Seeding database...
call npx ts-node prisma/seed.ts

echo.
echo Database setup complete!
pause
