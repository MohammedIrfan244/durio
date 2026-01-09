export const today = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export const nowWithTime = (): Date => {
  return new Date();
}

export const parseTimeStringToDate = (date: Date, timeString: string): Date => {
    const parts = timeString.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (!parts) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }

    let [_, hourStr, minuteStr, period] = parts;
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);

    if (period.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    } else if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const combinedDate = new Date(date);
    combinedDate.setUTCHours(hours, minutes, 0, 0);
    return combinedDate;
};




















