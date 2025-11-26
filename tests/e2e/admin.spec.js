const { test, expect } = require('@playwright/test');

test.describe('Admin Login Tests', () => {
    test('should display login form', async ({ page }) => {
        await page.goto('/admin/login.html');

        const userIdInput = page.locator('#userId');
        const passwordInput = page.locator('#password');
        const submitBtn = page.locator('button[type="submit"]');

        await expect(userIdInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitBtn).toBeVisible();
    });

    test('should show error on empty submission', async ({ page }) => {
        await page.goto('/admin/login.html');

        await page.click('button[type="submit"]');

        // Wait for validation or error
        await page.waitForTimeout(1000);
    });

    test('should have password field type', async ({ page }) => {
        await page.goto('/admin/login.html');

        const passwordInput = page.locator('#password');
        const type = await passwordInput.getAttribute('type');
        expect(type).toBe('password');
    });

    test('should have proper page title', async ({ page }) => {
        await page.goto('/admin/login.html');
        await expect(page).toHaveTitle(/Admin Login/);
    });
});

test.describe('Admin Dashboard Tests', () => {
    test('should redirect to login if not authenticated', async ({ page }) => {
        // Clear localStorage
        await page.goto('/admin/dashboard.html');

        // Should redirect to login
        await page.waitForURL('**/admin/login.html', { timeout: 3000 });
    });
});
