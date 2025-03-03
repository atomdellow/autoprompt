/**
 * Format a date string or Date object to a human-readable date
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

/**
 * Format a date string or Date object to a human-readable date and time
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format a date object to YYYY-MM-DD for input[type="date"]
 * @param {Date} date - The date object to format 
 * @returns {string} Formatted date string
 */
export function formatDateForInput(date) {
  if (!date || !(date instanceof Date)) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format a date object to HH:MM for input[type="time"]
 * @param {Date} date - The date object to format
 * @returns {string} Formatted time string
 */
export function formatTimeForInput(date) {
  if (!date || !(date instanceof Date)) return '';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format a date object as a readable string
 * @param {Date|string} date - The date object or ISO string to format
 * @param {boolean} includeTime - Whether to include the time
 * @returns {string} Formatted date string
 */
export function formatReadableDate(date, includeTime = false) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.hour12 = true;
  }
  
  return dateObj.toLocaleString(undefined, options);
}

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is in the future
 */
export function isFutureDate(date) {
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  
  return dateObj > now;
}
