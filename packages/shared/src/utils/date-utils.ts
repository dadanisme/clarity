/**
 * Converts a Date or ISO string to a standardized Date object
 * @param dateValue - Can be a Date, ISO string, or null/undefined
 * @returns A Date object or null if input is null/undefined
 */
export function toDate(dateValue: Date | string | null | undefined): Date | null {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Handle ISO strings from Supabase
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  }

  // Fallback: try to create Date from the value
  try {
    return new Date(dateValue as string | number);
  } catch {
    return null;
  }
}

/**
 * Formats a date value to a localized date string
 * @param dateValue - Can be a Date, ISO string, or null/undefined
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or fallback text
 */
export function formatDate(
  dateValue: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'Unknown date'
): string {
  const date = toDate(dateValue);
  
  if (!date) {
    return fallback;
  }

  return date.toLocaleDateString(undefined, options);
}

/**
 * Formats a date value to include both date and time
 * @param dateValue - Can be a Date, ISO string, or null/undefined
 * @param fallback - Text to show if date is invalid
 * @returns Formatted datetime string
 */
export function formatDateTime(
  dateValue: Date | string | null | undefined,
  fallback: string = 'Unknown date'
): string {
  return formatDate(dateValue, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }, fallback);
}