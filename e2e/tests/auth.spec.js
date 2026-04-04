const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { resetTestDatabase } = require('../utils/db-manager');

test.describe('Authentication Flow', () => {
    
    test.beforeEach(async () => {
        // Reset DB before each test for a clean state
       // await resetTestDatabase(); // Only if needed for auth
    });

    test('should login successfully as employee', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('employee1', 'emp123');
        
        await expect(page).toHaveURL(/.*employee/);
        await expect(page.getByTestId('user-mini-profile')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('wrong-user', 'wrong-pass');
        
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage).toContain('Invalid credentials');
    });

    test('should logout correctly', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('employee1', 'emp123');
        
        await page.getByTestId('logout-button').click();
        await expect(page).toHaveURL(/.*login/);
    });
});
