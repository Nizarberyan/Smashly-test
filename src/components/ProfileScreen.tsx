import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeable } from './SwipeableTabScreen';
import {
  Bell,
  Home,
  Clock,
  GraduationCap,
  Share2,
  Settings,
  Plus,
  Target,
  MapPin,
  Pencil,
  CalendarDays,
  LogIn,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Camera,
} from 'lucide-react-native';

import { WhatsAppIcon } from './WhatsAppIcon';
import { SmashlyCardModal } from './SmashlyCardModal';
import { SettingsModal, SettingsTab } from './SettingsModal';
import { AuthModal } from './AuthModal';
import { useMatches } from '../context/MatchesContext';
import { formatMatchDateTime } from '../services/matchRules';

interface ProfileScreenProps {
  onGoHome?: () => void;
  onOpenMatches?: () => void;
  onBookCoach?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (value: boolean) => void;
  onOpenAuth?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onGoHome,
  onOpenMatches,
  onBookCoach,
  isDarkMode = true,
  onToggleDarkMode,
  onOpenAuth,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();
  const {
    currentUser,
    subscription,
    coachProfile,
    updateCurrentUser,
    logout,
    matches,
    isLiveApiConnected,
    isAuthenticated,
    loadJulienProfile,
    loadNizarProfile,
    loading,
  } = useMatches();

  // Modals state
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('general');

