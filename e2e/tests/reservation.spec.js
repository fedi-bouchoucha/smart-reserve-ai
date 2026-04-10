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
        
        // Compute next Monday and Tuesday to ensure they are in the same ISO week
        // to comply with the "2 or 3 days per week" policy
        const datesToSelect = await employeePage.evaluate(() => {
            const today = new Date();
            const nextMonday = new Date();
            // find next Monday
            nextMonday.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7 || 7));
            const nextTuesday = new Date(nextMonday);
            nextTuesday.setDate(nextMonday.getDate() + 1);
            
            // Format dates accurately for local timezone (en-CA gives YYYY-MM-DD locally)
            const y1 = nextMonday.getFullYear();
            const m1 = String(nextMonday.getMonth() + 1).padStart(2, '0');
            const d1 = String(nextMonday.getDate()).padStart(2, '0');
            
            const y2 = nextTuesday.getFullYear();
            const m2 = String(nextTuesday.getMonth() + 1).padStart(2, '0');
            const d2 = String(nextTuesday.getDate()).padStart(2, '0');
            
            return [`${y1}-${m1}-${d1}`, `${y2}-${m2}-${d2}`];
        });

        for (const dateStr of datesToSelect) {
            await employeePage.locator(`[data-date="${dateStr}"] .fc-daygrid-day-frame`).click();
        }
        
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
        await managerPage.reload(); // Ensure requests are loaded
        await mngDash.goToRequests();
        
        // Wait for the API to load the requests (count should be greater than 0)
        await expect(managerPage.getByTestId('pending-requests-count')).not.toHaveText('0', { timeout: 10000 });
        const counts = await mngDash.getCount();
        
        await mngDash.approveRequest(1); 

        // 6. Verification: Employee receives real-time notification
        await expect(employeePage.getByTestId('toast-notification')).toBeVisible({ timeout: 10000 });
        await expect(employeePage.getByText(/Approved/i)).toBeVisible();
    });
});
