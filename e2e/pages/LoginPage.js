/**
 * Page Object for the Login Screen
 */
class LoginPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.usernameInput = page.getByTestId('login-username');
        this.passwordInput = page.getByTestId('login-password');
        this.submitButton = page.getByTestId('login-submit');
        this.errorBadge = page.locator('.badge-ui'); // We can use the class if no testid yet for errors
    }

    async goto() {
        await this.page.goto('http://localhost:5173/login');
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async getErrorMessage() {
        return await this.errorBadge.textContent();
    }
}

module.exports = { LoginPage };
