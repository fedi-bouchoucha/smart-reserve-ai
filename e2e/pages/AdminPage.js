/**
 * POM for Admin Dashboard
 */
class AdminPage {
    constructor(page) {
        this.page = page;
        this.usersTab = page.getByTestId('tab-users');
        this.reservationsTab = page.getByTestId('tab-reservations');
        this.createUserButton = page.getByRole('button', { name: /Create User/i });
        // Modals
        this.userModal = page.locator('.modal-content');
    }

    async goToUsers() {
        await this.usersTab.click();
    }

    async createUser(data) {
        await this.createUserButton.click();
        await this.page.fill('input[required]:nth-child(1)', data.fullName); // Simple selector for now
        await this.page.fill('input[required]:nth-child(2)', data.username);
        // ... fill other fields
        await this.page.getByRole('button', { name: /Save User Profile/i }).click();
    }
}

module.exports = { AdminPage };
