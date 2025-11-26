/**
 * LearnHub UI Utilities
 * Toast notifications, loading states, and interactive components
 */

// =========================================
// Toast Notification System
// =========================================

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      this.container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(this.container);
    } else {
      this.container = document.querySelector('.toast-container');
    }
  }

  show(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };

    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <div class="toast-content">
        <div class="toast-title">${titles[type]}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close notification">
        <i class="bi bi-x"></i>
      </button>
    `;

    this.container.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Initialize global toast instance
window.toast = new ToastManager();

// =========================================
// Form Validation Utilities
// =========================================

class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.fields = {};
    this.init();
  }

  init() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      this.fields[input.id || input.name] = {
        element: input,
        rules: this.getRules(input),
        valid: false
      };

      // Add real-time validation
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
          this.validateField(input);
        }
      });
    });
  }

  getRules(input) {
    const rules = [];
    
    if (input.required) {
      rules.push({ type: 'required', message: 'This field is required' });
    }

    if (input.type === 'email') {
      rules.push({ 
        type: 'email', 
        message: 'Please enter a valid email address',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      });
    }

    if (input.type === 'tel') {
      rules.push({ 
        type: 'phone', 
        message: 'Please enter a valid phone number',
        pattern: /^[\d\s\-\+\(\)]+$/
      });
    }

    if (input.minLength) {
      rules.push({ 
        type: 'minLength', 
        value: input.minLength,
        message: `Minimum ${input.minLength} characters required`
      });
    }

    if (input.maxLength) {
      rules.push({ 
        type: 'maxLength', 
        value: input.maxLength,
        message: `Maximum ${input.maxLength} characters allowed`
      });
    }

    return rules;
  }

  validateField(input) {
    const field = this.fields[input.id || input.name];
    if (!field) return true;

    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    for (const rule of field.rules) {
      switch (rule.type) {
        case 'required':
          if (!value) {
            isValid = false;
            errorMessage = rule.message;
          }
          break;
        
        case 'email':
        case 'phone':
          if (value && !rule.pattern.test(value)) {
            isValid = false;
            errorMessage = rule.message;
          }
          break;
        
        case 'minLength':
          if (value && value.length < rule.value) {
            isValid = false;
            errorMessage = rule.message;
          }
          break;
        
        case 'maxLength':
          if (value && value.length > rule.value) {
            isValid = false;
            errorMessage = rule.message;
          }
          break;
      }

      if (!isValid) break;
    }

    this.updateFieldUI(input, isValid, errorMessage);
    field.valid = isValid;
    return isValid;
  }

  updateFieldUI(input, isValid, errorMessage) {
    const formGroup = input.closest('.form-group') || input.parentElement;
    let feedback = formGroup.querySelector('.form-feedback');

    // Remove existing classes
    input.classList.remove('valid', 'invalid');

    if (input.value.trim()) {
      input.classList.add(isValid ? 'valid' : 'invalid');
    }

    // Create or update feedback element
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'form-feedback';
      formGroup.appendChild(feedback);
    }

    feedback.className = `form-feedback ${isValid ? 'valid' : 'invalid'}`;
    
    if (isValid && input.value.trim()) {
      feedback.innerHTML = '<i class="bi bi-check-circle-fill form-feedback-icon"></i> Looks good!';
    } else if (!isValid) {
      feedback.innerHTML = `<i class="bi bi-exclamation-circle-fill form-feedback-icon"></i> ${errorMessage}`;
      feedback.setAttribute('role', 'alert');
    } else {
      feedback.innerHTML = '';
    }
  }

  validateAll() {
    let allValid = true;
    
    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];
      const isValid = this.validateField(field.element);
      if (!isValid) allValid = false;
    }

    return allValid;
  }

  reset() {
    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];
      field.element.classList.remove('valid', 'invalid');
      const feedback = field.element.closest('.form-group')?.querySelector('.form-feedback');
      if (feedback) feedback.innerHTML = '';
    }
  }
}

// =========================================
// Loading State Manager
// =========================================

class LoadingManager {
  static showSkeleton(container, type = 'card', count = 1) {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      
      if (type === 'card') {
        skeleton.className = 'col-md-6 col-lg-4';
        skeleton.innerHTML = `
          <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text medium"></div>
            <div class="skeleton skeleton-text short"></div>
          </div>
        `;
      } else if (type === 'list') {
        skeleton.className = 'skeleton-card mb-3';
        skeleton.innerHTML = `
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text medium"></div>
        `;
      }
      
      skeletons.push(skeleton);
      container.appendChild(skeleton);
    }
    
    return skeletons;
  }

  static removeSkeleton(container) {
    const skeletons = container.querySelectorAll('.skeleton-card');
    skeletons.forEach(skeleton => skeleton.remove());
  }

  static showSpinner(element, size = 'md') {
    const spinner = document.createElement('div');
    spinner.className = `spinner-border text-primary spinner-${size}`;
    spinner.setAttribute('role', 'status');
    spinner.innerHTML = '<span class="visually-hidden">Loading...</span>';
    
    element.innerHTML = '';
    element.appendChild(spinner);
    
    return spinner;
  }
}

// =========================================
// Dark Mode Toggle
// =========================================

class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.createToggle();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme = theme;
    localStorage.setItem('theme', theme);
  }

  toggle() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'visually-hidden';
    announcement.textContent = `Theme changed to ${newTheme} mode`;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  createToggle() {
    // This can be called to create a theme toggle button
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    toggle.innerHTML = `
      <i class="bi bi-moon-fill"></i>
      <i class="bi bi-sun-fill"></i>
    `;
    toggle.addEventListener('click', () => this.toggle());
    return toggle;
  }
}

// Initialize theme manager
window.themeManager = new ThemeManager();

// =========================================
// Progress Tracking Utilities
// =========================================

class ProgressTracker {
  static updateCircularProgress(element, percentage) {
    const circle = element.querySelector('.progress-ring-progress');
    const text = element.querySelector('.progress-ring-text');
    
    if (circle && text) {
      const radius = circle.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      const offset = circumference - (percentage / 100) * circumference;
      
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
      circle.style.strokeDashoffset = offset;
      text.textContent = `${percentage}%`;
    }
  }

  static updateLinearProgress(element, percentage) {
    const fill = element.querySelector('.progress-bar-fill');
    if (fill) {
      fill.style.width = `${percentage}%`;
    }
  }

  static animateProgress(element, from, to, duration = 1000) {
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = from + (to - from) * progress;
      
      if (element.classList.contains('progress-ring')) {
        this.updateCircularProgress(element, Math.round(currentValue));
      } else {
        this.updateLinearProgress(element, Math.round(currentValue));
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
}

// =========================================
// Accessibility Utilities
// =========================================

class A11yUtils {
  // Skip to content link
  static addSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--color-primary-600);
      color: white;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    `;
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Announce to screen readers
  static announce(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.className = 'visually-hidden';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // Trap focus in modal
  static trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
      
      if (e.key === 'Escape') {
        const closeBtn = element.querySelector('[data-bs-dismiss="modal"]');
        if (closeBtn) closeBtn.click();
      }
    });
  }
}

