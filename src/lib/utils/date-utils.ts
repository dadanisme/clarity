import { Timestamp } from "firebase/firestore";

/**
 * Converts a Firestore Timestamp or Date to a standardized Date object
 * @param dateValue - Can be a Date, Firestore Timestamp, or null/undefined
 * @returns A Date object or null if input is null/undefined
 */
export function toDate(dateValue: Date | Timestamp | null | undefined): Date | null {
  if (!dateValue) {
    return null;
  }

  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  }

  // Handle plain objects with seconds property (from Firestore data)
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    const timestampLike = dateValue as { seconds: number };
    return new Date(timestampLike.seconds * 1000);
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
 * @param dateValue - Can be a Date, Firestore Timestamp, or null/undefined
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or fallback text
 */
export function formatDate(
  dateValue: Date | Timestamp | null | undefined,
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
 * @param dateValue - Can be a Date, Firestore Timestamp, or null/undefined
 * @param fallback - Text to show if date is invalid
 * @returns Formatted datetime string
 */
export function formatDateTime(
  dateValue: Date | Timestamp | null | undefined,
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