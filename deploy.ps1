# Deploy LearnHub to GitHub & Vercel
# Automated deployment script for waqardev1

Write-Host "`nLearnHub Deployment Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Git is installed
Write-Host "Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "Git is installed: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then run this script again.`n" -ForegroundColor Yellow
    pause
    exit
}

# Navigate to project directory
$projectPath = "C:\Users\Administrator\Desktop\online e learn app\Version 2"
Write-Host "Navigating to project directory..." -ForegroundColor Yellow
Set-Location $projectPath
Write-Host "Current directory: $projectPath`n" -ForegroundColor Green

# Initialize Git repository
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "Git repository already exists, skipping init`n" -ForegroundColor Yellow
} else {
    git init
    Write-Host "Git repository initialized`n" -ForegroundColor Green
}

# Create .gitignore
Write-Host "Creating .gitignore file..." -ForegroundColor Yellow
$gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Build outputs
dist/
build/
"@
Set-Content -Path ".gitignore" -Value $gitignoreContent
Write-Host ".gitignore created`n" -ForegroundColor Green

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "Files added`n" -ForegroundColor Green

# Commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit - LearnHub E-Learning Platform"
Write-Host "Initial commit created`n" -ForegroundColor Green

# Set main branch
Write-Host "Setting main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "Main branch set`n" -ForegroundColor Green

# Add remote
$repoName = "learnhub-platform"
$githubUsername = "waqardev1"
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"

Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
try {
    git remote add origin $remoteUrl
    Write-Host "Remote added: $remoteUrl`n" -ForegroundColor Green
} catch {
    Write-Host "Remote already exists, updating...`n" -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
}

# Instructions
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. CREATE GITHUB REPOSITORY:" -ForegroundColor Yellow
Write-Host "   - Go to: https://github.com/new" -ForegroundColor White
Write-Host "   - Repository name: $repoName" -ForegroundColor White
Write-Host "   - Description: LearnHub E-Learning Platform" -ForegroundColor White
Write-Host "   - Public or Private: Your choice" -ForegroundColor White
Write-Host "   - DO NOT initialize with README" -ForegroundColor Red
Write-Host "   - Click 'Create repository'`n" -ForegroundColor White

Write-Host "2. PUSH TO GITHUB:" -ForegroundColor Yellow
Write-Host "   Run this command after creating the repository:" -ForegroundColor White
Write-Host "   git push -u origin main`n" -ForegroundColor Cyan

Write-Host "3. DEPLOY TO VERCEL:" -ForegroundColor Yellow
Write-Host "   - Go to: https://vercel.com/signup" -ForegroundColor White
Write-Host "   - Click 'Continue with GitHub'" -ForegroundColor White
Write-Host "   - Authorize Vercel" -ForegroundColor White
Write-Host "   - Click 'Add New...' -> 'Project'" -ForegroundColor White
Write-Host "   - Select '$repoName' repository" -ForegroundColor White
Write-Host "   - Click 'Deploy'`n" -ForegroundColor White

Write-Host "4. YOUR SITE WILL BE LIVE AT:" -ForegroundColor Yellow
Write-Host "   https://$repoName.vercel.app`n" -ForegroundColor Cyan

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Press any key to open GitHub in browser..." -ForegroundColor Yellow
pause
Start-Process "https://github.com/new"
