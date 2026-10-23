import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  apiLogin,
  apiRegister,
  apiVerifyRegistration,
  apiResendVerification,
  apiFetchProfile,
  apiUpdateProfile,
  apiFetchMyMatchesHistory,
  DEFAULT_NIZAR_TOKEN,
  extractValidUserId,
  SmashlyProfileResponse,
  SmashlySubscription,
  SmashlyPlayerProfile,
  SmashlyCoachProfile,
} from '../../api/smashlyClient';

export interface CurrentUser {
  user_id: string;
  first_name: string;
  last_name: string;
  level: number;
  email: string;
  city: string;
  phone: string;
  bio: string;
  gender: 'male' | 'female';
  position: string;
  favouriteClubs: string;
  profile_picture_url?: string | null;
  smashScore?: number | null;
  certified_level?: number | null;
}

export const JULIEN_TEST_USER: CurrentUser = {
  user_id: 'user_julien',
  first_name: 'Julien',
  last_name: 'Dubois',
  level: 7,
  email: 'julien@smashly.app',
  city: 'Aix-en-Provence',
  phone: '+33612345678',
  bio: 'Joueur de padel passionné (Niveau 7). Recherche des parties dynamiques et engagées.',
  gender: 'male',
  position: 'Gauche',
  favouriteClubs: 'Padel Collection, Set Club',
  profile_picture_url: null,
};

export interface AuthState {
  token: string | null;
  currentUser: CurrentUser;
  subscription: SmashlySubscription | null;
  playerProfile: SmashlyPlayerProfile | null;
  coachProfile: SmashlyCoachProfile | null;
  activeProfileType: 'player' | 'coach';
  isLiveConnected: boolean;
  isAuthenticated: boolean;
  myMatchesHistory: any[];
  loading: boolean;
  error: string | null;
  statusMessage: string | null;
}

const initialState: AuthState = {
  token: null,
  currentUser: JULIEN_TEST_USER,
  subscription: null,
  playerProfile: null,
  coachProfile: null,
  activeProfileType: 'player',
  isLiveConnected: false,
  isAuthenticated: false,
  myMatchesHistory: [],
  loading: false,
  error: null,
  statusMessage: null,
};

// Helper to convert Smashly response to CurrentUser
function mapProfileToCurrentUser(data: SmashlyProfileResponse, token?: string | null): CurrentUser {
  const userAccountId = extractValidUserId(null, token);
  const p = data.playerProfile;
  if (!p) {
    const c = data.coachProfile;
    return {
      user_id: userAccountId,
      first_name: c?.firstName || 'Coach',
      last_name: c?.lastName || '',
      level: 7,
      email: data.email,
      city: c?.city || 'Marseille',
      phone: c?.phone || '',
      bio: c?.bio || 'Coach certifié Smashly',
      gender: 'male',
      position: 'Gauche',
      favouriteClubs: c?.clubs && c.clubs.length > 0 ? c.clubs.join(', ') : '',
      profile_picture_url: null,
    };
  }

  return {
    user_id: userAccountId,
    first_name: p.firstName,
    last_name: p.lastName,
    level: p.level || 1,
    email: data.email,
    city: p.city || 'Marseille',
    phone: p.phone || '',
    bio: p.bio || 'Padel enthusiast for 2 years, looking for partners to improve together!',
    gender: p.gender === 'female' ? 'female' : 'male',
    position: p.position || '',
    favouriteClubs: p.clubs && p.clubs.length > 0 ? p.clubs.join(', ') : '',
    profile_picture_url: p.profile_picture_url,
    smashScore: p.smashScore,
    certified_level: p.certified_level,
  };
}

// ----------------------------------------------------
// Async Thunks
// ----------------------------------------------------

/**
 * Login with real credentials via Axios
 */
export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (
    payload: { email: string; password: string; language?: string },
    { rejectWithValue }
  ) => {
    try {
      const { token } = await apiLogin(payload.email, payload.password, payload.language);
      const profileData = await apiFetchProfile(token);
      const history = await apiFetchMyMatchesHistory(token);
      return { token, profileData, history };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erreur de connexion');
    }
  }
);

/**
 * Load verified Nizar profile using the user's live Bearer token
 */
export const loadNizarPresetThunk = createAsyncThunk(
  'auth/loadNizarPreset',
  async (_, { rejectWithValue }) => {
    try {
      const token = DEFAULT_NIZAR_TOKEN;
      const profileData = await apiFetchProfile(token);
      const history = await apiFetchMyMatchesHistory(token);
      return { token, profileData, history };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erreur lors du chargement du compte Smashly');
    }
  }
);

/**
 * Register a new user
 */
export const registerUserThunk = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: {
      email: string;
      password: string;
      nom: string;
      prenom: string;
      gender: 'male' | 'female' | string;
      club_code?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiRegister(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || "Erreur lors de l'inscription");
    }
  }
);

/**
 * Verify 6-digit registration code
 */
export const verifyCodeThunk = createAsyncThunk(
  'auth/verifyCode',
  async (payload: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const res = await apiVerifyRegistration(payload.email, payload.code);
      if (res.token) {
        const profileData = await apiFetchProfile(res.token);
        const history = await apiFetchMyMatchesHistory(res.token);
        return { token: res.token, profileData, history };
      }
      return { token: null, profileData: null, history: [] };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Code invalide ou expiré');
    }
  }
);

