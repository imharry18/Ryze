@echo off
echo ==========================================
echo   Starting Streak Commit Script...
echo ==========================================

REM Check if Git Bash exists (default install path)
SET GITBASH="C:\Program Files\Git\bin\bash.exe"

IF NOT EXIST %GITBASH% (
    echo ❌ Git Bash not found!
    echo Install Git here: https://git-scm.com/downloads
    pause
    exit /b
)

REM Run the .sh file through Git Bash
%GITBASH% -c "./streakCommit.sh"

echo.
echo ==========================================
echo        ✔ Script Execution Finished
echo ==========================================
pause
