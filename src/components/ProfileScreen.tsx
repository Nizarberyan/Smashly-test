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
} from 'lucide-react-native';

import { WhatsAppIcon } from './WhatsAppIcon';
import { SmashlyCardModal } from './SmashlyCardModal';
import { SettingsModal, SettingsTab } from './SettingsModal';

interface ProfileScreenProps {
  onGoHome?: () => void;
  onOpenMatches?: () => void;
  onBookCoach?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (value: boolean) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onGoHome,
  onOpenMatches,
  onBookCoach,
  isDarkMode = true,
  onToggleDarkMode,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();

  // Modals state
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTab>('general');

  // Profile data
  const [profile, setProfile] = useState({
    firstName: 'Nizar',
    lastName: 'Beriane',
    bio: 'Padel enthusiast for 2 years, looking for partners to improve together!',
    whatsapp: '+448475136...',
    city: 'Marseille',
    position: 'Not specified',
    favouriteClubs: 'No clubs provided',
    level: 1,
    progress: '0% → N2',
  });

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
      { text: 'Se déconnecter', style: 'destructive', onPress: onGoHome },
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
        {/* TOP ACTION BUTTONS ROW (Horizontal bar at top above profile card) */}
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

        {/* Main Profile Card with Neon Glowing Gradient Rim (FULL COMFORTABLE WIDTH) */}
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#c084fc', '#38bdf8', '#818cf8', '#f472b6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradientBorder}
          >
            <View style={[styles.cardInner, isDarkMode && styles.cardInnerDark]}>
              {/* Header Row: NB Avatar + Name + Level info */}
              <View style={styles.profileHeaderRow}>
                {/* Avatar NB with + Badge */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarInitials}>
                      {((profile.firstName?.[0] || 'N') + (profile.lastName?.[0] || 'B')).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.avatarPlusBadge}>
                    <Plus size={12} color="#ffffff" strokeWidth={3} />
                  </View>
                </View>

                {/* Name and Level Progress */}
                <View style={styles.profileNameCol}>
                  <Text
                    style={[styles.profileName, isDarkMode && styles.textWhite]}
                    numberOfLines={1}
                  >
                    {profile.firstName} {profile.lastName}
                  </Text>

                  <View style={styles.levelProgressRow}>
                    <View style={styles.levelPill}>
                      <Text style={styles.levelPillText}>Level {profile.level}</Text>
                    </View>

                    <View style={[styles.progressPill, isDarkMode && styles.progressPillDark]}>
                      <View style={styles.progressBarTrack}>
                        <View style={styles.progressBarFill} />
                      </View>
                      <Text style={[styles.progressText, isDarkMode && styles.textSlate400]}>
                        {profile.progress}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bio text */}
              <Text style={[styles.bioText, isDarkMode && styles.bioTextDark]}>
                {profile.bio}
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
                    {profile.whatsapp}
                  </Text>
                </View>

                {/* City */}
                <View style={[styles.cityCard, isDarkMode && styles.infoCardDark]}>
                  <View style={styles.badgeLabelRow}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>City</Text>
                  </View>
                  <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]} numberOfLines={1}>
                    {profile.city}
                  </Text>
                </View>
              </View>

              {/* Full-width card: Position */}
              <View style={[styles.positionCard, isDarkMode && styles.infoCardDark]}>
                <View style={styles.badgeLabelRow}>
                  <Target size={17} color="#f97316" strokeWidth={2.4} />
                  <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>Position</Text>
                </View>
                <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]}>
                  {profile.position}
                </Text>
              </View>

              {/* Full-width card: Favourite Clubs */}
              <View style={[styles.clubsCard, isDarkMode && styles.infoCardDark]}>
                <View style={styles.badgeLabelRow}>
                  <MapPin size={17} color="#a855f7" strokeWidth={2.4} />
                  <Text style={[styles.badgeLabel, isDarkMode && styles.textWhite]}>Favourite Clubs</Text>
                </View>
                <Text style={[styles.badgeValue, isDarkMode && styles.textSlate300]}>
                  {profile.favouriteClubs}
                </Text>
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
          <TouchableOpacity activeOpacity={0.7} onPress={handleLogOut}>
            <Text style={[styles.linkText, isDarkMode ? styles.linkTextDark : styles.linkTextLogout]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section: MY MATCHES */}
        <View style={styles.myMatchesSection}>
          <View style={styles.matchesHeaderRow}>
            <CalendarDays size={18} color={isDarkMode ? '#38bdf8' : '#2563eb'} strokeWidth={2.2} style={{ marginRight: 8 }} />
            <Text style={[styles.matchesTitle, isDarkMode ? styles.textSlate300 : styles.matchesTitleLight]}>
              MY MATCHES
            </Text>
          </View>

          <View style={[styles.noMatchesCard, isDarkMode && styles.noMatchesCardDark]}>
            <Text style={[styles.noMatchesText, isDarkMode && styles.textSlate400]}>
              No matches played yet
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal: My Smashly Card (Screenshot 2) */}
      {showCardModal && (
        <SmashlyCardModal
          visible={showCardModal}
          onClose={() => setShowCardModal(false)}
          userName={`${profile.firstName} ${profile.lastName}`}
          userCity={profile.city}
          userLevel={profile.level.toString()}
        />
      )}

      {/* Modal: Settings (Screenshots 3, 4, 5) with Dark Mode Toggle */}
      {showSettingsModal && (
        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          initialTab={settingsInitialTab}
          isDarkMode={isDarkMode}
          onToggleDarkMode={onToggleDarkMode}
          onProfileUpdated={(updated) => {
            setProfile((prev) => ({
              ...prev,
              firstName: updated.firstName,
              lastName: updated.lastName,
              whatsapp: updated.phone ? `+44${updated.phone}` : prev.whatsapp,
            }));
          }}
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
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  topActionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  topPillBtn: {
    padding: 2,
  },
  topPillDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  cardWrapper: {
    width: '100%',
  },
  cardGradientBorder: {
    borderRadius: 24,
    padding: 2,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  cardInner: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarInitials: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatarPlusBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileNameCol: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
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
  progressBarTrack: {
    width: 38,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '12%',
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  railBtnBlue: {
    backgroundColor: '#2563eb',
  },
  railBtnDarkBlue: {
    backgroundColor: '#1d4ed8',
    borderWidth: 1.5,
    borderColor: '#38bdf8',
    shadowColor: '#0284c7',
    shadowOpacity: 0.4,
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
    justifyContent: 'center',
    gap: 32,
    marginTop: 18,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  linkTextCoach: {
    color: '#2563eb',
    fontWeight: '700',
  },
  linkTextLogout: {
    color: '#64748b',
    fontWeight: '600',
  },
  linkTextDark: {
    color: '#38bdf8',
  },
  myMatchesSection: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  matchesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },
  matchesTitleLight: {
    color: '#0f172a',
  },
  noMatchesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  noMatchesCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
    shadowOpacity: 0.3,
  },
  noMatchesText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },

  // DARK MODE CONDITIONAL STYLES
  topActionsPillDark: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
  },
  topPillDividerDark: {
    backgroundColor: '#334155',
  },
  cardInnerDark: {
    backgroundColor: '#0b1120',
  },
  textWhite: {
    color: '#ffffff',
  },
  textSlate200: {
    color: '#e2e8f0',
  },
  textSlate300: {
    color: '#cbd5e1',
  },
  textSlate400: {
    color: '#94a3b8',
  },
  progressPillDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  bioTextDark: {
    color: '#94a3b8',
  },
  infoCardDark: {
    backgroundColor: '#0f172a',
    borderColor: '#1e293b',
  },
});
