# Fix Index.html - Add Category Filtering

$indexPath = "c:\Users\Administrator\Desktop\online e learn app\Version 2\index.html"
$backupPath = "c:\Users\Administrator\Desktop\online e learn app\Version 2\index_clean_backup.html"

# Read the clean backup
$content = Get-Content $backupPath -Raw

# Find and replace the setupFilters function to add category link handlers
$oldFunction = @'
                                function setupFilters() {
                                const filterButtons = document.querySelectorAll('[data-filter]');
                                filterButtons.forEach(btn => {
                                btn.addEventListener('click', () => {
                                // Update active state
                                filterButtons.forEach(b => b.classList.remove('active'));
                                btn.classList.add('active');

                                currentFilter = btn.dataset.filter;
                                filterAndRenderCourses();
                                });
                                });
                                }
'@

$newFunction = @'
                                function setupFilters() {
                                const filterButtons = document.querySelectorAll('[data-filter]');
                                filterButtons.forEach(btn => {
                                btn.addEventListener('click', () => {
                                // Update active state
                                filterButtons.forEach(b => b.classList.remove('active'));
                                btn.classList.add('active');

                                currentFilter = btn.dataset.filter;
                                filterAndRenderCourses();
                                });
                                });

                                // Add category link handlers from navbar
                                const categoryLinks = document.querySelectorAll('.category-link');
                                categoryLinks.forEach(link => {
                                link.addEventListener('click', (e) => {
                                e.preventDefault();
                                const category = link.dataset.filter;
                                currentFilter = category;

                                // Update active filter button
                                filterButtons.forEach(btn => {
                                btn.classList.toggle('active', btn.dataset.filter === category);
                                });

                                // Scroll to courses section
                                document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });

                                filterAndRenderCourses();
                                });
                                });
                                }
'@

# Replace the function
$content = $content.Replace($oldFunction, $newFunction)

# Write to index.html
$content | Set-Content $indexPath -NoNewline

Write-Host "✅ Index.html fixed successfully!" -ForegroundColor Green
Write-Host "Category filtering from navbar is now enabled." -ForegroundColor Cyan
