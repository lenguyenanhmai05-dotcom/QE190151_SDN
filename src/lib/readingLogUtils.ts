export function isFutureDate(dateStr: string): boolean {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return false;
  }
  const targetDate = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  const now = new Date();
  const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const todayUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999);
  const maxToday = Math.max(todayLocal.getTime(), todayUtc.getTime());
  return targetDate.getTime() > maxToday;
}

export function formatReadingLog(log: {
  id: string;
  bookTitle: string;
  minutesRead: number;
  genre: string;
  note: string | null;
  favorite: boolean;
  readOn: string;
  createdAt: Date;
}) {
  return {
    id: log.id,
    bookTitle: log.bookTitle,
    minutesRead: log.minutesRead,
    genre: log.genre,
    note: log.note ?? "",
    favorite: log.favorite,
    readOn: log.readOn,
    createdAt: log.createdAt.toISOString(),
  };
}