// Initialize accessibility features on page load
document.addEventListener('DOMContentLoaded', () => {
  A11yUtils.addSkipLink();
  
  // Add main content ID if not present
  const main = document.querySelector('main');
  if (main && !main.id) {
    main.id = 'main-content';
  }
});

// =========================================
// Wishlist Manager
// =========================================

class WishlistManager {
  constructor() {
    this.wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  }

  add(courseId) {
    if (!this.wishlist.includes(courseId)) {
      this.wishlist.push(courseId);
      this.save();
      window.toast.success('Added to wishlist');
      return true;
    }
    return false;
  }

  remove(courseId) {
    const index = this.wishlist.indexOf(courseId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.save();
      window.toast.info('Removed from wishlist');
      return true;
    }
    return false;
  }

  toggle(courseId) {
    if (this.has(courseId)) {
      return this.remove(courseId);
    } else {
      return this.add(courseId);
    }
  }

  has(courseId) {
    return this.wishlist.includes(courseId);
  }

  save() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    // Dispatch event for other components to listen
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { wishlist: this.wishlist } 
    }));
  }

  getAll() {
    return this.wishlist;
  }
}

// Initialize global wishlist instance
window.wishlist = new WishlistManager();

// =========================================
// Search Utilities
// =========================================

class SearchManager {
  constructor(items, searchKeys) {
    this.items = items;
    this.searchKeys = searchKeys;
  }

  search(query) {
    if (!query || query.trim() === '') {
      return this.items;
    }

    const lowerQuery = query.toLowerCase();
    
    return this.items.filter(item => {
      return this.searchKeys.some(key => {
        const value = this.getNestedValue(item, key);
        return value && value.toString().toLowerCase().includes(lowerQuery);
      });
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}

// =========================================
// Debounce Utility
// =========================================

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =========================================
// Export utilities
// =========================================

window.LearnHubUI = {
  ToastManager,
  FormValidator,
  LoadingManager,
  ThemeManager,
  ProgressTracker,
  A11yUtils,
  WishlistManager,
  SearchManager,
  debounce
};
