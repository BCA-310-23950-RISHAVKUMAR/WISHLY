@echo off
setlocal EnableExtensions

cd /d "%~dp0"
title Wishly Launcher

echo ======================================
echo        Wishly One-Click Launcher
echo ======================================
echo.

if not exist "server\.env" (
  echo [1/5] Creating server\.env from template...
  copy /Y "server\.env.example" "server\.env" >nul
)

if not exist "client\.env" (
  echo [2/5] Creating client\.env from template...
  copy /Y "client\.env.example" "client\.env" >nul
)

if not exist "node_modules" (
  echo [3/5] Installing root dependencies...
  call npm.cmd install
  if errorlevel 1 goto :error
)

if not exist "server\node_modules" (
  echo [4/5] Installing backend dependencies...
  call npm.cmd --prefix server install
  if errorlevel 1 goto :error
)

if not exist "client\node_modules" (
  echo [4/5] Installing frontend dependencies...
  call npm.cmd --prefix client install
  if errorlevel 1 goto :error
)

if not exist ".wishly_seeded" (
  echo [5/5] First run detected. Seeding database...
  call npm.cmd run seed
  if errorlevel 1 goto :error
  > ".wishly_seeded" echo seeded_on=%date% %time%
)

echo.
echo Starting Wishly...
echo Frontend: http://localhost:5173
echo Backend : http://localhost:5000
echo.
call npm.cmd run dev
goto :eof

:error
echo.
echo Setup failed.
echo Make sure MongoDB is running, then run this file again.
pause
exit /b 1
