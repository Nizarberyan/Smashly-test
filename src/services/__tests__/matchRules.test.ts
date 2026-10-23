import { describe, it, expect } from 'bun:test';
import {
  filterUpcomingMatches,
  calculateMatchAverage,
  calculateMatchLevelRange,
  getUserMatchStatus,
  formatLevelRange,
} from '../matchRules';
import { Match, CurrentUser, Player } from '../../types/match';
import initialData from '../../../matches.json';

describe('Smashly AI — Match Rules Specification Verification', () => {
  const currentUser: CurrentUser = initialData.current_user as CurrentUser;
  const matches: Match[] = initialData.matches as Match[];

  it('filters out past matches (m5 from Oct 10 must not be displayed)', () => {
    // Reference date set to Oct 22, 2026 (date of test specification)
    const refDate = new Date('2026-10-22T00:00:00Z');
    const upcoming = filterUpcomingMatches(matches, refDate);

    expect(upcoming.length).toBe(4);
    const m5Exists = upcoming.some((m) => m.id === 'm5');
    expect(m5Exists).toBe(false);
  });

  it('calculates level range accurately for Padel Collection (m1)', () => {
    const m1 = matches.find((m) => m.id === 'm1')!;
    const { average, minLevel, maxLevel } = calculateMatchLevelRange(m1.players);

    // Mathieu (7) + Maxime (8) -> avg = 7.5
    expect(average).toBe(7.5);
    expect(minLevel).toBe(6.5);
    expect(maxLevel).toBe(8.0);

    // Julien (7) is inside [6.5, 8.0] -> CAN_JOIN
    const status = getUserMatchStatus(m1, currentUser);
    expect(status).toBe('CAN_JOIN');
  });

  it('calculates level range accurately for Set Club (m2) — Julien is too strong', () => {
    const m2 = matches.find((m) => m.id === 'm2')!;
    const { average, minLevel, maxLevel } = calculateMatchLevelRange(m2.players);

    // Lucas (4) + Emma (4.5) + Hugo (5) -> avg = 4.5
    expect(average).toBe(4.5);
    expect(minLevel).toBe(3.5);
    expect(maxLevel).toBe(5.5);

    // Julien (7) is above 5.5 -> NEEDS_REQUEST
    const status = getUserMatchStatus(m2, currentUser);
    expect(status).toBe('NEEDS_REQUEST');

    // Once requested -> REQUEST_SENT
    const requestedStatus = getUserMatchStatus(m2, currentUser, ['m2']);
    expect(requestedStatus).toBe('REQUEST_SENT');
  });

  it('detects a full match for AVT (m3) — 4 players', () => {
    const m3 = matches.find((m) => m.id === 'm3')!;
    expect(m3.players.length).toBe(4);

    const status = getUserMatchStatus(m3, currentUser);
    expect(status).toBe('FULL');
  });

  it('calculates level range accurately for Win Win Padel (m4) — Julien is on the exact limit', () => {
    const m4 = matches.find((m) => m.id === 'm4')!;
    const { average, minLevel, maxLevel } = calculateMatchLevelRange(m4.players);

    // Paul (6) -> avg = 6.0 -> [5.0, 7.0]
    expect(average).toBe(6.0);
    expect(minLevel).toBe(5.0);
    expect(maxLevel).toBe(7.0);

    // Julien (7) is on the boundary (inclusive) -> CAN_JOIN
    const status = getUserMatchStatus(m4, currentUser);
    expect(status).toBe('CAN_JOIN');
  });

  it('detects when Julien has already joined a match', () => {
    const m1 = matches.find((m) => m.id === 'm1')!;
    const m1WithJulien: Match = {
      ...m1,
      players: [
        ...m1.players,
        {
          user_id: currentUser.user_id,
          first_name: currentUser.first_name,
          level: currentUser.level,
          slot: 2,
          avatar_url: null,
        },
      ],
    };

    const status = getUserMatchStatus(m1WithJulien, currentUser);
    expect(status).toBe('ALREADY_JOINED');
  });

  it('clamps level range bounds between 0 and 8', () => {
    // High level player (8) -> avg = 8 -> max = min(8, 9) = 8
    const highPlayer: Player[] = [
      { user_id: 'p1', first_name: 'Pro', level: 8, slot: 0, avatar_url: null },
    ];
    const highRange = calculateMatchLevelRange(highPlayer);
    expect(highRange.maxLevel).toBe(8);

    // Low level player (0.5) -> avg = 0.5 -> min = max(0, -0.5) = 0
    const lowPlayer: Player[] = [
      { user_id: 'p2', first_name: 'Beginner', level: 0.5, slot: 0, avatar_url: null },
    ];
    const lowRange = calculateMatchLevelRange(lowPlayer);
    expect(lowRange.minLevel).toBe(0);
  });

  it('formats level ranges for display', () => {
    expect(formatLevelRange(6.5, 8)).toBe('Niv. 6,5 - 8');
    expect(formatLevelRange(5, 7)).toBe('Niv. 5 - 7');
  });
});
