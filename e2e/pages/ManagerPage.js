/**
 * POM for Manager Dashboard
 */
class ManagerPage {
    constructor(page) {
        this.page = page;
        this.requestsTab = page.getByTestId('tab-requests');
        this.teamTab = page.getByTestId('tab-team');
        this.pendingRequestsCount = page.getByTestId('pending-requests-count');
        this.confirmDecisionButton = page.getByTestId('confirm-decision-btn');
    }

    async goToRequests() {
        await this.requestsTab.click();
    }

    async approveRequest(requestId) {
        await this.page.getByTestId(`approve-btn-${requestId}`).click();
        await this.confirmDecisionButton.click();
    }

    async rejectRequest(requestId) {
        await this.page.getByTestId(`reject-btn-${requestId}`).click();
        await this.confirmDecisionButton.click();
    }

    async getCount() {
        return await this.pendingRequestsCount.innerText();
    }
}

module.exports = { ManagerPage };