/**
 * Resend verification code
 */
export const resendCodeThunk = createAsyncThunk(
  'auth/resendCode',
  async (email: string, { rejectWithValue }) => {
    try {
      await apiResendVerification(email);
      return 'Code renvoyé avec succès !';
    } catch (err: any) {
      return rejectWithValue(err.message || 'Impossible de renvoyer le code');
    }
  }
);

/**
 * Update user profile
 */
export const updateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (
    profileData: Record<string, any>,
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { auth: AuthState };
      const token = state.auth.token;
      if (!token) {
        return { localOnly: true, profileData };
      }
      const updated = await apiUpdateProfile(profileData, token);
      return { localOnly: false, profileData: updated };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Erreur de mise à jour');
    }
  }
);

// ----------------------------------------------------
// Auth Slice
// ----------------------------------------------------

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    switchToJulienSpec: (state) => {
      state.token = null;
      state.currentUser = JULIEN_TEST_USER;
      state.subscription = null;
      state.playerProfile = null;
      state.coachProfile = null;
      state.activeProfileType = 'player';
      state.isLiveConnected = false;
      state.isAuthenticated = true;
      state.myMatchesHistory = [];
      state.error = null;
      state.statusMessage = 'Mode Sujet Test (Julien Niv. 7) activé';
    },
    setActiveProfileType: (state, action: PayloadAction<'player' | 'coach'>) => {
      state.activeProfileType = action.payload;
    },
    clearAuthStatus: (state) => {
      state.error = null;
      state.statusMessage = null;
    },
    logoutUser: (state) => {
      state.token = null;
      state.currentUser = JULIEN_TEST_USER;
      state.subscription = null;
      state.playerProfile = null;
      state.coachProfile = null;
      state.activeProfileType = 'player';
      state.isLiveConnected = false;
      state.isAuthenticated = false;
      state.myMatchesHistory = [];
      state.error = null;
      state.statusMessage = 'Déconnecté avec succès';
    },
    updateLocalCurrentUser: (state, action: PayloadAction<Partial<CurrentUser>>) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // 1. loginUserThunk
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.statusMessage = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isLiveConnected = true;
        state.isAuthenticated = true;
        state.subscription = action.payload.profileData.subscription || null;
        state.playerProfile = action.payload.profileData.playerProfile || null;
        state.coachProfile = action.payload.profileData.coachProfile || null;
        state.myMatchesHistory = action.payload.history;
        state.currentUser = mapProfileToCurrentUser(action.payload.profileData, action.payload.token);
        state.statusMessage = 'Connexion réussie via Smashly AI !';
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Échec de connexion';
      });

    // 2. loadNizarPresetThunk
    builder
      .addCase(loadNizarPresetThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.statusMessage = null;
      })
      .addCase(loadNizarPresetThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isLiveConnected = true;
        state.isAuthenticated = true;
        state.subscription = action.payload.profileData.subscription || null;
        state.playerProfile = action.payload.profileData.playerProfile || null;
        state.coachProfile = action.payload.profileData.coachProfile || null;
        state.myMatchesHistory = action.payload.history;
        state.currentUser = mapProfileToCurrentUser(action.payload.profileData, action.payload.token);
        state.statusMessage = 'Compte réel Nizar Beriane connecté avec succès !';
      })
      .addCase(loadNizarPresetThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Échec du chargement du compte';
      });

    // 3. registerUserThunk
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.statusMessage = 'Inscription enregistrée ! Entrez votre code à 6 chiffres.';
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Échec de l'inscription";
      });

    // 4. verifyCodeThunk
    builder
      .addCase(verifyCodeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCodeThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.token && action.payload.profileData) {
          state.token = action.payload.token;
          state.isLiveConnected = true;
          state.isAuthenticated = true;
          state.subscription = action.payload.profileData.subscription || null;
          state.playerProfile = action.payload.profileData.playerProfile || null;
          state.coachProfile = action.payload.profileData.coachProfile || null;
          state.myMatchesHistory = action.payload.history;
          state.currentUser = mapProfileToCurrentUser(action.payload.profileData, action.payload.token);
        }
        state.statusMessage = 'Email vérifié avec succès ! Bienvenue sur Smashly.';
      })
      .addCase(verifyCodeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Code de vérification invalide';
      });

    // 5. updateProfileThunk
    builder
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (!action.payload.localOnly && action.payload.profileData) {
          const res = action.payload.profileData as SmashlyProfileResponse;
          if (res.playerProfile) state.playerProfile = res.playerProfile;
          if (res.coachProfile) state.coachProfile = res.coachProfile;
          state.currentUser = mapProfileToCurrentUser(res);
        }
        state.statusMessage = 'Profil mis à jour avec succès';
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Erreur lors de la sauvegarde';
      });
  },
});

export const {
  switchToJulienSpec,
  setActiveProfileType,
  clearAuthStatus,
  logoutUser,
  updateLocalCurrentUser,
} = authSlice.actions;

export default authSlice.reducer;
