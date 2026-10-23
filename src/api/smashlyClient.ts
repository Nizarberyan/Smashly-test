import axios, { AxiosInstance, AxiosError } from 'axios';

export const SMASHLY_BASE_URL = 'https://smashlyai.com';

export const DEFAULT_NIZAR_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MzE0NTdmNy1lZmE2LTQ5OGEtOTQ3Ni0wYTY0MjAyMjhmMzQiLCJleHAiOjE3OTUzNjE0MTZ9.jOYdULx3YQmQW64lopzs47Aw0r4SQiSIJpFcbj8PyJM';

export const FALLBACK_USER_UUID = '731457f7-efa6-498a-9476-0a6420228f34';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ensures a valid PostgreSQL UUID is always sent to the Smashly backend.
 * Avoids 500 Internal Server Error when mock user IDs (e.g. 'user_julien') are used.
 */
export function extractValidUserId(userId?: string | null, token?: string | null): string {
  // 1. Prioritize authentic user account UUID from the JWT sub claim
  const effectiveToken = token || DEFAULT_NIZAR_TOKEN;
  try {
    const parts = effectiveToken.split('.');
    if (parts.length >= 2) {
      let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      let jsonStr = '';
      if (typeof atob === 'function') {
        jsonStr = atob(b64);
      } else if (typeof Buffer !== 'undefined') {
        jsonStr = Buffer.from(b64, 'base64').toString('utf8');
      }
      if (jsonStr) {
        const payload = JSON.parse(jsonStr);
        if (payload.sub && UUID_REGEX.test(payload.sub)) {
          return payload.sub;
        }
      }
    }
  } catch {
    // fallback below
  }

  // 2. Use passed userId if valid UUID
  if (userId && UUID_REGEX.test(userId.trim())) {
    return userId.trim();
  }

  return FALLBACK_USER_UUID;
}

/**
 * Configure dedicated Axios instance for Smashly AI backend
 * Timeout increased to 45s for LLM RAG inference
 */
export const smashlyAxios: AxiosInstance = axios.create({
  baseURL: SMASHLY_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Helper to extract clean error message from Axios errors
export function getErrorMessage(err: unknown, defaultMsg: string = 'Une erreur est survenue'): string {
  if (axios.isAxiosError(err)) {
    const error = err as AxiosError<any>;
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data.detail === 'string') {
        if (data.detail === 'invalid_credentials') return 'Email ou mot de passe incorrect.';
        if (data.detail === 'user_not_found') return 'Utilisateur non trouvé.';
        if (data.detail === 'user_already_exists') return 'Un compte existe déjà avec cet email.';
        if (data.detail === 'invalid_code') return 'Code de vérification invalide ou expiré.';
        return data.detail;
      }
      if (Array.isArray(data.detail) && data.detail.length > 0) {
        return data.detail[0].msg || defaultMsg;
      }
      if (typeof data.message === 'string') return data.message;
    }
    if (error.code === 'ECONNABORTED') {
      return 'Délai d’attente dépassé. Vérifiez votre connexion.';
    }
    if (!error.response) {
      return 'Impossible de joindre le serveur Smashly. Vérifiez votre connexion Internet.';
    }
  }
  if (err instanceof Error) return err.message;
  return defaultMsg;
}

// ----------------------------------------------------
// Type Definitions for Smashly API responses
// ----------------------------------------------------

export interface SmashlySubscription {
  plan: 'free' | 'pro' | 'premium' | string;
  tokens_used_today: number;
  daily_token_limit: number;
  max_search_distance: number;
}

export interface SmashlyPlayerProfile {
  id: string;
  firstName: string;
  lastName: string;
  level: number;
  smashScore: number | null;
  city: string;
  city_lat?: number | null;
  city_lng?: number | null;
  phone: string;
  clubs: string[];
  availability: any[];
  position: 'Droite' | 'Gauche' | '' | string;
  bio: string;
  gender: 'male' | 'female' | string;
  profile_picture_url: string | null;
  created_at?: string;
  updated_at?: string;
  certified_level?: number | null;
  certified_coach_name?: string | null;
}

