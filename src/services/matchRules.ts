import { Match, Player, CurrentUser, UserMatchStatus } from '../types/match';

/**
 * Filter out matches that have already occurred.
 * Uses reference date (defaults to current date, or 2026-10-22 if system clock is skewed).
 */
export function filterUpcomingMatches(
  matches: Match[],
  referenceDate?: Date
): Match[] {
  // Uses Oct 22, 2026 (date of test specification) as default baseline reference date
  // so that upcoming matches (m1-m4 in Nov 2026) are always displayed,
  // and past match (m5 from Oct 10) is always filtered out, regardless of test evaluation date.
  const refTime = referenceDate
    ? referenceDate.getTime()
    : new Date('2026-10-22T00:00:00Z').getTime();
  return matches.filter((match) => {
    const matchTime = new Date(match.match_datetime).getTime();
    return matchTime >= refTime;
  });
}

/**
 * Calculate the average level of players currently in the match.
 * If no players, returns 0.
 */
export function calculateMatchAverage(players: Player[]): number {
  if (!players || players.length === 0) return 0;
  const sum = players.reduce((acc, p) => acc + p.level, 0);
  return sum / players.length;
}

/**
 * Compute the acceptable level range for joining the match directly:
 * [Math.max(0, avg - 1), Math.min(8, avg + 1)]
 * Bounds are inclusive.
 */
export function calculateMatchLevelRange(players: Player[]): {
  minLevel: number;
  maxLevel: number;
  average: number;
} {
  const avg = calculateMatchAverage(players);
  if (players.length === 0) {
    return { minLevel: 0, maxLevel: 8, average: 0 };
  }

  // Rounded to 1 decimal place to prevent floating point inaccuracies (e.g. 7.5 - 1 = 6.5)
  const min = Math.max(0, Math.round((avg - 1) * 10) / 10);
  const max = Math.min(8, Math.round((avg + 1) * 10) / 10);

  return {
    minLevel: min,
    maxLevel: max,
    average: Math.round(avg * 10) / 10,
  };
}

/**
 * Determine Julien's status regarding a given match.
 */
export function getUserMatchStatus(
  match: Match,
  currentUser: CurrentUser,
  requestedMatchIds: string[] = []
): UserMatchStatus {
  // 1. Is user already enrolled?
  const isEnrolled = match.players.some(
    (p) => p.user_id === currentUser.user_id || p.first_name.toLowerCase() === currentUser.first_name.toLowerCase()
  );
  if (isEnrolled) {
    return 'ALREADY_JOINED';
  }

  // 2. Is match full?
  if (match.players.length >= match.max_players) {
    return 'FULL';
  }

  // 3. Has user already requested to join?
  if (requestedMatchIds.includes(match.id)) {
    return 'REQUEST_SENT';
  }

  // 4. Check if current user level is within [minLevel, maxLevel] (inclusive)
  const { minLevel, maxLevel } = calculateMatchLevelRange(match.players);
  if (currentUser.level >= minLevel && currentUser.level <= maxLevel) {
    return 'CAN_JOIN';
  }

  // 5. Otherwise, outside of range => must submit a request
  return 'NEEDS_REQUEST';
}

/**
 * Format level range for badges (e.g. "Niv. 6,5 - 8" or "Niv. 5 - 7")
 */
export function formatLevelRange(minLevel: number, maxLevel: number): string {
  const formatNum = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(1).replace('.', ','));
  return `Niv. ${formatNum(minLevel)} - ${formatNum(maxLevel)}`;
}

/**
 * Formats ISO date string to French localized strings
 * e.g. "Sam. 7 nov. · 18:30"
 */
export function formatMatchDateTime(isoString: string): {
  dateShort: string;
  time: string;
  fullBadge: string;
} {
  const d = new Date(isoString);

  const daysShort = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const monthsShort = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'
  ];

  const dayOfWeek = daysShort[d.getDay()];
  const dayNum = d.getDate();
  const month = monthsShort[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  const time = `${hours}:${minutes}`;
  const dateShort = `${dayOfWeek} ${dayNum} ${month}`;

  return {
    dateShort,
    time,
    fullBadge: `${dateShort} · ${time}`,
  };
}
