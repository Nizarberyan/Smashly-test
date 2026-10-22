import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Share,
  Platform,
  ToastAndroid,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeable } from './SwipeableTabScreen';
import {
  CalendarDays,
  Plus,
  X,
  SlidersHorizontal,
  MapPin,
  Lock,
  Heart,
  MessageSquare,
  Send,
  LogOut,
  Calendar,
  CalendarPlus,
  ChevronDown,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import PadelBallLogo from './PadelBallLogo';

interface OpenMatchesModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenMatchDetail: () => void;
  onOpenFilters: () => void;
  isScreen?: boolean;
}

export const OpenMatchesModal: React.FC<OpenMatchesModalProps> = ({
  visible,
  onClose,
  onOpenMatchDetail,
  onOpenFilters,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();
  const [isLiked, setIsLiked] = useState(false);
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
    setToastMessage(message);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  const handleLike = (e?: any) => {
    e?.stopPropagation?.();
    setIsLiked((prev) => {
      const next = !prev;
      if (next) {
        Animated.sequence([
          Animated.spring(likeScaleAnim, {
            toValue: 1.35,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(likeScaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
      }
      return next;
    });
  };

  const handleComment = (e?: any) => {
    e?.stopPropagation?.();
    showToast('Coming later');
  };

  const handleShare = async (e?: any) => {
    e?.stopPropagation?.();
    try {
      await Share.share(
        {
          title: 'Partie de Padel Smashly 🎾',
          message:
            '🎾 Rejoins ma partie de Padel sur Smashly !\n📍 Avt Association Venelloise\n📅 Jeu. 22 Oct. · 16:30 | Niveau 8 (Compétitif)\n🔥 Il ne reste qu’une place disponible !\n👉 https://smashly.app/match/venelles-8',
        },
        {
          dialogTitle: 'Partager cette partie de padel',
        }
      );
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const content = (
    <View style={[styles.container, { paddingTop: isScreen ? 4 : insets.top }]}>
      {/* Header (Swipeable down) */}
      <View style={styles.header} {...panHandlers}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <CalendarDays size={20} color="#ffffff" strokeWidth={2} />
          </View>
          <Text style={styles.headerTitle}>Parties ouvertes</Text>
        </View>

          <View style={styles.headerRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.headerPlusBtn}
            >
              <LinearGradient
                colors={[colors.blue500, colors.yellow400]}
                locations={[0.15, 0.85]}
                style={styles.headerPlusGradient}
              >
                <Plus size={20} color="#0f172a" strokeWidth={2.8} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeBtn}
              onPress={onClose}
            >
              <X size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters horizontal bar */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {/* Filter button with active count badge */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.activeFilterPill}
              onPress={onOpenFilters}
            >
              <SlidersHorizontal size={15} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.activeFilterText}>Filtres</Text>
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>1</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.filterPill}>
              <Text style={styles.filterPillText}>Mon niveau ±1</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.filterPill}>
              <Text style={styles.filterPillText}>🤝 Amical</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={styles.filterPill}>
              <Text style={styles.filterPillText}>🏆 Compétitif</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Matches List Content */}
        <ScrollView
          style={styles.matchesScroll}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: insets.bottom + (isScreen ? 95 : 20),
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          {/* Match Card with Dual-Color Gradient Border */}
          <TouchableOpacity
            activeOpacity={0.92}
            style={styles.cardTouchable}
            onPress={onOpenMatchDetail}
          >
            <LinearGradient
              colors={['#3b82f6', '#3b82f6', '#facc15', '#facc15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradientBorder}
            >
              <View style={styles.cardInner}>
                {/* Club location & lock */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardClubRow}>
                    <MapPin size={17} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Text style={styles.cardClubTitle} numberOfLines={1}>
                      Avt Association Venelloise...
                    </Text>
                  </View>
                  <View style={styles.cardHeaderIcons}>
                    <View style={styles.cardLockIcon}>
                      <Lock size={16} color="#ffffff" strokeWidth={2.2} />
                    </View>
                    <View style={styles.cardPwaLogo}>
                      <Image
                        source={require('../../images/pwa-icon-192.png')}
                        style={styles.cardPwaLogoImg}
                      />
                    </View>
                  </View>
                </View>

                {/* Date and time */}
                <View style={styles.cardDateRow}>
                  <Calendar size={15} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Text style={styles.cardDateText}>Jeu. 22 Oct. · 16:30</Text>
                </View>

                {/* Badges: Level & Format */}
                <View style={styles.cardBadgesRow}>
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Niv. 8</Text>
                  </View>
                  <View style={styles.formatBadge}>
                    <Text style={styles.formatBadgeText}>🏆 Compétitif</Text>
                  </View>
                </View>

                {/* Padel Court 2v2 Players layout with Net Divider */}
                <View style={styles.playersCourtSection}>
                  {/* Left pair (Team 1) */}
                  <View style={styles.teamPair}>
                    {/* Player 1: César */}
                    <View style={styles.playerSlot}>
                      <Text style={styles.playerPosTag}>G</Text>
                      <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { borderColor: '#facc15' }]}>
                          <Image
                            source={require('../../images/avatar-cesar.png')}
                            style={styles.playerAvatarImg}
                          />
                        </View>
                        {/* Mini Smashly PWA badge pinned at top right */}
                        <View style={styles.cesarBadgePin}>
                          <Image
                            source={require('../../images/pwa-icon-192.png')}
                            style={styles.cesarBadgePinImg}
                          />
                        </View>
                      </View>
                      <View style={styles.nameRow}>
                        <Text style={styles.playerName}>César</Text>
                      </View>
                      <View style={styles.purpleLevelBadge}>
                        <Text style={styles.purpleLevelText}>8</Text>
                      </View>
                    </View>

                    {/* Player 2: Léo */}
                    <View style={styles.playerSlot}>
                      <Text style={styles.playerPosTag}>D</Text>
                      <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { backgroundColor: '#334155', borderWidth: 0 }]}>
                          <Text style={styles.avatarInitial}>L</Text>
                        </View>
                      </View>
                      <View style={styles.nameRow}>
                        <Text style={styles.playerName}>Léo</Text>
                      </View>
                      <View style={styles.purpleLevelBadge}>
                        <Text style={styles.purpleLevelText}>8</Text>
                      </View>
                    </View>
                  </View>

                  {/* Net Divider with vs */}
                  <View style={styles.netDivider}>
                    <View style={styles.netLine} />
                    <Text style={styles.vsText}>vs</Text>
                    <View style={styles.netLine} />
                  </View>

                  {/* Right pair (Team 2) */}
                  <View style={styles.teamPair}>
                    {/* Player 3: Julien */}
                    <View style={styles.playerSlot}>
                      <Text style={styles.playerPosTag}>G</Text>
                      <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarCircle, { borderColor: '#10b981' }]}>
                          <Image
                            source={require('../../images/avatar-julien.png')}
                            style={styles.playerAvatarImg}
                          />
                        </View>
                      </View>
                      <View style={styles.nameRow}>
                        <Text style={styles.playerName}>Julien</Text>
                      </View>
                      <View style={styles.purpleLevelBadge}>
                        <Text style={styles.purpleLevelText}>8</Text>
                      </View>
                    </View>

                    {/* Player 4: Place libre (Dashed circle, dash '-', and dashed mini circle) */}
                    <View style={styles.playerSlot}>
                      <Text style={styles.playerPosTag}>D</Text>
                      <View style={styles.avatarWrapper}>
                        <View style={styles.freeSlotCircle}>
                          <Plus size={18} color="#475569" strokeWidth={2} />
                        </View>
                      </View>
                      <View style={styles.nameRow}>
                        <Text style={styles.freeDashText}>-</Text>
                      </View>
                      <View style={styles.freeLevelDashedCircle} />
                    </View>
                  </View>
                </View>

                {/* Pronostics section */}
                <View style={styles.pronosticsRow}>
                  <Text style={styles.pronosticsText}>🎯 Pronostics</Text>
                  <ChevronDown size={14} color="#94a3b8" strokeWidth={2.4} style={{ marginLeft: 6 }} />
                </View>

                {/* Social interaction box: stops propagation so it never navigates to match details */}
                <Pressable
                  style={styles.socialRow}
                  onPress={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {/* Like button: turns red with spring animation */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.socialBtn}
                    onPress={handleLike}
                    hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  >
                    <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
                      <Heart
                        size={22}
                        color={isLiked ? '#ef4444' : '#94a3b8'}
                        fill={isLiked ? '#ef4444' : 'none'}
                      />
                    </Animated.View>
                  </TouchableOpacity>

                  {/* Comment button: displays toast "Coming later" */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.socialBtn}
                    onPress={handleComment}
                    hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  >
                    <MessageSquare size={22} color="#94a3b8" />
                  </TouchableOpacity>

                  {/* Share button: opens Android Share Sheet with pre-made post */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.socialBtn}
                    onPress={handleShare}
                    hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  >
                    <Send size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </Pressable>

                {/* Bottom Actions Row: Quitter la partie */}
                <Pressable
                  style={styles.cardBottomRow}
                  onPress={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <TouchableOpacity
                    style={styles.leaveGameBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      Alert.alert(
                        'Quitter la partie',
                        'Voulez-vous vraiment vous désinscrire de cette partie ?',
                        [
                          { text: 'Non', style: 'cancel' },
                          { text: 'Oui, quitter', style: 'destructive', onPress: () => showToast('Désinscription enregistrée') },
                        ]
                      );
                    }}
                  >
                    <LogOut size={17} color="#94a3b8" style={{ marginRight: 8 }} />
                    <Text style={styles.leaveGameText}>Quitter la partie</Text>
                  </TouchableOpacity>

                  <View style={styles.cardQuickIcons}>
                    <TouchableOpacity
                      style={styles.miniIconBox}
                      onPress={(e) => {
                        e.stopPropagation();
                        showToast('Lieu : Avt Association Venelloise');
                      }}
                    >
                      <MapPin size={17} color="#94a3b8" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.miniIconBox}
                      onPress={(e) => {
                        e.stopPropagation();
                        showToast('Ajouté au calendrier !');
                      }}
                    >
                      <CalendarPlus size={17} color="#10b981" />
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Visual Toast Notification Overlay */}
        {toastMessage && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.toastContainer,
              {
                opacity: toastAnim,
                transform: [
                  {
                    translateY: toastAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.toastBubble}>
              <Text style={styles.toastText}>{toastMessage}</Text>
            </View>
          </Animated.View>
        )}
      </View>
  );

  if (isScreen) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.blue600,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerPlusBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerPlusGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  filterBar: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue500,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  activeFilterText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  filterCountBadge: {
    backgroundColor: colors.yellow400,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterCountText: {
    color: '#0f172a',
    fontSize: 11,
    fontWeight: '800',
  },
  filterPill: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterPillText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  matchesScroll: {
    flex: 1,
  },
  cardTouchable: {
    marginBottom: 16,
  },
  cardGradientBorder: {
    borderRadius: 22,
    padding: 1.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  cardInner: {
    backgroundColor: '#0f172a',
    borderRadius: 20.2,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardClubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cardClubTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cardHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardLockIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPwaLogo: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPwaLogoImg: {
    width: 24,
    height: 24,
    borderRadius: 5,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardDateText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  cardBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  levelBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelBadgeText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  formatBadge: {
    backgroundColor: colors.yellow400,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  formatBadgeText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  playersCourtSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    paddingHorizontal: 4,
  },
  teamPair: {
    flexDirection: 'row',
    gap: 16,
  },
  playerSlot: {
    alignItems: 'center',
    width: 48,
  },
  playerPosTag: {
    color: '#64748b',
    fontSize: 11,
    height: 16,
    textAlign: 'center',
    marginBottom: 3,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  playerAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cesarBadgePin: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 17,
    height: 17,
    borderRadius: 5,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  cesarBadgePinImg: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
  nameRow: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  playerName: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  purpleLevelBadge: {
    backgroundColor: '#9333ea',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  purpleLevelText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  netDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 86,
    width: 24,
  },
  netLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#334155',
  },
  vsText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginVertical: 3,
  },
  freeSlotCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#475569',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeDashText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
  freeLevelDashedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#475569',
    borderStyle: 'dashed',
    marginTop: 4,
  },
  pronosticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
    marginTop: 8,
  },
  pronosticsText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  socialBtn: {
    paddingVertical: 6,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastBubble: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  leaveGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveGameText: {
    color: '#cbd5e1',
    fontSize: 13.5,
    fontWeight: '500',
  },
  cardQuickIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  miniIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
