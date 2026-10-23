export interface Player {
  user_id: string;
  first_name: string;
  level: number;
  slot: number; // 0, 1 = Team 1 (Left); 2, 3 = Team 2 (Right)
  avatar_url: string | null;
}

export interface Club {
  name: string;
  city: string;
}

export interface Match {
  id: string;
  club: Club;
  match_datetime: string;
  match_type: 'competitive' | 'friendly';
  distance_km: number;
  max_players: number;
  players: Player[];
}

export interface CurrentUser {
  user_id: string;
  first_name: string;
  last_name?: string;
  level: number;
  email?: string;
  bio?: string;
  phone?: string;
  city?: string;
  gender?: 'male' | 'female';
  position?: string;
  favouriteClubs?: string;
  profile_picture_url?: string | null;
  smashScore?: number | null;
  certified_level?: number | null;
}

export interface MatchData {
  current_user: CurrentUser;
  matches: Match[];
}

export type UserMatchStatus =
  | 'ALREADY_JOINED'
  | 'FULL'
  | 'CAN_JOIN'
  | 'REQUEST_SENT'
  | 'NEEDS_REQUEST';
