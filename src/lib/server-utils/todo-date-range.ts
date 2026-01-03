export function getTodoDateRanges() {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const startOfWeek = new Date(startOfToday);
  const day = startOfWeek.getDay() || 7; 
  startOfWeek.setDate(startOfWeek.getDate() - (day - 1));

  const startOfLast30Days = new Date(startOfToday);
  startOfLast30Days.setDate(startOfLast30Days.getDate() - 29);

  const daysElapsedThisWeek = Math.floor(
    (startOfTomorrow.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24)
  ) || 1;

  return { now, startOfToday, startOfTomorrow, startOfWeek, startOfLast30Days, daysElapsedThisWeek };
}