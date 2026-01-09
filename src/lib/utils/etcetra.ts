
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  const cutPoint = lastSpace > 0 ? lastSpace : maxLength;
  
  return text.substring(0, cutPoint).trim() + '...';
}