
// Utility Functions

/**
 * Generates a unique Student ID based on the current year and a random sequence.
 * Format: STU-YYYY-XXXX (e.g., STU-2024-1042)
 */
function generateStudentId() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit random number
    return `STU-${year}-${randomNum}`;
}

/**
 * Generates a random password.
 * Format: 8 characters alphanumeric
 */
function generatePassword(length = 8) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

// Export to window
window.utils = {
    generateStudentId,
    generatePassword
};
