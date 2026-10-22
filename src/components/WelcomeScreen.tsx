import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Lightbulb,
  Share2,
  Mic,
  ArrowUp,
  Link,
  CalendarDays,
  GraduationCap,
  Users2,
  Map,
  Plus,
  Check,
  RefreshCw,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { PadelCourtIcon } from './PadelCourtIcon';
import PadelBallLogo from './PadelBallLogo';
import { t } from '../i18n';

interface WelcomeScreenProps {
  onOpenMatches?: () => void;
  onBookCoach?: () => void;
  onQuickAction?: () => void;
  onOpenMap?: () => void;
  onOpenNetwork?: () => void;
  onOpenCourts?: () => void;
  onOpenProfile?: () => void;
  showBottomNav?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenMatches,
  onBookCoach,
  onQuickAction,
  onOpenMap,
  onOpenNetwork,
  onOpenCourts,
  onOpenProfile,
  showBottomNav = false,
}) => {
  const insets = useSafeAreaInsets();
  const [chatMode, setChatMode] = useState<'matching' | 'assistant'>('matching');
  const [inputText, setInputText] = useState('');
  const [networkOnly, setNetworkOnly] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Animation state for deck card shuffle
  const isAnimating = useRef(false);

  // Position and transform for Community card (starts in front: x=0, y=0, rot=0, scale=1)
  const communityX = useRef(new Animated.Value(0)).current;
  const communityY = useRef(new Animated.Value(0)).current;
  const communityRot = useRef(new Animated.Value(0)).current;
  const communityScale = useRef(new Animated.Value(1)).current;

  // Position and transform for Assistant card (starts in back: x=14, y=-16, rot=1 -> 6deg, scale=0.95)
  const assistantX = useRef(new Animated.Value(14)).current;
  const assistantY = useRef(new Animated.Value(-16)).current;
  const assistantRot = useRef(new Animated.Value(1)).current;
  const assistantScale = useRef(new Animated.Value(0.95)).current;

  // zIndex values to control stacking order
  const [communityZIndex, setCommunityZIndex] = useState(20);
  const [assistantZIndex, setAssistantZIndex] = useState(10);

  const toggleMode = (newMode?: 'matching' | 'assistant') => {
    if (isAnimating.current) return;
    const targetMode = newMode || (chatMode === 'matching' ? 'assistant' : 'matching');
    if (targetMode === chatMode) return;

    isAnimating.current = true;

    if (chatMode === 'matching') {
      // Switching from Community (front) -> Assistant (front)
      // Phase 1: Community flies out to the left like dealing a card
      Animated.parallel([
        Animated.timing(communityX, {
          toValue: -55,
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(communityY, {
          toValue: 10,
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(communityRot, {
          toValue: -1.5, // -9deg
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(communityScale, {
          toValue: 1.03,
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Swap stacking order and mode
        setCommunityZIndex(10);
        setAssistantZIndex(20);
        setChatMode('assistant');

        // Phase 2: Community slides behind to the back slot, Assistant glides forward to the front slot
        Animated.parallel([
          // Community slides into the back
          Animated.timing(communityX, {
            toValue: 14,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(communityY, {
            toValue: -16,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(communityRot, {
            toValue: 1, // 6deg
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(communityScale, {
            toValue: 0.95,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Assistant glides to the front
          Animated.timing(assistantX, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assistantY, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assistantRot, {
            toValue: 0, // 0deg
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assistantScale, {
            toValue: 1.0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          isAnimating.current = false;
        });
      });
    } else {
      // Switching from Assistant (front) -> Community (front)
      // Phase 1: Assistant flies out to the left
      Animated.parallel([
        Animated.timing(assistantX, {
          toValue: -55,
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(assistantY, {
          toValue: 10,
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(assistantRot, {
          toValue: -1.5, // -9deg
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(assistantScale, {
          toValue: 1.03,
          duration: 190,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Swap stacking order and mode
        setAssistantZIndex(10);
        setCommunityZIndex(20);
        setChatMode('matching');

        // Phase 2: Assistant slides behind, Community glides forward
        Animated.parallel([
          // Assistant slides into the back
          Animated.timing(assistantX, {
            toValue: 14,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assistantY, {
            toValue: -16,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assistantRot, {
            toValue: 1, // 6deg
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(assistantScale, {
            toValue: 0.95,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Community glides to the front
          Animated.timing(communityX, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(communityY, {
            toValue: 0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(communityRot, {
            toValue: 0, // 0deg
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(communityScale, {
            toValue: 1.0,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          isAnimating.current = false;
        });
      });
    }
  };

  const communityRotateStr = communityRot.interpolate({
    inputRange: [-1.5, 0, 1],
    outputRange: ['-9deg', '0deg', '6deg'],
  });

  const assistantRotateStr = assistantRot.interpolate({
    inputRange: [-1.5, 0, 1],
    outputRange: ['-9deg', '0deg', '6deg'],
  });

  const handleShare = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const isCommunity = chatMode === 'matching';

  const defaultPlaceholder = isCommunity
    ? 'Demande à Smashly de trouver un partenair'
    : 'Demande à Smashly comment améliorer ta défense d';

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../images/hero-welcome-test.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark vertical gradient overlay per COULEURS.md:
            rgba(2,6,23,0.35) en haut, 0.25 au milieu, 0.45 en bas */}
        <LinearGradient
          colors={[colors.overlayTop, colors.overlayMiddle, colors.overlayBottom]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Content Container */}
        <View
          style={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* Top Bar: Smashly App Icon & Bell */}
          <View style={styles.topBar}>
            <View style={styles.appIconContainer}>
              <Image
                source={require('../../images/pwa-icon-192.png')}
                style={styles.appIcon}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.bellButton}
            >
              <Bell size={24} color="#ffffff" strokeWidth={1.8} />
            </TouchableOpacity>
          </View>

          {/* Main Title */}
          <Text style={styles.mainTitle}>
            Un coach, un partenaire ou un club ?
          </Text>

          {/* Search / Chat Input Box */}
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder={defaultPlaceholder}
              placeholderTextColor="#94a3b8"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />

            <View style={styles.inputBottomRow}>
              {/* Left Action Buttons inside input */}
              <View style={styles.inputLeftActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.inputActionIconBtn}
                >
                  <Lightbulb size={18} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.inputActionIconBtn}
                  onPress={handleShare}
                >
                  <Share2 size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Right Action Buttons inside input: Mic & Send */}
              <View style={styles.inputRightActions}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.inputActionIconBtn}
                >
                  <Mic size={18} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.sendButton}
                >
                  <ArrowUp size={18} color="#ffffff" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Network Only Toggle under input (for Community mode) */}
            {isCommunity && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setNetworkOnly(!networkOnly)}
                style={[
                  styles.networkBadge,
                  networkOnly && styles.networkBadgeActive,
                ]}
              >
                <Link size={13} color="#ffffff" strokeWidth={2.4} />
                <Link size={13} color="#ffffff" strokeWidth={2.4} />
              </TouchableOpacity>
            )}
          </View>

          {/* Toast Notification */}
          {showToast && (
            <View style={styles.toastContainer}>
              <Text style={styles.toastText}>✓ {t('chat.liencopie')}</Text>
            </View>
          )}

          {/* Mode Selection Prompt */}
          <Text style={styles.modeSectionTitle}>
            {t('chat.choisisTonModeDeDiscussion')}
          </Text>

          {/* Interactive Stacked Cards Deck & Shortcuts Row */}
          <View style={styles.deckAndShortcutsRow}>
            {/* Left: 3D Stacked Deck of Mode Cards with Card-Dealing Animation */}
            <View style={styles.deckContainer}>
              {/* Card 1: Community Card */}
              <Animated.View
                style={[
                  styles.cardBase,
                  {
                    zIndex: communityZIndex,
                    transform: [
                      { translateX: communityX },
                      { translateY: communityY },
                      { rotate: communityRotateStr },
                      { scale: communityScale },
                    ],
                  },
                  isCommunity
                    ? {
                      backgroundColor: '#162a4d',
                      borderColor: colors.blue500,
                      shadowColor: colors.blue500,
                    }
                    : {
                      backgroundColor: colors.cardBehindBg,
                      borderColor: colors.cardBehindBorder,
                    },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => toggleMode()}
                  style={styles.cardTouchable}
                >
                  {isCommunity ? (
                    // Front State
                    <>
                      <View style={[styles.activeBadge, { backgroundColor: colors.blue500 }]}>
                        <Check size={11} color="#ffffff" strokeWidth={3} />
                        <Text style={[styles.activeBadgeText, { color: '#ffffff' }]}>
                          {t('chat.actif')}
                        </Text>
                      </View>
                      <Image
                        source={require('../../images/mascotte-communaute-tight.png')}
                        style={styles.mascotFront}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardFrontTitle}>{t('chat.communaut')}</Text>
                      <Text style={styles.cardFrontDesc} numberOfLines={2}>
                        {t('chat.trouveDesJoueursEtCoachsRserveDesCrneaux')}
                      </Text>
                    </>
                  ) : (
                    // Behind State
                    <>
                      <View style={[styles.refreshBadge, { backgroundColor: colors.blue500 }]}>
                        <RefreshCw size={17} color="#ffffff" strokeWidth={2.5} />
                      </View>
                      <Image
                        source={require('../../images/mascotte-communaute-tight.png')}
                        style={styles.mascotBehind}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardBehindTitle}>{t('chat.communaut')}</Text>
                      <Text style={[styles.cardFrontDesc, { opacity: 0.6 }]} numberOfLines={2}>
                        {t('chat.trouveDesJoueursEtCoachsRserveDesCrneaux')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Card 2: Assistant Card */}
              <Animated.View
                style={[
                  styles.cardBase,
                  {
                    zIndex: assistantZIndex,
                    transform: [
                      { translateX: assistantX },
                      { translateY: assistantY },
                      { rotate: assistantRotateStr },
                      { scale: assistantScale },
                    ],
                  },
                  !isCommunity
                    ? {
                      backgroundColor: colors.cardAssistantActiveBg,
                      borderColor: colors.yellow400,
                      shadowColor: colors.yellow400,
                    }
                    : {
                      backgroundColor: colors.cardBehindBg,
                      borderColor: colors.cardBehindBorder,
                    },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => toggleMode()}
                  style={styles.cardTouchable}
                >
                  {!isCommunity ? (
                    // Front State
                    <>
                      <View style={[styles.activeBadge, { backgroundColor: colors.yellow400 }]}>
                        <Check size={11} color="#0f172a" strokeWidth={3} />
                        <Text style={[styles.activeBadgeText, { color: '#0f172a' }]}>
                          {t('chat.actif')}
                        </Text>
                      </View>
                      <Image
                        source={require('../../images/mascotte-assistant-tight.png')}
                        style={styles.mascotFront}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardFrontTitle}>{t('chat.assistant')}</Text>
                      <Text style={styles.cardFrontDesc} numberOfLines={2}>
                        {t('chat.conseilsTechniquesEtRecommandationsPadel')}
                      </Text>
                    </>
                  ) : (
                    // Behind State
                    <>
                      <View style={[styles.refreshBadge, { backgroundColor: colors.yellow400 }]}>
                        <RefreshCw size={17} color="#0f172a" strokeWidth={2.5} />
                      </View>
                      <Image
                        source={require('../../images/mascotte-assistant-tight.png')}
                        style={styles.mascotBehind}
                        resizeMode="contain"
                      />
                      <Text style={styles.cardBehindTitle}>{t('chat.assistant')}</Text>
                      <Text style={[styles.cardFrontDesc, { opacity: 0.6 }]} numberOfLines={2}>
                        {t('chat.conseilsTechniquesEtRecommandationsPadel')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Right: Shortcuts box ("Carré des raccourcis") */}
            <View style={styles.shortcutsBox}>
              {/* Shortcut 1: Rejoins une partie */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.shortcutRow}
                onPress={onOpenMatches}
              >
                <View style={styles.shortcutIconContainer}>
                  <CalendarDays size={18} color="#ffffff" strokeWidth={2} />
                </View>
                <Text style={styles.shortcutLabel} numberOfLines={2}>
                  {t('chat.quickJoinMatch')}
                </Text>
              </TouchableOpacity>

              {/* 70% opacity divider */}
              <View style={styles.shortcutDivider} />

              {/* Shortcut 2: Réserve ton coach */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.shortcutRow}
                onPress={onBookCoach}
              >
                <View style={styles.shortcutIconContainer}>
                  <GraduationCap size={18} color="#ffffff" strokeWidth={2} />
                </View>
                <Text style={styles.shortcutLabel} numberOfLines={2}>
                  {t('chat.quickBookCoach')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Bottom Floating Navigation Bar or Spacer for persistent navbar */}
          {showBottomNav ? (
            <View style={styles.bottomNavContainer}>
              <View style={styles.bottomNavBar}>
                {/* 1. Network / Community */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.navButton}
                  onPress={onOpenNetwork}
                >
                  <Users2 size={24} color="#e2e8f0" strokeWidth={2} />
                </TouchableOpacity>

                {/* 2. Map */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.navButton}
                  onPress={onOpenMap}
                >
                  <Map size={24} color="#e2e8f0" strokeWidth={2} />
                </TouchableOpacity>

                {/* 3. Center Gradient + Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.plusButtonContainer}
                  onPress={onQuickAction}
                >
                  <LinearGradient
                    colors={[colors.blue500, colors.yellow400]}
                    locations={[0.15, 0.85]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.plusGradient}
                  >
                    <Plus size={24} color="#0f172a" strokeWidth={2.8} />
                  </LinearGradient>
                </TouchableOpacity>

                {/* 4. Padel Court Icon */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.navButton}
                  onPress={onOpenCourts}
                >
                  <PadelCourtIcon size={25} color="#e2e8f0" strokeWidth={2} />
                </TouchableOpacity>

                {/* 5. User Profile Logo / Avatar */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.profileButton}
                  onPress={onOpenProfile}
                >
                  <View style={styles.avatarBorder}>
                    <Image
                      source={require('../../images/avatar-julien.png')}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={{ height: Math.max(insets.bottom, 14) + 65 }} />
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  appIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
  },
  bellButton: {
    padding: 6,
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 14,
    paddingHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    letterSpacing: -0.2,
  },
  inputCard: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  textInput: {
    color: '#f8fafc',
    fontSize: 14.5,
    minHeight: 46,
    maxHeight: 120,
    textAlignVertical: 'top',
    padding: 0,
  },
  inputBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  inputLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputActionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: colors.blue600,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.blue600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  networkBadge: {
    position: 'absolute',
    bottom: -15,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  networkBadgeActive: {
    backgroundColor: colors.blue500,
  },
  toastContainer: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  modeSectionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 14,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  deckAndShortcutsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
    marginBottom: 10,
    overflow: 'visible',
    zIndex: 10,
  },
  deckContainer: {
    width: (width - 44) * 0.46,
    height: 216,
    position: 'relative',
    marginRight: 12,
    overflow: 'visible',
    zIndex: 20,
  },
  cardBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'visible',
  },
  cardTouchable: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 24,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  refreshBadge: {
    position: 'absolute',
    top: -14,
    right: -14,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 40,
  },
  mascotBehind: {
    width: 48,
    height: 66,
    opacity: 0.8,
    marginTop: 6,
    marginBottom: 4,
  },
  cardBehindTitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardFront: {
    zIndex: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 3.5,
  },
  activeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  mascotFront: {
    width: 54,
    height: 74,
    marginTop: 8,
    marginBottom: 6,
  },
  cardFrontTitle: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardFrontDesc: {
    color: '#94a3b8',
    fontSize: 10.5,
    lineHeight: 14,
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  shortcutsBox: {
    flex: 1,
    backgroundColor: colors.shortcutsBg,
    borderColor: colors.shortcutsBorder,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'space-evenly',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  shortcutIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: colors.blue600,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  shortcutLabel: {
    color: '#f1f5f9',
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
    lineHeight: 17,
  },
  shortcutDivider: {
    height: 1,
    backgroundColor: 'rgba(71, 85, 105, 0.7)',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  bottomNavContainer: {
    marginTop: 10,
  },
  bottomNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bottomBarBg,
    borderColor: colors.bottomBarBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  navButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButtonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  plusGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.yellow400,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
