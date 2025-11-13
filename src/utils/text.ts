/**
 * Truncates text to a maximum number of lines
 * @param body The text body to truncate
 * @param maxLines Maximum number of lines to show (default: 3)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateBody(body: string, maxLines: number = 3): string {
  const lines = body.split('\n');
  if (lines.length <= maxLines) {
    return body;
  }
  return lines.slice(0, maxLines).join('\n') + '...';
}

