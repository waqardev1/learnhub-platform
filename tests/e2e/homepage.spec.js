const { test, expect } = require('@playwright/test');

test.describe('Homepage Tests', () => {
    test('should load successfully', async ({ page }) => {
        await page.goto('/index.html');
        await expect(page).toHaveTitle(/LearnHub/);
    });

    test('should display navbar', async ({ page }) => {
        await page.goto('/index.html');
        const navbar = page.locator('nav.navbar');
        await expect(navbar).toBeVisible();
    });

    test('should display hero section', async ({ page }) => {
        await page.goto('/index.html');
        const hero = page.locator('.hero-section');
        await expect(hero).toBeVisible();
        await expect(page.locator('.hero-title')).toContainText('Master New Skills');
    });

    test('should filter courses by category', async ({ page }) => {
        await page.goto('/index.html');

        // Wait for courses to load
        await page.waitForSelector('.course-card-enhanced', { timeout: 5000 });

        // Click Programming filter
        await page.click('[data-filter="programming"]');

        // Verify filter is active
        const activeFilter = page.locator('[data-filter="programming"].active');
        await expect(activeFilter).toBeVisible();
    });

    test('should search courses', async ({ page }) => {
        await page.goto('/index.html');

        // Wait for courses to load
        await page.waitForSelector('.course-card-enhanced', { timeout: 5000 });

        // Type in search box
        await page.fill('#courseSearch', 'Python');

        // Wait for search to filter
        await page.waitForTimeout(500);
    });

    test('should open registration modal', async ({ page }) => {
        await page.goto('/index.html');

        // Wait for courses to load
        await page.waitForSelector('.course-card-enhanced', { timeout: 5000 });

        // Click first "Register Interest" button
        const registerBtn = page.locator('.course-card-enhanced button').first();
        await registerBtn.click();

        // Verify modal is visible
        const modal = page.locator('#registerModal');
        await expect(modal).toBeVisible();
    });

    test('should toggle theme', async ({ page }) => {
        await page.goto('/index.html');

        // Click theme toggle
        await page.click('#themeToggle');

        // Verify theme changed
        const html = page.locator('html');
        const theme = await html.getAttribute('data-theme');
        expect(theme).toBe('dark');
    });
});
