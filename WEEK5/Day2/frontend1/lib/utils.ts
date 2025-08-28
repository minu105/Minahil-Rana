// Utility functions for the application

/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Remove HTML tags using regex
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}
