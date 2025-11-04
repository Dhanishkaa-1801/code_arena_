/**
 * Formats a UTC date string into a user-friendly local-like format
 * without applying the browser's timezone conversion.
 * It reads the UTC values and displays them as-is.
 * E.g., "2024-05-18T14:00:00+00:00" becomes "5/18/2024, 2:00 PM".
 * @param dateString The ISO date string from Supabase.
 * @returns A formatted date string.
 */
export function formatUTCDateString(dateString: string): string {
  const date = new Date(dateString);

  // Use getUTC* methods to extract the date/time parts as they are in UTC
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // getUTCMonth() is 0-indexed
  const day = date.getUTCDate();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // Format hours for 12-hour clock with AM/PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${month}/${day}/${year}, ${formattedHours}:${formattedMinutes} ${ampm}`;
}