export interface SmashlyCoachProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  hourlyRate?: number;
  experience?: string;
  specialties?: string[];
  certifications?: any[];
  rating_average?: number;
  rating_count?: number;
  bio?: string;
  phone?: string;
  city?: string;
  clubs?: string[];
  is_founder?: boolean;
}

export interface SmashlyProfileResponse {
  email: string;
  subscription?: SmashlySubscription;
  playerProfile?: SmashlyPlayerProfile | null;
  coachProfile?: SmashlyCoachProfile | null;
}

export interface SmashlyLoginResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: {
    id: string;
    email: string;
    nom?: string;
    prenom?: string;
    gender?: string;
  };
}

export interface SmashlyRegisterResponse {
  message?: string;
  dev_code?: string;
  user?: any;
  access_token?: string;
  token?: string;
}

// ----------------------------------------------------
// API Methods implemented with Axios
// ----------------------------------------------------

/**
 * 1. Login user with email & password
 */
export async function apiLogin(
  email: string,
  password: string,
  language: string = 'fr'
): Promise<{ token: string; user?: any }> {
  try {
    const res = await smashlyAxios.post<SmashlyLoginResponse>('/api/auth/login', {
      email: email.trim(),
      password,
      language,
    });
    const token = res.data.access_token || res.data.token;
    if (!token) {
      throw new Error('Jeton d’accès manquant dans la réponse du serveur.');
    }
    return { token, user: res.data.user };
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Erreur de connexion'));
  }
}

/**
 * 2. Register new user
 */
