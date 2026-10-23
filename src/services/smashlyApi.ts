const BASE_URL = 'https://smashlyai.com';

export const DEFAULT_AUTH_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MzE0NTdmNy1lZmE2LTQ5OGEtOTQ3Ni0wYTY0MjAyMjhmMzQiLCJleHAiOjE3OTUyNzMzMTB9.BnA6fJt5zkhW9-texq465pCnvoLmTH0SQoSSepSBrXc';

export interface SmashlyUserProfileResponse {
  email: string;
  subscription?: {
    plan: string;
    tokens_used_today: number;
    daily_token_limit: number;
    max_search_distance: number;
  };
  playerProfile?: {
    id: string;
    firstName: string;
    lastName: string;
    level: number;
    smashScore?: number | null;
    city: string;
    city_lat?: number;
    city_lng?: number;
    phone: string;
    clubs?: any[];
    position?: string;
    bio?: string;
    gender?: string;
    profile_picture_url?: string | null;
  };
  coachProfile?: any;
}

/**
 * Fetch user profile from smashlyai.com backend using JWT token
 */
export async function fetchSmashlyProfile(
  token: string = DEFAULT_AUTH_TOKEN
): Promise<SmashlyUserProfileResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.warn('fetchSmashlyProfile response not OK:', res.status);
      return null;
    }

    const data: SmashlyUserProfileResponse = await res.json();
    return data;
  } catch (err) {
    console.warn('fetchSmashlyProfile error:', err);
    return null;
  }
}

/**
 * Update user profile on smashlyai.com backend
 */
export async function updateSmashlyProfile(
  profileData: Record<string, any>,
  token: string = DEFAULT_AUTH_TOKEN
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    return res.ok;
  } catch (err) {
    console.warn('updateSmashlyProfile error:', err);
    return false;
  }
}

/**
 * Authenticate against smashlyai.com /api/auth/login
 */
export async function loginToSmashly(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string; devCode?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        language: 'fr',
      }),
    });

    const data = await res.json();
    if (res.ok) {
      const token = data.access_token || data.token;
      return { success: true, token, user: data.user };
    }

    return {
      success: false,
      error: typeof data.detail === 'string' ? data.detail : data.message || 'Email ou mot de passe incorrect',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Impossible de joindre le serveur Smashly' };
  }
}

/**
 * Register on smashlyai.com /api/auth/register
 */
export async function registerToSmashly(data: {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  gender: string;
  club_code?: string;
}): Promise<{ success: boolean; token?: string; user?: any; error?: string; devCode?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        lang: 'fr',
      }),
    });

    const resJson = await res.json();
    if (res.ok) {
      return {
        success: true,
        user: resJson.user,
        token: resJson.access_token || resJson.token,
        devCode: resJson.dev_code,
      };
    }

    return {
      success: false,
      error:
        typeof resJson.detail === 'string'
          ? resJson.detail
          : resJson.message || "Erreur lors de l'inscription",
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Impossible de joindre le serveur Smashly' };
  }
}

/**
 * Verify 6-digit email code against smashlyai.com /auth/verify-registration
 */
export async function verifySmashlyRegistration(
  email: string,
  code: string
): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/verify-registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return {
        success: true,
        token: data.access_token || data.token,
        user: data.user,
      };
    }

    return {
      success: false,
      error: typeof data.detail === 'string' ? data.detail : 'Code de vérification invalide',
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur lors de la vérification' };
  }
}

/**
 * Resend email verification code
 */
export async function resendSmashlyCode(
  email: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, message: 'Nouveau code envoyé par email !' };
    }
    return { success: false, message: data.detail || "Erreur lors de l'envoi du code" };
  } catch (err: any) {
    return { success: false, message: err.message || 'Impossible de joindre le serveur' };
  }
}

/**
 * Forgot password request
 */
export async function forgotPasswordSmashly(
  email: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        lang: 'fr',
      }),
    });

    const data = await res.json();
    if (res.ok) {
      return { success: true, message: 'Email de réinitialisation envoyé !' };
    }
    return { success: false, message: data.detail || 'Email non trouvé' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Impossible de joindre le serveur' };
  }
}
