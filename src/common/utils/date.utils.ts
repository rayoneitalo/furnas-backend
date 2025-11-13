export const getNextMondayMidnight = (now: Date = new Date()): Date => {
  const result = new Date(now);
  result.setHours(0, 0, 0, 0);

  const currentDay = result.getDay();
  let daysToAdd = (8 - currentDay) % 7;

  if (daysToAdd === 0) {
    daysToAdd = 7;
  }

  result.setDate(result.getDate() + daysToAdd);
  return result;
};
