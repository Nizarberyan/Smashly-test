import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Match, Player } from '../../types/match';
import { filterUpcomingMatches, calculateMatchLevelRange } from '../../services/matchRules';
import rawMatchesData from '../../../matches.json';
import { CurrentUser } from './authSlice';

export interface MatchesState {
  matches: Match[];
  requestedMatchIds: string[];
  filterLevelOnly: boolean;
  filterCompetitiveOnly: boolean;
  filterFriendlyOnly: boolean;
}

// Initial matches list with past matches (like Oct 10 m5) filtered out as per spec
const initialMatches: Match[] = filterUpcomingMatches(rawMatchesData.matches as Match[]);

const initialState: MatchesState = {
  matches: initialMatches,
  requestedMatchIds: [],
  filterLevelOnly: false,
  filterCompetitiveOnly: false,
  filterFriendlyOnly: false,
};

export const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    joinMatchSlot: (
      state,
      action: PayloadAction<{ matchId: string; targetSlot?: number; user: CurrentUser }>
    ) => {
      const { matchId, targetSlot, user } = action.payload;
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return;

      const match = state.matches[matchIndex];

      // 1. Check if already joined
      if (match.players.some((p) => p.user_id === user.user_id)) {
        return;
      }

      // 2. Check if full
      if (match.players.length >= match.max_players) {
        return;
      }

      // 3. Check level range
      const { minLevel, maxLevel } = calculateMatchLevelRange(match.players);
      if (user.level < minLevel || user.level > maxLevel) {
        return;
      }

      // 4. Find free slot
      const occupiedSlots = new Set(match.players.map((p) => p.slot));
      let slotToUse =
        typeof targetSlot === 'number' && !occupiedSlots.has(targetSlot)
          ? targetSlot
          : [0, 1, 2, 3].find((s) => !occupiedSlots.has(s));

      if (slotToUse === undefined) return;

      const newPlayer: Player = {
        user_id: user.user_id,
        first_name: user.first_name,
        level: user.level,
        slot: slotToUse,
        avatar_url: user.profile_picture_url || null,
      };

      state.matches[matchIndex].players.push(newPlayer);
    },

    leaveMatchSlot: (state, action: PayloadAction<{ matchId: string; userId: string }>) => {
      const { matchId, userId } = action.payload;
      const matchIndex = state.matches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return;

      state.matches[matchIndex].players = state.matches[matchIndex].players.filter(
        (p) => p.user_id !== userId
      );
    },

    requestJoinMatch: (state, action: PayloadAction<{ matchId: string }>) => {
      if (!state.requestedMatchIds.includes(action.payload.matchId)) {
        state.requestedMatchIds.push(action.payload.matchId);
      }
    },

    setFilterLevelOnly: (state, action: PayloadAction<boolean>) => {
      state.filterLevelOnly = action.payload;
    },

    setFilterCompetitiveOnly: (state, action: PayloadAction<boolean>) => {
      state.filterCompetitiveOnly = action.payload;
      if (action.payload) state.filterFriendlyOnly = false;
    },

    setFilterFriendlyOnly: (state, action: PayloadAction<boolean>) => {
      state.filterFriendlyOnly = action.payload;
      if (action.payload) state.filterCompetitiveOnly = false;
    },

    resetAllFilters: (state) => {
      state.filterLevelOnly = false;
      state.filterCompetitiveOnly = false;
      state.filterFriendlyOnly = false;
    },

    resetMatchesToDefault: (state) => {
      state.matches = filterUpcomingMatches(rawMatchesData.matches as Match[]);
      state.requestedMatchIds = [];
    },
  },
});

export const {
  joinMatchSlot,
  leaveMatchSlot,
  requestJoinMatch,
  setFilterLevelOnly,
  setFilterCompetitiveOnly,
  setFilterFriendlyOnly,
  resetAllFilters,
  resetMatchesToDefault,
} = matchesSlice.actions;

export default matchesSlice.reducer;
