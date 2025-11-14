import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatPercentage,
  formatDiseaseName,
  truncateText,
  isValidEmail,
  isValidPhone,
  daysBetween
} from './formatters';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(100000)).toBe('₹1,00,000');
      expect(formatCurrency(2500)).toBe('₹2,500');
    });

    test('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('₹0');
    });

    test('formats negative numbers correctly', () => {
      expect(formatCurrency(-1000)).toBe('₹-1,000');
    });

    test('handles invalid inputs', () => {
      expect(formatCurrency(NaN)).toBe('₹0');
      expect(formatCurrency('invalid')).toBe('₹0');
      expect(formatCurrency(null)).toBe('₹0');
      expect(formatCurrency(undefined)).toBe('₹0');
    });

    test('formats decimal numbers', () => {
      expect(formatCurrency(1234.56)).toBe('₹1,234.56');
    });
  });

  describe('formatDate', () => {
    test('formats Date object correctly', () => {
      const date = new Date('2025-11-14');
      const formatted = formatDate(date);
      expect(formatted).toContain('Nov');
      expect(formatted).toContain('2025');
    });

    test('formats date string correctly', () => {
      const formatted = formatDate('2025-11-14');
      expect(formatted).toContain('Nov');
      expect(formatted).toContain('2025');
    });

    test('handles invalid dates', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    test('handles empty string', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    test('returns "just now" for recent times', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    test('formats minutes correctly', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(date)).toBe('5 minutes ago');
    });

    test('formats hours correctly', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    test('formats days correctly', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    test('uses singular for 1 unit', () => {
      const date = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
      expect(formatRelativeTime(date)).toBe('1 minute ago');
    });

    test('handles invalid dates', () => {
      expect(formatRelativeTime('invalid')).toBe('');
      expect(formatRelativeTime(null)).toBe('');
    });
  });

  describe('formatPercentage', () => {
    test('formats percentages with default decimals', () => {
      expect(formatPercentage(95.5)).toBe('95.5%');
      expect(formatPercentage(50)).toBe('50.0%');
    });

    test('formats percentages with custom decimals', () => {
      expect(formatPercentage(95.567, 2)).toBe('95.57%');
      expect(formatPercentage(50, 0)).toBe('50%');
    });

    test('handles zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    test('handles invalid inputs', () => {
      expect(formatPercentage(NaN)).toBe('0%');
      expect(formatPercentage('invalid')).toBe('0%');
    });
  });

  describe('formatDiseaseName', () => {
    test('converts snake_case to Title Case', () => {
      expect(formatDiseaseName('tomato_late_blight')).toBe('Tomato Late Blight');
      expect(formatDiseaseName('potato_early_blight')).toBe('Potato Early Blight');
    });

    test('handles single word', () => {
      expect(formatDiseaseName('healthy')).toBe('Healthy');
    });

    test('handles empty string', () => {
      expect(formatDiseaseName('')).toBe('');
    });

    test('handles null/undefined', () => {
      expect(formatDiseaseName(null)).toBe('');
      expect(formatDiseaseName(undefined)).toBe('');
    });
  });

  describe('truncateText', () => {
    test('truncates long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    test('does not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncateText(shortText, 20)).toBe('Short text');
    });

    test('uses default max length', () => {
      const text = 'a'.repeat(150);
      const truncated = truncateText(text);
      expect(truncated.length).toBe(103); // 100 + '...'
    });

    test('handles empty string', () => {
      expect(truncateText('')).toBe('');
    });

    test('handles null/undefined', () => {
      expect(truncateText(null)).toBe('');
      expect(truncateText(undefined)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    test('validates correct email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.in')).toBe(true);
      expect(isValidEmail('name+tag@email.com')).toBe(true);
    });

    test('rejects invalid email formats', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user @domain.com')).toBe(false);
    });

    test('handles empty/null inputs', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('validates Indian phone numbers', () => {
      expect(isValidPhone('9876543210')).toBe(true);
      expect(isValidPhone('8123456789')).toBe(true);
      expect(isValidPhone('7000000000')).toBe(true);
    });

    test('validates phone numbers with country code', () => {
      expect(isValidPhone('+919876543210')).toBe(true);
      expect(isValidPhone('919876543210')).toBe(true);
    });

    test('validates phone numbers with formatting', () => {
      expect(isValidPhone('987-654-3210')).toBe(true);
      expect(isValidPhone('987 654 3210')).toBe(true);
    });

    test('rejects invalid phone numbers', () => {
      expect(isValidPhone('123456789')).toBe(false); // Too short
      expect(isValidPhone('5876543210')).toBe(false); // Doesn't start with 6-9
      expect(isValidPhone('abcdefghij')).toBe(false); // Not numbers
    });

    test('handles empty/null inputs', () => {
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(null)).toBe(false);
      expect(isValidPhone(undefined)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    test('calculates days between two dates', () => {
      const date1 = new Date('2025-11-01');
      const date2 = new Date('2025-11-14');
      expect(daysBetween(date1, date2)).toBe(13);
    });

    test('handles date strings', () => {
      expect(daysBetween('2025-11-01', '2025-11-14')).toBe(13);
    });

    test('returns absolute difference', () => {
      const date1 = new Date('2025-11-14');
      const date2 = new Date('2025-11-01');
      expect(daysBetween(date1, date2)).toBe(13);
    });

    test('returns 0 for same date', () => {
      const date = new Date('2025-11-14');
      expect(daysBetween(date, date)).toBe(0);
    });

    test('handles invalid dates', () => {
      expect(daysBetween('invalid', '2025-11-14')).toBe(0);
      expect(daysBetween(null, new Date())).toBe(0);
    });
  });
});
