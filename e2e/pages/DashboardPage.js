/**
 * Shared elements and Employee specific methods
 */
class DashboardPage {
    constructor(page) {
        this.page = page;
        this.sidebar = page.getByTestId('sidebar');
        this.navLinkReservations = page.getByTestId('nav-link-my-reservations');
        this.navLinkProfile = page.getByTestId('nav-link-my-profile');
        this.userProfileBadge = page.getByTestId('user-mini-profile');
        this.logoutButton = page.getByTestId('logout-button');

        // Employee Dashboard specific
        this.tabNewReservation = page.getByTestId('tab-new-reservation');
        this.tabReservations = page.getByTestId('tab-reservations');
        this.completeBookingButton = page.getByTestId('complete-booking-btn');
        this.toastNotification = page.getByTestId('toast-notification');
    }

    async navigateToNewReservation() {
        await this.tabNewReservation.click();
    }

    async selectResource(id) {
        await this.page.getByTestId(`resource-item-${id}`).click();
    }

    async bookSelected() {
        await this.completeBookingButton.click();
    }

    async logout() {
        await this.logoutButton.click();
    }

    async isNotificationVisible() {
        return await this.toastNotification.isVisible();
    }
}

module.exports = { DashboardPage };
