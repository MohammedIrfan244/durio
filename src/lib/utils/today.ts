const now = new Date();
import { startOfDay, addDays } from "date-fns"


export const today = (): Date => {
  now.setHours(0, 0, 0, 0);
  return now;
}


export const start = startOfDay(now);
export const end = addDays(start, 1)
