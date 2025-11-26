# Emergency Fix for Index.html Corruption
# This script properly separates HTML from JavaScript

$filePath = "c:\Users\Administrator\Desktop\online e learn app\Version 2\index.html"

Write-Host "🔧 Reading corrupted file..." -ForegroundColor Cyan
$content = Get-Content $filePath -Raw

# Find where JavaScript starts incorrectly (line 293)
$corruptionStart = "                .eq('is_visible', true);"

# Find where it should end (before the JavaScript)
$footerEnd = @'
                </div>
                <div class="col-md-4 text-center text-md-end">
                    <h6 class="fw-bold mb-3">Admin Access</h6>
                    <a href="admin/login.html" class="btn btn-outline-secondary btn-sm">Admin Login</a>
                </div>
            </div>
            <div class="border-top border-secondary pt-4 text-center text-secondary small">
                <p class="mb-0">&copy; 2024 LearnHub. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <!-- UI Utilities -->
    <script src="assets/js/ui-utils.js"></script>
    <!-- Backend API -->
    <script src="assets/js/backend-api.js"></script>
    <!-- App JS -->
    <script src="assets/js/supabase-client.js"></script>

    <script>
        // Main Page Logic with HCI Enhancements
        let allCourses = [];
        let currentFilter = 'all';
        let searchQuery = '';

        document.addEventListener('DOMContentLoaded', async () => {
            const courseGrid = document.getElementById('course-grid');

            // Show skeleton loading
            window.LearnHubUI.LoadingManager.showSkeleton(courseGrid, 'card', 6);

            // Fetch courses from Supabase
            const { data: courses, error } = await window.sb
                .from('courses')
                .select('*')
'@

# Split content at the corruption point
$beforeCorruption = $content.Substring(0, $content.IndexOf($corruptionStart))

# Extract just the JavaScript part (from corruption to end)
$javascriptPart = $content.Substring($content.IndexOf($corruptionStart))

# Build the corrected file
$correctedContent = $beforeCorruption + $footerEnd + $javascriptPart

# Write the corrected file
$correctedContent | Set-Content $filePath -NoNewline

Write-Host "✅ File structure repaired!" -ForegroundColor Green
Write-Host "✓ Footer properly closed" -ForegroundColor White
Write-Host "✓ Script tags added" -ForegroundColor White
Write-Host "✓ JavaScript separated from HTML" -ForegroundColor White
