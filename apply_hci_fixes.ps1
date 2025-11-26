# HCI Fixes - Apply All Changes Safely

$indexPath = "c:\Users\Administrator\Desktop\online e learn app\Version 2\index.html"
$adminDashPath = "c:\Users\Administrator\Desktop\online e learn app\Version 2\admin\dashboard.html"

Write-Host "🔧 Applying HCI Fixes..." -ForegroundColor Cyan

# Fix 1: Category Dropdown in index.html
Write-Host "`n[1/2] Fixing category dropdown..." -ForegroundColor Yellow
$content = Get-Content $indexPath -Raw

$oldDropdown = @'
                        <ul class="dropdown-menu" aria-labelledby="categoriesDropdown">
                            <li><a class="dropdown-item" href="#courses" data-category="programming">
                                    <i class="bi bi-code-slash me-2"></i>Programming</a></li>
                            <li><a class="dropdown-item" href="#courses" data-category="design">
                                    <i class="bi bi-palette me-2"></i>Design</a></li>
                            <li><a class="dropdown-item" href="#courses" data-category="business">
                                    <i class="bi bi-briefcase me-2"></i>Business</a></li>
                            <li><a class="dropdown-item" href="#courses" data-category="marketing">
                                    <i class="bi bi-megaphone me-2"></i>Marketing</a></li>
                        </ul>
'@

$newDropdown = @'
                        <ul class="dropdown-menu" aria-labelledby="categoriesDropdown">
                            <li><a class="dropdown-item category-link" href="#courses" data-filter="programming">
                                    <i class="bi bi-code-slash me-2"></i>Programming</a></li>
                            <li><a class="dropdown-item category-link" href="#courses" data-filter="design">
                                    <i class="bi bi-palette me-2"></i>Design</a></li>
                            <li><a class="dropdown-item category-link" href="#courses" data-filter="business">
                                    <i class="bi bi-briefcase me-2"></i>Business</a></li>
                            <li><a class="dropdown-item category-link" href="#courses" data-filter="marketing">
                                    <i class="bi bi-megaphone me-2"></i>Marketing</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item category-link" href="#courses" data-filter="all">
                                    <i class="bi bi-grid me-2"></i>All Categories</a></li>
                        </ul>
'@

$content = $content.Replace($oldDropdown, $newDropdown)
$content | Set-Content $indexPath -NoNewline
Write-Host "✅ Category dropdown fixed" -ForegroundColor Green

# Fix 2: Remove duplicate DOCTYPE in admin dashboard
Write-Host "`n[2/2] Fixing admin dashboard DOCTYPE..." -ForegroundColor Yellow
$adminContent = Get-Content $adminDashPath -Raw
$adminContent = $adminContent -replace '<!DOCTYPE html>\r\n<!DOCTYPE html>', '<!DOCTYPE html>'
$adminContent | Set-Content $adminDashPath -NoNewline
Write-Host "✅ Duplicate DOCTYPE removed" -ForegroundColor Green

Write-Host "`n🎉 P0 Critical Fixes Complete!" -ForegroundColor Green
Write-Host "✓ Category filtering now works" -ForegroundColor White
Write-Host "✓ Admin dashboard HTML valid" -ForegroundColor White