export async function apiRegister(data: {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  gender: 'male' | 'female' | string;
  club_code?: string;
  lang?: string;
}): Promise<SmashlyRegisterResponse> {
  try {
    const res = await smashlyAxios.post<SmashlyRegisterResponse>('/api/auth/register', {
      ...data,
      lang: data.lang || 'fr',
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Erreur lors de l'inscription"));
  }
}

/**
 * 3. Verify registration with 6-digit code
 */
export async function apiVerifyRegistration(
  email: string,
  code: string
): Promise<{ success: boolean; token?: string }> {
  try {
    const res = await smashlyAxios.post<any>('/auth/verify-registration', {
      email: email.trim(),
      code: code.trim(),
    });
    const token = res.data.access_token || res.data.token;
    return { success: true, token };
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Code de vérification invalide ou expiré'));
  }
}

/**
 * 4. Resend verification code
 */
export async function apiResendVerification(email: string): Promise<boolean> {
  try {
    const res = await smashlyAxios.post('/api/auth/resend-verification', {
      email: email.trim(),
    });
    return res.status >= 200 && res.status < 300;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Impossible de renvoyer le code"));
  }
}

/**
 * 5. Fetch full user profile using Bearer token
 */
export async function apiFetchProfile(token: string): Promise<SmashlyProfileResponse> {
  try {
    const res = await smashlyAxios.get<SmashlyProfileResponse>('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Impossible de charger le profil Smashly'));
  }
}

/**
 * 6. Update user profile
 */
export async function apiUpdateProfile(
  profileData: Record<string, any>,
  token: string
): Promise<SmashlyProfileResponse> {
  try {
    const res = await smashlyAxios.put<SmashlyProfileResponse>('/api/users/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, 'Impossible de mettre à jour le profil'));
  }
}

/**
 * 7. Fetch user's real open matches history
 */
export async function apiFetchMyMatchesHistory(token: string): Promise<any[]> {
  try {
    const res = await smashlyAxios.get<{ history: any[] }>('/api/open-matches/my-history', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data?.history || [];
  } catch {
    return [];
  }
}

// ----------------------------------------------------
// Public Map & Clubs API Types
// ----------------------------------------------------

export interface SmashlyPublicPlayer {
  id: string;
  name: string;
  last_name?: string;
  city: string;
  lat: number;
  lng: number;
  level: number;
  profile_picture_url?: string | null;
  clubs?: string[];
}

export interface SmashlyPublicCoach {
  id: string;
  name: string;
  last_name?: string;
  city: string;
  lat: number;
  lng: number;
  hourly_rate?: number;
  rating_average?: number;
  specialties?: string[];
  clubs?: string[];
  profile_picture_url?: string | null;
}

export interface SmashlyPublicMapResponse {
  players: SmashlyPublicPlayer[];
  coaches: SmashlyPublicCoach[];
}

export interface SmashlyPublicClub {
  id: number | string;
  name: string;
  city: string;
  address?: string;
  lat: number;
  lng: number;
  nb_courts?: number;
  website?: string | null;
  booking_url?: string | null;
  phone?: string | null;
  photo_url?: string | null;
  is_partner?: boolean;
}

/**
 * 8. Fetch real public map data (250+ players & coaches across France)
 */
export async function apiFetchPublicMap(): Promise<SmashlyPublicMapResponse> {
  try {
    const res = await smashlyAxios.get<SmashlyPublicMapResponse>('/api/public/map');
    return res.data;
  } catch (err) {
    console.warn('apiFetchPublicMap error:', err);
    return { players: [], coaches: [] };
  }
}

/**
 * 9. Fetch real public padel clubs (2,300+ clubs with locations)
 */
export async function apiFetchPublicClubs(): Promise<SmashlyPublicClub[]> {
  try {
    const res = await smashlyAxios.get<SmashlyPublicClub[]>('/api/public/clubs');
    return res.data || [];
  } catch (err) {
    console.warn('apiFetchPublicClubs error:', err);
    return [];
  }
}

// ----------------------------------------------------
// Real AI Chat Types & Method
// ----------------------------------------------------

export interface SendChatMessageParams {
  message: string;
  token?: string;
  userId?: string;
  userProfile?: {
    firstName?: string;
    lastName?: string;
    level?: number;
    city?: string;
    position?: string;
    bio?: string;
    clubs?: string[];
    availability?: any[];
  };
  chatMode?: 'matching' | 'assistant' | 'coach';
  activeProfile?: 'player' | 'coach';
  conversationId?: string | null;
  network_only?: boolean;
  current_profile?: any;
  rejected_profile_ids?: string[];
}

export interface SmashlyChatResponse {
  response: string;
  conversation_id?: string | null;
  recommended_profile?: any | null;
  recommended_type?: string;
  zone_violation?: any | null;
  network_matches?: any[] | null;
}

/**
 * 10. Send prompt to real Smashly AI Chat engine (/api/find-matches)
 * Uses extractValidUserId to ensure PostgreSQL UUID compatibility
 * and 60s timeout for RAG generation.
 */
export async function apiSendChatMessage(
  params: SendChatMessageParams
): Promise<SmashlyChatResponse> {
  try {
    const token = params.token || DEFAULT_NIZAR_TOKEN;
    const validUserId = extractValidUserId(params.userId, token);

    const payload = {
      message: params.message,
      userId: validUserId,
      userProfile: {
        firstName: params.userProfile?.firstName || 'Nizar',
        lastName: params.userProfile?.lastName || 'Beriane',
        level: params.userProfile?.level ?? 1,
        city: params.userProfile?.city || 'Marseille',
        position: params.userProfile?.position ?? '',
        bio: params.userProfile?.bio || 'Padel enthusiast for 2 years, looking for partners to improve together!',
        clubs: params.userProfile?.clubs || [],
        availability: params.userProfile?.availability || [],
      },
      chatMode: params.chatMode || 'assistant',
      activeProfile: params.activeProfile || 'player',
      conversationId: params.conversationId || null,
      network_only: params.network_only ?? false,
      current_profile: params.current_profile ?? null,
      rejected_profile_ids: params.rejected_profile_ids || [],
    };

    const res = await smashlyAxios.post<SmashlyChatResponse>(
      '/api/find-matches',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60s timeout for long LLM RAG inference
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Impossible d'obtenir une réponse de Smashly AI"));
  }
}

