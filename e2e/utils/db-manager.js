/**
 * Helper to reset the database activity through the TestController API
 */
async function resetTestDatabase() {
    try {
        const response = await fetch('http://localhost:8080/api/test/reset', {
            method: 'POST'
        });
        if (response.ok) {
            console.log('Database activity cleared successfully for testing.');
        } else {
            console.error('Failed to reset test database:', response.statusText);
        }
    } catch (e) {
        console.error('Network error resetting test database:', e.message);
    }
}

module.exports = { resetTestDatabase };
