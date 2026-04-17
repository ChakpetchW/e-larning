/**
 * Utilities for handling dates and timezones between Browser and Server (UTC)
 */

/**
 * Converts a datetime-local input value (YYYY-MM-DDTHH:mm) to a UTC ISO string
 * @param {string} localValue - The value from <input type="datetime-local">
 * @returns {string|null} - UTC ISO string or null
 */
export const toUTCISOString = (localValue) => {
  if (!localValue) return null;
  const date = new Date(localValue);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

/**
 * Converts a UTC ISO string to a datetime-local input value (YYYY-MM-DDTHH:mm)
 * Correctly handles timezone offset so the value matches the user's wall time.
 * @param {string|Date} utcValue - The UTC value from the server
 * @returns {string} - "YYYY-MM-DDTHH:mm"
 */
export const toLocalInputValue = (utcValue) => {
  if (!utcValue) return '';
  const date = new Date(utcValue);
  if (isNaN(date.getTime())) return '';
  
  // Shift the date by offset so toISOString returns the local wall-clock time
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

/**
 * Formats a date to Thai locale (BE) with specific precision
 * @param {string|Date} value - The date to format
 * @param {boolean} includeTime - Whether to include time (HH:mm)
 * @returns {string} - Formatted string (e.g., "30/04/2569" or "30/04/2569 23:59")
 */
export const formatThaiDateTime = (value, includeTime = false) => {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';

  const datePart = date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  if (!includeTime) return datePart;

  const timePart = date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `${datePart} ${timePart}`;
};

/**
 * Formats a date to full Thai words (BE)
 * @param {string|Date} value - The date to format
 * @returns {string} - Formatted string (e.g., "วันที่ 29 เมษายน 2569")
 */
export const formatThaiFullDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';

  const dateStr = date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `วันที่ ${dateStr}`;
};

/**
 * Returns the Buddhist Era (BE) year for a date
 * @param {string|Date} value - The date
 * @returns {number|string} - Year + 543 or '-'
 */
export const toThaiYear = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.getFullYear() + 543;
};

/**
 * Checks whether the given timestamp has already expired.
 * Useful as a UI safety net when the backend accidentally returns stale records.
 * @param {string|Date} value
 * @param {Date} referenceDate
 * @returns {boolean}
 */
export const isExpiredAt = (value, referenceDate = new Date()) => {
  if (!value) return false;
  const date = new Date(value);
  if (isNaN(date.getTime())) return false;
  return date <= referenceDate;
};

/**
 * Filters temporary course/category-like items that should no longer be visible.
 * @param {Array} items
 * @param {Date} referenceDate
 * @returns {Array}
 */
export const filterVisibleTimedItems = (items, referenceDate = new Date()) => {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    if (!item) return false;
    if (item.isTemporary === true) return !isExpiredAt(item.expiredAt, referenceDate);
    if (item.isTemporary === false) return true;
    return !isExpiredAt(item.expiredAt, referenceDate);
  });
};

/**
 * Filters visible learning goals based on expiryDate.
 * @param {Array} goals
 * @param {Date} referenceDate
 * @returns {Array}
 */
export const filterVisibleGoals = (goals, referenceDate = new Date()) => {
  if (!Array.isArray(goals)) return [];

  return goals.filter((goal) => !isExpiredAt(goal?.expiryDate, referenceDate));
};