  const openAuth = () => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      setShowAuthModal(true);
    }
  };

  // Dynamic user data
  const firstName = currentUser.first_name || (isLiveApiConnected ? 'Nizar' : 'Julien');
  const lastName = currentUser.last_name || (isLiveApiConnected ? 'Beriane' : 'Dubois');
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = ((firstName[0] || 'N') + (lastName[0] || 'B')).toUpperCase();
  const level = currentUser.level ?? (isLiveApiConnected ? 1 : 7);
  const isJulien = firstName.toLowerCase() === 'julien';
  const bio =
    currentUser.bio && currentUser.bio.trim() !== ''
      ? currentUser.bio
      : isLiveApiConnected
      ? 'Padel enthusiast for 2 years, looking for partners to improve together!'
      : 'Joueur de padel passionné (Niveau 7).';
  const whatsapp = currentUser.phone || '+448475136528';
  const city = currentUser.city || 'Marseille';
  const position =
    currentUser.position && currentUser.position.trim() !== '' && currentUser.position !== 'Non spécifié'
      ? currentUser.position
      : '';
  const favouriteClubs =
    currentUser.favouriteClubs &&
    currentUser.favouriteClubs.trim() !== '' &&
    currentUser.favouriteClubs !== 'Aucun club configuré'
      ? currentUser.favouriteClubs
      : '';
  const progressPercent = Math.min(100, Math.round((level / 8) * 100));

  // Find matches where user is enrolled
  const myMatches = matches.filter((m) =>
    m.players.some(
      (p) =>
        p.user_id === currentUser.user_id ||
        p.first_name.toLowerCase() === firstName.toLowerCase()
    )
  );

  const handleOpenSettings = (tab: SettingsTab = 'general') => {
    setSettingsInitialTab(tab);
    setShowSettingsModal(true);
  };

  const handleBecomeCoach = () => {
    Alert.alert(
      'Devenir Coach',
      'Rejoignez le réseau des coachs certifiés Smashly pour proposer des cours et développer votre communauté padel !',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Postuler', onPress: () => Alert.alert('Merci !', 'Votre candidature a été transmise.') },
      ]
    );
  };

  const handleLogOut = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter de votre compte ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          logout();
          openAuth();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background: Deep Dark Night Navy in Dark Mode, Crisp Slate in Light Mode */}
      <LinearGradient
        colors={
          isDarkMode
            ? ['#020617', '#0a0f1d', '#0f172a', '#1e293b']
            : ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1']
        }
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Bar (Swipeable down) */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: 6,
          },
        ]}
        {...panHandlers}
      >
        {/* Left: Smashly app logo */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.logoContainer}
          onPress={onGoHome}
        >
          <Image
            source={require('../../images/pwa-icon-192.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right: Pill with Bell and Home buttons */}
        <View style={[styles.topActionsPill, isDarkMode && styles.topActionsPillDark]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.topPillBtn}
            onPress={() => handleOpenSettings('notifications')}
          >
            <Bell size={20} color={isDarkMode ? '#ffffff' : '#0f172a'} strokeWidth={2} />
          </TouchableOpacity>

          <View style={[styles.topPillDivider, isDarkMode && styles.topPillDividerDark]} />

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.topPillBtn}
            onPress={onGoHome}
          >
            <Home size={20} color={isDarkMode ? '#ffffff' : '#0f172a'} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 95 },
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* TOP ACTION BUTTONS ROW */}
        <View style={styles.topActionRail}>
          {/* 1. Clock / Matches */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.railBtn, isDarkMode ? styles.railBtnDarkBlue : styles.railBtnBlue]}
            onPress={onOpenMatches}
          >
            <Clock size={20} color="#ffffff" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* 2. Coach / Graduation Cap */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.railBtn, isDarkMode ? styles.railBtnDarkBlue : styles.railBtnBlue]}
            onPress={onBookCoach}
          >
            <GraduationCap size={22} color="#facc15" strokeWidth={2.2} />
          </TouchableOpacity>

          {/* 3. Share Smashly Card */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.railBtn, isDarkMode ? styles.railBtnDarkWhite : styles.railBtnWhite]}
            onPress={() => setShowCardModal(true)}
          >
            <Share2
              size={20}
              color={isDarkMode ? '#38bdf8' : '#2563eb'}
              strokeWidth={2.2}
              style={{ transform: [{ translateX: -1.5 }] }}
            />
          </TouchableOpacity>

          {/* 4. Settings / Gear */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.railBtn, isDarkMode ? styles.railBtnDarkWhite : styles.railBtnWhite]}
            onPress={() => handleOpenSettings('general')}
          >
            <Settings size={20} color={isDarkMode ? '#f8fafc' : '#0f172a'} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Persona Quick Switcher: Julien Test Spec vs Live Smashly Account */}
        <View style={styles.personaSwitchRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.personaTabBtn,
              !isLiveApiConnected ? styles.personaTabBtnActiveJulien : styles.personaTabBtnInactive,
            ]}
            onPress={loadJulienProfile}
          >
            <Zap size={14} color={!isLiveApiConnected ? '#ffffff' : '#94a3b8'} style={{ marginRight: 5 }} />
            <Text
              style={[
                styles.personaTabText,
                !isLiveApiConnected ? styles.personaTabTextActive : styles.personaTabTextInactive,
              ]}
            >
              ⚡ Julien (Test Niv. 7)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.personaTabBtn,
              isLiveApiConnected ? styles.personaTabBtnActiveNizar : styles.personaTabBtnInactive,
            ]}
            onPress={loadNizarProfile}
          >
            <ShieldCheck size={14} color={isLiveApiConnected ? '#ffffff' : '#94a3b8'} style={{ marginRight: 5 }} />
            <Text
              style={[
                styles.personaTabText,
                isLiveApiConnected ? styles.personaTabTextActive : styles.personaTabTextInactive,
              ]}
            >
              🎾 Smashly (Nizar)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Profile Card with Neon Glowing Gradient Rim */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#c084fc', '#38bdf8', '#818cf8', '#f472b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradientBorder}
          >
            <View style={[styles.cardInner, isDarkMode && styles.cardInnerDark]}>
              {/* Account Mode Pill: Test Spec vs Live Smashly Account */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.apiModeBanner,
                  isLiveApiConnected ? styles.bannerLive : styles.bannerTest,
                ]}
                onPress={openAuth}
              >
                <View
                  style={[
                    styles.apiModeDot,
                    isLiveApiConnected ? styles.dotGreen : styles.dotYellow,
                  ]}
                />
                <Text
                  style={[
                    styles.apiModeText,
                    isLiveApiConnected ? styles.textLive : styles.textTest,
                  ]}
                >
                  {isLiveApiConnected
                    ? `Compte Réel API (${fullName})`
                    : 'Profil Sujet Test (Julien Niv. 7)'}
                </Text>
                <Text style={styles.apiModeSwitch}>Changer ▾</Text>
              </TouchableOpacity>

              {/* Header Row: Avatar + Name + Level info */}
              <View style={styles.profileHeaderRow}>
                {/* Dynamic Avatar with Camera Edit Badge */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.avatarContainer}
                  onPress={() => handleOpenSettings('general')}
                >
                  <View
                    style={[
                      styles.avatarBox,
                      isJulien && { borderColor: '#facc15', borderWidth: 2 },
                    ]}
                  >
                    {currentUser.profile_picture_url ? (
                      <Image
                        source={{ uri: currentUser.profile_picture_url }}
                        style={styles.avatarImg}
                      />
                    ) : isJulien ? (
                      <Image
                        source={require('../../images/avatar-julien.png')}
                        style={styles.avatarImg}
                      />
                    ) : (
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    )}
                  </View>
                  <View style={styles.avatarPlusBadge}>
                    <Camera size={12} color="#ffffff" strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>

                {/* Name and Level Progress */}
                <View style={styles.profileNameCol}>
                  <Text
                    style={[styles.profileName, isDarkMode && styles.textWhite]}
                    numberOfLines={1}
                  >
                    {fullName}
                  </Text>

                  <View style={styles.levelProgressRow}>
                    <View style={styles.levelPill}>
                      <Text style={styles.levelPillText}>Level {level}</Text>
                    </View>

                    <View style={[styles.progressPill, isDarkMode && styles.progressPillDark]}>
                      <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                      </View>
                      <Text style={[styles.progressText, isDarkMode && styles.textSlate400]}>
                        {level >= 8 ? 'Niveau Max' : `${progressPercent}% → N${level + 1}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* IA Subscription Banner (from real Smashly AI backend) */}
              {subscription && (
                <View style={[styles.subBanner, isDarkMode && styles.subBannerDark]}>
                  <View style={styles.subBannerIcon}>
                    <Zap size={13} color="#38bdf8" strokeWidth={2.5} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.subBannerTitle, isDarkMode && styles.textWhite]}>
                      Smashly IA • Plan {subscription.plan.toUpperCase()}
                    </Text>
                    <Text style={[styles.subBannerSubtitle, isDarkMode && styles.textSlate400]}>
                      {subscription.tokens_used_today.toLocaleString()} / {subscription.daily_token_limit.toLocaleString()} tokens/j • Rayon {subscription.max_search_distance} km
                    </Text>
                  </View>
                </View>
              )}

              {/* Bio text */}
              <Text style={[styles.bioText, isDarkMode && styles.bioTextDark]}>
                {bio}
              </Text>

              {/* 2-column info cards: Whatsapp & City */}
              <View style={styles.infoRow2Col}>
                {/* Whatsapp */}
                <View style={[styles.whatsappCard, isDarkMode && styles.infoCardDark]}>
                  <View style={styles.badgeLabelRow}>
                    <WhatsAppIcon size={16} color="#22c55e" />
                    <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>Whatsapp</Text>
                  </View>
                  <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]} numberOfLines={1}>
                    {whatsapp}
                  </Text>
                </View>

                {/* City */}
                <View style={[styles.cityCard, isDarkMode && styles.infoCardDark]}>
                  <View style={styles.badgeLabelRow}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>City</Text>
                  </View>
                  <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]} numberOfLines={1}>
                    {city}
                  </Text>
                </View>
              </View>

              {/* Full-width card: Position */}
              <View style={[styles.positionCard, isDarkMode && styles.infoCardDark]}>
                <View style={styles.badgeLabelRow}>
                  <Target size={17} color="#f97316" strokeWidth={2.4} />
                  <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>Position</Text>
                </View>
                {position ? (
                  <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]}>
                    {position}
                  </Text>
                ) : (
                  <View style={styles.inlineChoiceRow}>
                    <Text style={[styles.emptyLabelText, isDarkMode && styles.textSlate400]}>
                      Non renseignée
                    </Text>
                    <View style={styles.inlinePillsGroup}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.choicePill}
                        onPress={() => updateCurrentUser({ position: 'Gauche' })}
                      >
                        <Text style={styles.choicePillText}>+ Gauche</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.choicePill}
                        onPress={() => updateCurrentUser({ position: 'Droite' })}
                      >
                        <Text style={styles.choicePillText}>+ Droite</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Full-width card: Favourite Clubs */}
              <View style={[styles.clubsCard, isDarkMode && styles.infoCardDark]}>
                <View style={styles.badgeLabelRow}>
                  <MapPin size={17} color="#a855f7" strokeWidth={2.4} />
                  <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>Favourite Clubs</Text>
                </View>
                {favouriteClubs ? (
                  <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]}>
                    {favouriteClubs}
                  </Text>
                ) : (
                  <View style={styles.inlineChoiceRow}>
                    <Text style={[styles.emptyLabelText, isDarkMode && styles.textSlate400]}>
                      Aucun club renseigné
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.choicePill}
                      onPress={() => updateCurrentUser({ favouriteClubs: 'Padel Collection, Set Club' })}
                    >
                      <Text style={styles.choicePillText}>+ Ajouter Padel Collection</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Edit Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.editBtn}
                onPress={() => handleOpenSettings('general')}
              >
                <Pencil size={16} color="#ffffff" strokeWidth={2.5} style={{ marginRight: 6 }} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Links below Profile Card */}
        <View style={styles.linksRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleBecomeCoach}>
            <Text style={[styles.linkText, isDarkMode ? styles.linkTextDark : styles.linkTextCoach]}>
              Become a Coach
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={openAuth}>
            <Text style={[styles.linkText, isDarkMode ? styles.linkTextDark : styles.linkTextLogin]}>
              Connexion / Compte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={handleLogOut}>
            <Text style={[styles.linkText, isDarkMode ? styles.linkTextDark : styles.linkTextLogout]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section: MY MATCHES (Dynamic) */}
        <View style={styles.myMatchesSection}>
          <View style={styles.matchesHeaderRow}>
            <CalendarDays
              size={18}
              color={isDarkMode ? '#38bdf8' : '#2563eb'}
              strokeWidth={2.2}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.matchesTitle, isDarkMode ? styles.textSlate300 : styles.matchesTitleLight]}>
              MY MATCHES ({myMatches.length})
            </Text>
          </View>

          {myMatches.length === 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.noMatchesCard, isDarkMode && styles.noMatchesCardDark]}
              onPress={onOpenMatches}
            >
              <Text style={[styles.noMatchesText, isDarkMode && styles.textSlate400]}>
                Aucune partie rejointe pour le moment
              </Text>
              <Text style={styles.findMatchCtaText}>Rejoindre une partie ouverte →</Text>
            </TouchableOpacity>
          ) : (
            myMatches.map((m) => {
              const { fullBadge } = formatMatchDateTime(m.match_datetime);
              return (
                <TouchableOpacity
                  key={m.id}
                  activeOpacity={0.85}
                  style={[styles.joinedMatchCard, isDarkMode && styles.joinedMatchCardDark]}
                  onPress={onOpenMatches}
                >
                  <View style={styles.joinedMatchHeader}>
                    <Text style={[styles.joinedMatchClub, isDarkMode && styles.textWhite]}>
                      {m.club.name} · {m.club.city}
                    </Text>
                    <View style={styles.enrolledBadge}>
                      <CheckCircle2 size={13} color="#10b981" style={{ marginRight: 4 }} />
                      <Text style={styles.enrolledBadgeText}>Inscrit</Text>
                    </View>
                  </View>
                  <Text style={styles.joinedMatchDate}>{fullBadge}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal: My Smashly Card */}
      {showCardModal && (
        <SmashlyCardModal
          visible={showCardModal}
          onClose={() => setShowCardModal(false)}
          userName={fullName}
          userCity={city}
          userLevel={level.toString()}
        />
      )}

      {/* Modal: Settings */}
      {showSettingsModal && (
        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          initialTab={settingsInitialTab}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          onProfileUpdated={(updated) => {
            updateCurrentUser({
              first_name: updated.firstName,
              last_name: updated.lastName,
              phone: updated.phone ? `+33${updated.phone}` : whatsapp,
            });
          }}
        />
      )}

      {/* Modal: Smashly AI Auth (Fallback if onOpenAuth not provided) */}
      {!onOpenAuth && showAuthModal && (
        <AuthModal
          visible={showAuthModal}
          canDismiss={isAuthenticated}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  logoContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  topActionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topActionsPillDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderColor: 'rgba(100, 116, 139, 0.4)',
  },
  topPillBtn: {
    padding: 6,
  },
  topPillDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 4,
  },
  topPillDividerDark: {
    backgroundColor: 'rgba(100, 116, 139, 0.4)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardWrapper: {
    width: '100%',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradientBorder: {
    borderRadius: 22,
    padding: 2,
  },
  cardInner: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    padding: 18,
  },
  cardInnerDark: {
    backgroundColor: '#0f172a',
  },
  apiModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
  },
  bannerLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  bannerTest: {
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: 'rgba(250, 204, 21, 0.35)',
  },
  apiModeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: '#10b981',
  },
  dotYellow: {
    backgroundColor: '#facc15',
  },
  apiModeText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  textLive: {
    color: '#34d399',
  },
  textTest: {
    color: '#facc15',
  },
  apiModeSwitch: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  profileNameCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  levelProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  levelPill: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelPillText: {
    color: '#2563eb',
    fontSize: 11.5,
    fontWeight: '700',
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  progressPillDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  progressBarTrack: {
    width: 38,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 14,
  },
  bioTextDark: {
    color: '#94a3b8',
  },
  infoRow2Col: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  whatsappCard: {
    flex: 1,
    marginRight: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 10,
  },
  cityCard: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    padding: 10,
  },
  infoCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  badgeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginLeft: 6,
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  positionCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
  },
  clubsCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3e8ff',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
  },
  editBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  editBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  topActionRail: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  railBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  railBtnBlue: {
    backgroundColor: '#2563eb',
  },
  railBtnDarkBlue: {
    backgroundColor: '#1e3a8a',
  },
  railBtnWhite: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  railBtnDarkWhite: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 18,
    paddingHorizontal: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkTextCoach: {
    color: '#f59e0b',
  },
  linkTextLogin: {
    color: '#38bdf8',
  },
  linkTextLogout: {
    color: '#ef4444',
  },
  linkTextDark: {
    color: '#94a3b8',
  },
  myMatchesSection: {
    marginTop: 8,
  },
  matchesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchesTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  matchesTitleLight: {
    color: '#475569',
  },
  noMatchesCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMatchesCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  noMatchesText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  findMatchCtaText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  joinedMatchCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  joinedMatchCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
  joinedMatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  joinedMatchClub: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  enrolledBadgeText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  joinedMatchDate: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  textWhite: {
    color: '#ffffff',
  },
  textSlate300: {
    color: '#cbd5e1',
  },
  textSlate400: {
    color: '#94a3b8',
  },
  personaSwitchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  personaTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  personaTabBtnActiveJulien: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  personaTabBtnActiveNizar: {
    backgroundColor: '#10b981',
    borderColor: '#34d399',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  personaTabBtnInactive: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderColor: 'rgba(71, 85, 105, 0.4)',
  },
  personaTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  personaTabTextActive: {
    color: '#ffffff',
  },
  personaTabTextInactive: {
    color: '#94a3b8',
  },
  subBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
  },
  subBannerDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  subBannerIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  subBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
  },
  subBannerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  inlineChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  emptyLabelText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  inlinePillsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  choicePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  choicePillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
});
