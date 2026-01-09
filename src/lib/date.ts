export function guessYear(month: number, day: number): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // 未来の日付なら前年
  if (month > currentMonth || (month === currentMonth && day > currentDay)) {
    return currentYear - 1;
  }
  return currentYear;
}
