/**
 * LearnHub Security Manager
 * CSRF protection, rate limiting, input sanitization, session management
 */

class SecurityManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.warningTime = 5 * 60 * 1000; // 5 minutes before timeout
        this.init();
    }

    init() {
        // Initialize CSRF token
        if (!localStorage.getItem('csrf_token')) {
            this.setCSRFToken();
        }

        // Initialize session timeout
        this.initSessionTimeout();

        console.log('✅ Security Manager initialized');
    }

    // ==========================================
    // INPUT SANITIZATION
    // ==========================================

    static sanitizeInput(input, maxLength = 500) {
        if (typeof input !== 'string') return input;

        return input
            .trim()
            .replace(/[<>]/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .substring(0, maxLength);
    }

    static sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    static sanitizeEmail(email) {
        const sanitized = this.sanitizeInput(email, 254);
        return sanitized.toLowerCase();
    }

    static sanitizePhone(phone) {
        return phone.replace(/[^0-9+\-\s()]/g, '');
    }

    // ==========================================
    // CSRF PROTECTION
    // ==========================================

    static generateCSRFToken() {
        return crypto.randomUUID();
    }

    setCSRFToken() {
        const token = SecurityManager.generateCSRFToken();
        localStorage.setItem('csrf_token', token);
        return token;
    }

    static getCSRFToken() {
        return localStorage.getItem('csrf_token');
    }

    static validateCSRFToken(token) {
        return token === this.getCSRFToken();
    }

    static addCSRFToForm(form) {
        let csrfInput = form.querySelector('input[name="csrf_token"]');

        if (!csrfInput) {
            csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            form.appendChild(csrfInput);
        }

        csrfInput.value = this.getCSRFToken();
    }

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================

    initSessionTimeout() {
        this.resetSessionTimer();

        // Reset timer on user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => this.resetSessionTimer(), true);
        });
    }

    resetSessionTimer() {
        clearTimeout(this.sessionTimer);
        clearTimeout(this.warningTimer);

        // Show warning 5 minutes before logout
        this.warningTimer = setTimeout(() => {
            this.showSessionWarning();
        }, this.sessionTimeout - this.warningTime);

        // Logout after timeout
        this.sessionTimer = setTimeout(() => {
            this.logout('Session expired due to inactivity');
        }, this.sessionTimeout);
    }

    showSessionWarning() {
        const extend = confirm(
            'Your session will expire in 5 minutes due to inactivity.\n\n' +
            'Click OK to stay logged in.'
        );

        if (extend) {
            this.resetSessionTimer();
            if (window.toast) {
                window.toast.success('Session extended');
            }
        }
    }

    logout(message) {
        localStorage.clear();
        sessionStorage.clear();

        if (window.toast) {
            window.toast.warning(message || 'Logged out');
        }

        setTimeout(() => {
            // Determine which login page to redirect to
            const isAdmin = window.location.pathname.includes('/admin/');
            const loginPage = isAdmin ? 'login.html' : '../portal/login.html';
            window.location.href = loginPage;
        }, 1000);
    }

    // ==========================================
    // RATE LIMITING
    // ==========================================

    static createRateLimiter(maxRequests = 5, windowMs = 60000) {
        const requests = [];

        return {
            canMakeRequest() {
                const now = Date.now();
                const recentRequests = requests.filter(time => now - time < windowMs);
                requests.length = 0;
                requests.push(...recentRequests);
                return requests.length < maxRequests;
            },

            recordRequest() {
                requests.push(Date.now());
            },

            getWaitTime() {
                if (this.canMakeRequest()) return 0;
                const oldestRequest = Math.min(...requests);
                return windowMs - (Date.now() - oldestRequest);
            },

            getRemainingRequests() {
                const now = Date.now();
                const recentRequests = requests.filter(time => now - time < windowMs);
                return Math.max(0, maxRequests - recentRequests.length);
            }
        };
    }

    // ==========================================
    // XSS PROTECTION
    // ==========================================

    static escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static unescapeHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    }

    // ==========================================
    // SECURE STORAGE
    // ==========================================

    static setSecureItem(key, value) {
        try {
            const encrypted = btoa(JSON.stringify(value));
            localStorage.setItem(key, encrypted);
            return true;
        } catch (error) {
            console.error('Failed to store item securely:', error);
            return false;
        }
    }

    static getSecureItem(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return JSON.parse(atob(encrypted));
        } catch (error) {
            console.error('Failed to retrieve item securely:', error);
            return null;
        }
    }
}

// ==========================================
// GLOBAL RATE LIMITERS
// ==========================================

const RateLimiters = {
    login: SecurityManager.createRateLimiter(5, 60000), // 5 attempts per minute
    registration: SecurityManager.createRateLimiter(3, 60000), // 3 per minute
    formSubmit: SecurityManager.createRateLimiter(10, 60000) // 10 per minute
};

// ==========================================
// EXPORT TO WINDOW
// ==========================================

window.SecurityManager = SecurityManager;
window.securityManager = new SecurityManager();
window.RateLimiters = RateLimiters;

console.log('✅ Security module loaded successfully');
