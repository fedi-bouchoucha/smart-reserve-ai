const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { ManagerPage } = require('../pages/ManagerPage');
const { resetTestDatabase } = require('../utils/db-manager');

test.describe('Reservation and Notification Flow', () => {

    test.beforeEach(async () => {
        // Reset DB to clean state
        await resetTestDatabase();
    });

    test('Employee creates a reservation, Manager approves, Employee receives notification', async ({ browser }) => {
        // 1. Setup Employee Context
        const employeeContext = await browser.newContext();
        const employeePage = await employeeContext.newPage();
        const empLogin = new LoginPage(employeePage);
        const empDash = new DashboardPage(employeePage);

        await empLogin.goto();
        await empLogin.login('employee1', 'emp123');

        // 2. Create Reservation
        await empDash.navigateToNewReservation();
        // Assuming desk 1 is available
        await empDash.selectResource(1); 
        await empDash.bookSelected();

        await expect(employeePage.getByText('Reservation created successfully!')).toBeVisible();

        // 3. Setup Manager Context (Simultaneous Login)
        const managerContext = await browser.newContext();
        const managerPage = await managerContext.newPage();
        const mngLogin = new LoginPage(managerPage);
        const mngDash = new ManagerPage(managerPage);

        await mngLogin.goto();
        await mngLogin.login('manager1', 'manager123');

        // 4. Create Change Request (Employee side) to trigger approval flow
        // The simple reservation is auto-approved, so let's test a Change Request for notification
        await empDash.tabReservations.click();
        await employeePage.getByText('Change Date').first().click();
        await employeePage.fill('input[type="date"]', '2026-12-31');
        await employeePage.getByText('Submit Request').click();

        // 5. Manager reviews and approves
        await mngDash.goToRequests();
        await managerPage.reload(); // Ensure requests are loaded
        const counts = await mngDash.getCount();
        expect(Number(counts)).toBeGreaterThan(0);
        
        await mngDash.approveRequest(1); 

        // 6. Verification: Employee receives real-time notification
        await expect(employeePage.getByTestId('toast-notification')).toBeVisible({ timeout: 10000 });
        await expect(employeePage.getByText(/Approved/i)).toBeVisible();
    });
});
