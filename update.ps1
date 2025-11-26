# 🔄 Update LearnHub (After Initial Deployment)
# Quick update script for waqardev1

Write-Host "`n🔄 LearnHub Update Script" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# Navigate to project
$projectPath = "C:\Users\Administrator\Desktop\online e learn app\Version 2"
Set-Location $projectPath

# Get update message
Write-Host "What did you change? (e.g., 'Updated student dashboard')" -ForegroundColor Yellow
$commitMessage = Read-Host "Update message"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Updated LearnHub platform"
}

# Add, commit, and push
Write-Host "`nAdding changes..." -ForegroundColor Yellow
git add .

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "`n✅ Update complete!" -ForegroundColor Green
Write-Host "Your changes will be live on Vercel in ~30 seconds`n" -ForegroundColor Cyan

pause
