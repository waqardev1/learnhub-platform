/**
 * Unit Tests for Security Manager
 */

describe('SecurityManager', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('Input Sanitization', () => {
        test('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello';
            const result = SecurityManager.sanitizeInput(input);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('</script>');
        });

        test('should remove javascript: protocol', () => {
            const input = 'javascript:alert("xss")';
            const result = SecurityManager.sanitizeInput(input);
            expect(result).not.toContain('javascript:');
        });

        test('should remove event handlers', () => {
            const input = 'onclick=alert("xss")';
            const result = SecurityManager.sanitizeInput(input);
            expect(result).not.toContain('onclick=');
        });

        test('should limit length', () => {
            const input = 'a'.repeat(1000);
            const result = SecurityManager.sanitizeInput(input, 100);
            expect(result.length).toBe(100);
        });

        test('should sanitize email', () => {
            const email = '  TEST@EXAMPLE.COM  ';
            const result = SecurityManager.sanitizeEmail(email);
            expect(result).toBe('test@example.com');
        });

        test('should sanitize phone', () => {
            const phone = '+1 (234) 567-8900 abc';
            const result = SecurityManager.sanitizePhone(phone);
            expect(result).toBe('+1 (234) 567-8900 ');
        });
    });

    describe('CSRF Protection', () => {
        test('should generate CSRF token', () => {
            const token = SecurityManager.generateCSRFToken();
            expect(token).toBeTruthy();
            expect(typeof token).toBe('string');
        });

        test('should validate CSRF token', () => {
            const token = SecurityManager.generateCSRFToken();
            localStorage.setItem('csrf_token', token);
            expect(SecurityManager.validateCSRFToken(token)).toBe(true);
            expect(SecurityManager.validateCSRFToken('invalid')).toBe(false);
        });
    });

    describe('Rate Limiting', () => {
        test('should allow requests within limit', () => {
            const limiter = SecurityManager.createRateLimiter(3, 1000);
            expect(limiter.canMakeRequest()).toBe(true);
            limiter.recordRequest();
            expect(limiter.canMakeRequest()).toBe(true);
            limiter.recordRequest();
            expect(limiter.canMakeRequest()).toBe(true);
        });

        test('should block requests over limit', () => {
            const limiter = SecurityManager.createRateLimiter(2, 1000);
            limiter.recordRequest();
            limiter.recordRequest();
            expect(limiter.canMakeRequest()).toBe(false);
        });

        test('should reset after time window', (done) => {
            const limiter = SecurityManager.createRateLimiter(1, 100);
            limiter.recordRequest();
            expect(limiter.canMakeRequest()).toBe(false);

            setTimeout(() => {
                expect(limiter.canMakeRequest()).toBe(true);
                done();
            }, 150);
        });
    });

    describe('XSS Protection', () => {
        test('should escape HTML', () => {
            const html = '<script>alert("xss")</script>';
            const escaped = SecurityManager.escapeHTML(html);
            expect(escaped).toContain('&lt;');
            expect(escaped).toContain('&gt;');
        });
    });
});
