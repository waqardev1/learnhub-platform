const { test, expect } = require('@playwright/test');

// Test credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'admin123'
};

const STUDENT_CREDENTIALS = {
    userId: 'STU-2025-3435',
    password: 'student123'
};

test.describe('Complete Platform Flow Tests', () => {

    test.describe('Admin Flow', () => {
        test('should complete full admin workflow', async ({ page }) => {
            await page.goto('/admin/login.html');
            await expect(page).toHaveTitle(/Admin Login/);

            await page.fill('#adminEmail', ADMIN_CREDENTIALS.email);
            await page.fill('#adminPassword', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/admin/dashboard.html', { timeout: 5000 });
            await expect(page.locator('h1')).toContainText('Dashboard');

            await page.click('a[href="courses.html"]');
            await page.waitForURL('**/admin/courses.html');

            await page.click('a[href="students.html"]');
            await page.waitForURL('**/admin/students.html');

            await page.click('a[href="requests.html"]');
            await page.waitForURL('**/admin/requests.html');

            await page.click('a[href="settings.html"]');
            await page.waitForURL('**/admin/settings.html');
        });

        test('should reject invalid admin credentials', async ({ page }) => {
            await page.goto('/admin/login.html');
            await page.fill('#adminEmail', 'wrong@example.com');
            await page.fill('#adminPassword', 'wrongpassword');
            await page.click('button[type="submit"]');

            await page.waitForTimeout(1000);
            const errorDiv = page.locator('#loginError');
            await expect(errorDiv).toBeVisible();
        });
    });

    test.describe('Student Flow', () => {
        test('should complete full student workflow', async ({ page }) => {
            await page.goto('/portal/login.html');
            await expect(page).toHaveTitle(/Student Login/);

            await page.fill('#userId', STUDENT_CREDENTIALS.userId);
            await page.fill('#password', STUDENT_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/portal/dashboard.html', { timeout: 5000 });
            await expect(page.locator('h1, h2')).toContainText(/Welcome|Dashboard/);
        });

        test('should reject invalid student credentials', async ({ page }) => {
            await page.goto('/portal/login.html');
            await page.fill('#userId', 'INVALID-ID');
            await page.fill('#password', 'wrongpassword');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(1500);
        });

        test('should navigate to classroom after login', async ({ page }) => {
            await page.goto('/portal/login.html');
            await page.fill('#userId', STUDENT_CREDENTIALS.userId);
            await page.fill('#password', STUDENT_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/portal/dashboard.html', { timeout: 5000 });

            await page.goto('/portal/classroom.html');
            await expect(page).toHaveTitle(/Classroom/);
        });
    });

    test.describe('Public Pages Flow', () => {
        test('should load homepage and courses', async ({ page }) => {
            await page.goto('/index.html');
            await expect(page).toHaveTitle(/LearnHub/);
            await page.waitForSelector('.course-card-enhanced, .empty-state', { timeout: 10000 });
        });

        test('should filter courses by category', async ({ page }) => {
            await page.goto('/index.html');
            await page.waitForSelector('.course-card-enhanced, .empty-state', { timeout: 10000 });

            const programmingFilter = page.locator('button[data-filter="programming"]');
            if (await programmingFilter.count() > 0) {
                await programmingFilter.click();
                await expect(programmingFilter).toHaveClass(/active/);
            }
        });

        test('should search courses', async ({ page }) => {
            await page.goto('/index.html');
            await page.waitForSelector('.course-card-enhanced, .empty-state', { timeout: 10000 });

            const searchInput = page.locator('#courseSearch');
            if (await searchInput.count() > 0) {
                await searchInput.fill('Python');
                await page.waitForTimeout(500);
            }
        });

        test('should toggle theme', async ({ page }) => {
            await page.goto('/index.html');
            const themeToggle = page.locator('#themeToggle');
            await themeToggle.click();

            const html = page.locator('html');
            const theme = await html.getAttribute('data-theme');
            expect(['dark', 'light']).toContain(theme);
        });
    });

    test.describe('Navigation Tests', () => {
        test('should navigate between public pages', async ({ page }) => {
            await page.goto('/index.html');
            await expect(page).toHaveTitle(/LearnHub/);

            await page.click('a[href="portal/login.html"]');
            await expect(page).toHaveURL(/portal\/login\.html/);

            await page.goto('/index.html');
            await page.click('a[href="admin/login.html"]');
            await expect(page).toHaveURL(/admin\/login\.html/);
        });
    });

    test.describe('Authentication State Tests', () => {
        test('should redirect to login when accessing protected admin pages', async ({ page }) => {
            await page.goto('/admin/dashboard.html');
            await page.waitForURL('**/admin/login.html', { timeout: 3000 });
        });

        test('should redirect to login when accessing protected student pages', async ({ page }) => {
            await page.goto('/portal/dashboard.html');
            await page.waitForURL('**/portal/login.html', { timeout: 3000 });
        });

        test('should maintain admin session after login', async ({ page }) => {
            await page.goto('/admin/login.html');
            await page.fill('#adminEmail', ADMIN_CREDENTIALS.email);
            await page.fill('#adminPassword', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/admin/dashboard.html');

            await page.goto('/admin/courses.html');
            await expect(page).toHaveURL(/admin\/courses\.html/);
        });

        test('should maintain student session after login', async ({ page }) => {
            await page.goto('/portal/login.html');
            await page.fill('#userId', STUDENT_CREDENTIALS.userId);
            await page.fill('#password', STUDENT_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/portal/dashboard.html');

            await page.goto('/portal/classroom.html');
            await expect(page).toHaveURL(/portal\/classroom\.html/);
        });
    });
});
