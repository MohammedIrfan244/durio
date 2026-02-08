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


export function convertToTime(time: string) {
  const [timePart, rawMeridiem] = time.trim().split(/\s+/);
  const meridiem = rawMeridiem.toUpperCase();

  let [hours, minutes] = timePart.split(":").map(Number);

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  } else if (meridiem === "PM" && hours < 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

export function getCurrentTimeString(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}


export function convertToLocalDate ( {utc, timeZone}:{utc: string, timeZone: string} ) {
  const date = new Date(utc);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.filter(p => p.type !== "literal").map(p => [p.type, p.value])
  );

  const localDate = `${values.year}-${values.month}-${values.day}`;

  return new Date(`${localDate}T00:00:00`);
}
export function thisWeekDate(timeZone: string) {
  const now = convertToLocalDate({
    utc: new Date().toISOString(),
    timeZone,
  });

  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);

  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return { startOfWeek, endOfWeek };
}

export function numberToDayOfWeek(num: number): string {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return daysOfWeek[num] || "";
}