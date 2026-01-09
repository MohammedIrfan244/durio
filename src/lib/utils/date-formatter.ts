import { format } from "date-fns";

export function formatDate(date: Date | string | number | undefined, maxLength?: number): string {
  if (!date) {
    return "";
  }

  const formattedDate = format(new Date(date), "MMM dd, yyyy");

  if (maxLength && formattedDate.length > maxLength) {
    return formattedDate.substring(0, maxLength) + "...";
  }

  return formattedDate;
}
