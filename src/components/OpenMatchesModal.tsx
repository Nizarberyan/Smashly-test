import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Share,
  Platform,
  ToastAndroid,
  Animated,
  Pressable,
  Alert,
  TextInput,
  Linking,
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
  Check,
  Search,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { useMatches } from '../context/MatchesContext';
import {
  calculateMatchLevelRange,
  formatLevelRange,
  formatMatchDateTime,
} from '../services/matchRules';
import { Match, Player } from '../types/match';

interface OpenMatchesModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenMatchDetail: (matchId: string) => void;
  onOpenFilters: () => void;
  isScreen?: boolean;
}

type ScreenMode = 'book_court' | 'open_matches';
type QuickFilter = 'all' | 'my_level' | 'friendly' | 'competitive';
type TimeOfDay = 'all' | 'morning' | 'afternoon' | 'evening';

interface CourtSlot {
  id: string;
  time: string;
  durationMin: number;
  pricePerPlayer: number;
  courtType: 'Indoor' | 'Outdoor';
  courtName: string;
}

interface ClubCourtData {
  id: string;
  name: string;
  city: string;
  distanceKm: number;
  image: any;
  bookingUrl: string;
  courtsCount: number;
  slots: CourtSlot[];
}

const CLUBS_COURTS: ClubCourtData[] = [
  {
    id: 'c1',
    name: 'Tennis Padel Club Venelles',
    city: 'Venelles',
    distanceKm: 12,
    image: require('../../images/venelles-court.jpg'),
    bookingUrl: 'https://smashlyai.com/clubs',
    courtsCount: 4,
    slots: [
      { id: 's1', time: '09h30', durationMin: 90, pricePerPlayer: 12, courtType: 'Indoor', courtName: 'Court 1' },
      { id: 's2', time: '11h00', durationMin: 90, pricePerPlayer: 12, courtType: 'Indoor', courtName: 'Court 2' },
      { id: 's3', time: '14h30', durationMin: 90, pricePerPlayer: 14, courtType: 'Outdoor', courtName: 'Court 3 Panoramique' },
      { id: 's4', time: '18h00', durationMin: 90, pricePerPlayer: 16, courtType: 'Indoor', courtName: 'Court 1' },
      { id: 's5', time: '19h30', durationMin: 90, pricePerPlayer: 16, courtType: 'Indoor', courtName: 'Court 4' },
    ],
  },
  {
    id: 'c2',
    name: 'Padel Collection',
    city: 'Aix-en-Provence',
    distanceKm: 8,
    image: { uri: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&auto=format&fit=crop&q=80' },
    bookingUrl: 'https://smashlyai.com/clubs',
    courtsCount: 6,
    slots: [
      { id: 's6', time: '10h00', durationMin: 90, pricePerPlayer: 14, courtType: 'Indoor', courtName: 'Court Central' },
      { id: 's7', time: '12h00', durationMin: 90, pricePerPlayer: 12, courtType: 'Indoor', courtName: 'Court 3' },
      { id: 's8', time: '17h00', durationMin: 90, pricePerPlayer: 15, courtType: 'Outdoor', courtName: 'Court 2' },
      { id: 's9', time: '20h00', durationMin: 90, pricePerPlayer: 18, courtType: 'Indoor', courtName: 'Court Central' },
    ],
  },
  {
    id: 'c3',
    name: 'Set Club Aix',
    city: 'Aix-en-Provence',
    distanceKm: 6,
    image: { uri: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&auto=format&fit=crop&q=80' },
    bookingUrl: 'https://smashlyai.com/clubs',
    courtsCount: 8,
    slots: [
      { id: 's10', time: '11h30', durationMin: 90, pricePerPlayer: 15, courtType: 'Indoor', courtName: 'Piste 1' },
      { id: 's11', time: '15h00', durationMin: 90, pricePerPlayer: 15, courtType: 'Indoor', courtName: 'Piste 4' },
      { id: 's12', time: '18h30', durationMin: 90, pricePerPlayer: 18, courtType: 'Outdoor', courtName: 'Piste 6' },
    ],
  },
  {
    id: 'c4',
    name: 'Win Win Padel',
    city: 'Cabriès',
    distanceKm: 14,
    image: { uri: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80' },
    bookingUrl: 'https://smashlyai.com/clubs',
    courtsCount: 10,
    slots: [
      { id: 's13', time: '09h00', durationMin: 90, pricePerPlayer: 10, courtType: 'Indoor', courtName: 'Piste A' },
      { id: 's14', time: '13h30', durationMin: 90, pricePerPlayer: 12, courtType: 'Outdoor', courtName: 'Piste D' },
      { id: 's15', time: '16h30', durationMin: 90, pricePerPlayer: 14, courtType: 'Indoor', courtName: 'Piste B' },
      { id: 's16', time: '19h00', durationMin: 90, pricePerPlayer: 16, courtType: 'Indoor', courtName: 'Piste A' },
    ],
  },
  {
    id: 'c5',
    name: 'AVT Padel Club',
    city: 'Marseille',
    distanceKm: 18,
    image: { uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80' },
    bookingUrl: 'https://smashlyai.com/clubs',
    courtsCount: 5,
    slots: [
      { id: 's17', time: '10h30', durationMin: 90, pricePerPlayer: 11, courtType: 'Indoor', courtName: 'Court 1' },
      { id: 's18', time: '14h00', durationMin: 90, pricePerPlayer: 13, courtType: 'Outdoor', courtName: 'Court 3' },
      { id: 's19', time: '20h30', durationMin: 90, pricePerPlayer: 15, courtType: 'Indoor', courtName: 'Court 2' },
    ],
  },
];

export const OpenMatchesModal: React.FC<OpenMatchesModalProps> = ({
  visible,
  onClose,
  onOpenMatchDetail,
  onOpenFilters,
  isScreen = false,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();
  const { matches, currentUser, getMatchStatus, joinMatch, leaveMatch, requestToJoin } =
    useMatches();

  const [screenMode, setScreenMode] = useState<ScreenMode>('book_court');
  const [activeFilter, setActiveFilter] = useState<QuickFilter>('all');
  const [likedMatchIds, setLikedMatchIds] = useState<Record<string, boolean>>({});
  const likeScaleAnim = useRef(new Animated.Value(1)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  // Book a court state (matching smashlyai.com Hye component)
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('all');
  const [clubSearch, setClubSearch] = useState<string>('');
  const [venueFilter, setVenueFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');

  const daysList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayName = isToday
        ? "Aujourd'hui"
        : isTomorrow
        ? 'Demain'
        : d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('fr-FR', { month: 'short' });
      list.push({ offset: i, date: d, dayName, dayNumber, monthName });
    }
    return list;
  }, []);

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

  const handleLike = (matchId: string, e?: any) => {
    e?.stopPropagation?.();
    setLikedMatchIds((prev) => {
      const isNowLiked = !prev[matchId];
      if (isNowLiked) {
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
      return { ...prev, [matchId]: isNowLiked };
    });
  };

  const handleComment = (e?: any) => {
    e?.stopPropagation?.();
    showToast('Coming later');
  };

  const handleShare = async (match: Match, e?: any) => {
    e?.stopPropagation?.();
    try {
      const { fullBadge } = formatMatchDateTime(match.match_datetime);
      const remainingSpots = match.max_players - match.players.length;
      await Share.share(
        {
          title: `Partie de Padel à ${match.club.name} 🎾`,
          message: `🎾 Rejoins ma partie de Padel sur Smashly !\n📍 ${match.club.name} (${match.club.city})\n📅 ${fullBadge} | ${match.match_type === 'competitive' ? 'Compétitif' : 'Amical'}\n🔥 ${
            remainingSpots > 0 ? `Il reste ${remainingSpots} place(s) disponible(s) !` : 'Partie complète'
          }\n👉 https://smashlyai.com/match/${match.id}`,
        },
        {
          dialogTitle: 'Partager cette partie de padel',
        }
      );
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const handleLeave = (matchId: string, e?: any) => {
    e?.stopPropagation?.();
    Alert.alert(
      'Quitter la partie',
      'Voulez-vous vraiment vous désinscrire de cette partie ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, quitter',
          style: 'destructive',
          onPress: () => {
            leaveMatch(matchId);
            showToast('Désinscription enregistrée');
          },
        },
      ]
    );
  };

  const handleJoin = (matchId: string, e?: any) => {
    e?.stopPropagation?.();
    const res = joinMatch(matchId);
    if (res.success) {
      showToast('Partie rejointe avec succès !');
    } else if (res.message) {
      Alert.alert('Information', res.message);
    }
  };

  const handleRequest = (matchId: string, e?: any) => {
    e?.stopPropagation?.();
    requestToJoin(matchId);
    showToast('Demande envoyée');
  };

  const handleBookClubSlot = async (club: ClubCourtData, slot?: CourtSlot) => {
    const slotInfo = slot ? ` pour le créneau de ${slot.time} (${slot.courtName})` : '';
    Alert.alert(
      `Réserver à ${club.name}`,
      `Redirection vers la réservation directe${slotInfo}.\nSouhaitez-vous ouvrir la page du club ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Ouvrir la réservation',
          onPress: async () => {
            try {
              await Linking.openURL(club.bookingUrl);
            } catch {
              showToast('Réservation ouverte');
            }
          },
        },
      ]
    );
  };

  const handleCreateMatchAtClub = (club: ClubCourtData) => {
    Alert.alert(
      `Créer une partie à ${club.name}`,
      `Voulez-vous ouvrir une partie publique pour trouver 3 partenaires à votre niveau à ${club.name} (${club.city}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Créer la partie',
          onPress: () => {
            setScreenMode('open_matches');
            showToast(`Partie initiée à ${club.name} !`);
          },
        },
      ]
    );
  };

  // Filtered Matches
  const displayedMatches = useMemo(() => {
    return matches.filter((match) => {
      if (activeFilter === 'friendly') return match.match_type === 'friendly';
      if (activeFilter === 'competitive') return match.match_type === 'competitive';
      if (activeFilter === 'my_level') {
        const { minLevel, maxLevel } = calculateMatchLevelRange(match.players);
        return currentUser.level >= minLevel && currentUser.level <= maxLevel;
      }
      return true;
    });
  }, [matches, activeFilter, currentUser.level]);

  // Filtered Clubs for Court Booking
  const filteredClubs = useMemo(() => {
    return CLUBS_COURTS.filter((club) => {
      if (clubSearch.trim()) {
        const q = clubSearch.toLowerCase().trim();
        const matchesName = club.name.toLowerCase().includes(q);
        const matchesCity = club.city.toLowerCase().includes(q);
        if (!matchesName && !matchesCity) return false;
      }

      // Check slot availability based on timeOfDay and venueFilter
      const hasMatchingSlots = club.slots.some((s) => {
        const hour = parseInt(s.time.split('h')[0], 10);
        if (timeOfDay === 'morning' && hour >= 12) return false;
        if (timeOfDay === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (timeOfDay === 'evening' && hour < 18) return false;
        if (venueFilter === 'indoor' && s.courtType !== 'Indoor') return false;
        if (venueFilter === 'outdoor' && s.courtType !== 'Outdoor') return false;
        return true;
      });

      return hasMatchingSlots;
    }).map((club) => {
      return {
        ...club,
        slots: club.slots.filter((s) => {
          const hour = parseInt(s.time.split('h')[0], 10);
          if (timeOfDay === 'morning' && hour >= 12) return false;
          if (timeOfDay === 'afternoon' && (hour < 12 || hour >= 18)) return false;
          if (timeOfDay === 'evening' && hour < 18) return false;
          if (venueFilter === 'indoor' && s.courtType !== 'Indoor') return false;
          if (venueFilter === 'outdoor' && s.courtType !== 'Outdoor') return false;
          return true;
        }),
      };
    });
  }, [clubSearch, timeOfDay, venueFilter]);

  // Render player avatar circle
  const renderPlayerSlot = (player: Player | undefined, slotIndex: number, isRightTeam: boolean) => {
    const isCurrentUser =
      player && (player.user_id === currentUser.user_id || player.first_name === currentUser.first_name);

    if (player) {
      return (
        <View key={slotIndex} style={styles.playerSlot}>
          <Text style={styles.playerPosTag}>{isRightTeam ? (slotIndex === 2 ? 'G' : 'D') : (slotIndex === 0 ? 'G' : 'D')}</Text>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatarCircle,
                isCurrentUser
                  ? { borderColor: '#10b981' }
                  : player.first_name.toLowerCase() === 'césar'
                  ? { borderColor: '#facc15' }
                  : { backgroundColor: '#334155', borderWidth: 0 },
              ]}
            >
              {player.first_name.toLowerCase() === 'césar' ? (
                <Image
                  source={require('../../images/avatar-cesar.png')}
                  style={styles.playerAvatarImg}
                />
              ) : isCurrentUser ? (
                <Image
                  source={require('../../images/avatar-julien.png')}
                  style={styles.playerAvatarImg}
                />
              ) : (
                <Text style={styles.avatarInitial}>
                  {player.first_name.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            {player.first_name.toLowerCase() === 'césar' && (
              <View style={styles.cesarBadgePin}>
                <Image
                  source={require('../../images/pwa-icon-192.png')}
                  style={styles.cesarBadgePinImg}
                />
              </View>
            )}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.playerName} numberOfLines={1}>
              {player.first_name}
            </Text>
          </View>
          <View style={styles.purpleLevelBadge}>
            <Text style={styles.purpleLevelText}>{player.level}</Text>
          </View>
        </View>
      );
    }

    // Empty Slot
    return (
      <View key={slotIndex} style={styles.playerSlot}>
        <Text style={styles.playerPosTag}>{isRightTeam ? (slotIndex === 2 ? 'G' : 'D') : (slotIndex === 0 ? 'G' : 'D')}</Text>
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
    );
  };

  // Render individual Open Match Card with virtualization
  const renderMatchItem = useCallback(
    ({ item: match }: { item: Match }) => {
      const { minLevel, maxLevel } = calculateMatchLevelRange(match.players);
      const userStatus = getMatchStatus(match);
      const { fullBadge } = formatMatchDateTime(match.match_datetime);
      const remainingSpots = match.max_players - match.players.length;
      const isFull = remainingSpots <= 0;
      const isLiked = !!likedMatchIds[match.id];

      // Players in each slot
      const p0 = match.players.find((p) => p.slot === 0);
      const p1 = match.players.find((p) => p.slot === 1);
      const p2 = match.players.find((p) => p.slot === 2);
      const p3 = match.players.find((p) => p.slot === 3);

      return (
        <TouchableOpacity
          activeOpacity={0.92}
          style={styles.cardTouchable}
          onPress={() => onOpenMatchDetail(match.id)}
          accessibilityRole="button"
          accessibilityLabel={`Partie de padel au ${match.club.name}, ${match.club.city}, ${fullBadge}`}
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
                    {match.club.name} · {match.club.city}
                    {match.distance_km ? ` (${match.distance_km} km)` : ''}
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
                <Text style={styles.cardDateText}>{fullBadge}</Text>
              </View>

              {/* Badges: Level, Format, Spots */}
              <View style={styles.cardBadgesRow}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>
                    {formatLevelRange(minLevel, maxLevel)}
                  </Text>
                </View>
                <View style={styles.formatBadge}>
                  <Text style={styles.formatBadgeText}>
                    {match.match_type === 'competitive' ? '🏆 Compétitif' : '🤝 Amical'}
                  </Text>
                </View>
                <View style={isFull ? styles.completBadge : styles.spotsBadge}>
                  <Text style={isFull ? styles.completBadgeText : styles.spotsBadgeText}>
                    {isFull
                      ? 'Complet'
                      : `${remainingSpots} place${remainingSpots > 1 ? 's' : ''} libre${
                          remainingSpots > 1 ? 's' : ''
                        }`}
                  </Text>
                </View>
              </View>

              {/* Padel Court 2v2 Players layout with Net Divider */}
              <View style={styles.playersCourtSection}>
                {/* Left pair (Team 1: slots 0 & 1) */}
                <View style={styles.teamPair}>
                  {renderPlayerSlot(p0, 0, false)}
                  {renderPlayerSlot(p1, 1, false)}
                </View>

                {/* Net Divider with vs */}
                <View style={styles.netDivider}>
                  <View style={styles.netLine} />
                  <Text style={styles.vsText}>vs</Text>
                  <View style={styles.netLine} />
                </View>

                {/* Right pair (Team 2: slots 2 & 3) */}
                <View style={styles.teamPair}>
                  {renderPlayerSlot(p2, 2, true)}
                  {renderPlayerSlot(p3, 3, true)}
                </View>
              </View>

              {/* Pronostics section */}
              <View style={styles.pronosticsRow}>
                <Text style={styles.pronosticsText}>🎯 Pronostics</Text>
                <ChevronDown
                  size={14}
                  color="#94a3b8"
                  strokeWidth={2.4}
                  style={{ marginLeft: 6 }}
                />
              </View>

              {/* Social interaction box */}
              <Pressable
                style={styles.socialRow}
                onPress={(e) => {
                  e.stopPropagation();
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.socialBtn}
                  onPress={(e) => handleLike(match.id, e)}
                  hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  accessibilityRole="button"
                  accessibilityLabel={isLiked ? 'Retirer le like' : 'Aimer la partie'}
                >
                  <Animated.View style={{ transform: [{ scale: likeScaleAnim }] }}>
                    <Heart
                      size={22}
                      color={isLiked ? '#ef4444' : '#94a3b8'}
                      fill={isLiked ? '#ef4444' : 'none'}
                    />
                  </Animated.View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.socialBtn}
                  onPress={handleComment}
                  hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  accessibilityRole="button"
                  accessibilityLabel="Commenter la partie"
                >
                  <MessageSquare size={22} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.socialBtn}
                  onPress={(e) => handleShare(match, e)}
                  hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                  accessibilityRole="button"
                  accessibilityLabel="Partager la partie"
                >
                  <Send size={22} color="#94a3b8" />
                </TouchableOpacity>
              </Pressable>

              {/* Bottom Actions Row: Contextual action for Julien */}
              <Pressable
                style={styles.cardBottomRow}
                onPress={(e) => {
                  e.stopPropagation();
                }}
              >
                {userStatus === 'ALREADY_JOINED' && (
                  <TouchableOpacity
                    style={styles.leaveGameBtn}
                    onPress={(e) => handleLeave(match.id, e)}
                    accessibilityRole="button"
                    accessibilityLabel="Quitter la partie"
                  >
                    <LogOut size={17} color="#ef4444" style={{ marginRight: 8 }} />
                    <Text style={[styles.leaveGameText, { color: '#ef4444' }]}>
                      Quitter la partie
                    </Text>
                  </TouchableOpacity>
                )}

                {userStatus === 'CAN_JOIN' && (
                  <TouchableOpacity
                    style={styles.actionPillBtn}
                    onPress={(e) => handleJoin(match.id, e)}
                    accessibilityRole="button"
                    accessibilityLabel="Rejoindre la partie"
                  >
                    <Plus size={16} color="#34d399" style={{ marginRight: 6 }} strokeWidth={2.5} />
                    <Text style={styles.actionPillTextJoin}>Rejoindre la partie</Text>
                  </TouchableOpacity>
                )}

                {userStatus === 'NEEDS_REQUEST' && (
                  <TouchableOpacity
                    style={styles.actionPillBtn}
                    onPress={(e) => handleRequest(match.id, e)}
                    accessibilityRole="button"
                    accessibilityLabel="Demander à rejoindre"
                  >
                    <Send size={15} color="#60a5fa" style={{ marginRight: 6 }} />
                    <Text style={styles.actionPillTextRequest}>Demander à rejoindre</Text>
                  </TouchableOpacity>
                )}

                {userStatus === 'REQUEST_SENT' && (
                  <View style={styles.actionPillSent}>
                    <Check size={15} color="#94a3b8" style={{ marginRight: 6 }} />
                    <Text style={styles.actionPillTextSent}>Demande envoyée</Text>
                  </View>
                )}

                {userStatus === 'FULL' && (
                  <View style={styles.actionPillFull}>
                    <Lock size={15} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={styles.actionPillTextFull}>Partie complète</Text>
                  </View>
                )}

                <View style={styles.cardQuickIcons}>
                  <TouchableOpacity
                    style={styles.miniIconBox}
                    onPress={(e) => {
                      e.stopPropagation();
                      showToast(`Lieu : ${match.club.name} (${match.club.city})`);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Voir le club sur la carte"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MapPin size={17} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.miniIconBox}
                    onPress={(e) => {
                      e.stopPropagation();
                      showToast('Ajouté au calendrier !');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Ajouter la partie au calendrier"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CalendarPlus size={17} color="#10b981" />
                  </TouchableOpacity>
                </View>
              </Pressable>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    },
    [
      likedMatchIds,
      onOpenMatchDetail,
      likeScaleAnim,
      handleLike,
      handleComment,
      handleShare,
      handleLeave,
      handleJoin,
      handleRequest,
      showToast,
    ]
  );

  return (
    <View style={[styles.container, { paddingTop: isScreen ? 4 : insets.top }]}>
      {/* Header */}
      <View style={styles.header} {...panHandlers}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <CalendarDays size={20} color="#ffffff" strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              {screenMode === 'book_court' ? 'Réserver un terrain' : 'Parties ouvertes'}
            </Text>
            <Text style={styles.headerSub}>
              {screenMode === 'book_court' ? 'Clubs partenaires & créneaux' : 'Communauté de joueurs'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.headerPlusBtn}
            onPress={() => {
              if (screenMode === 'book_court') {
                setScreenMode('open_matches');
                showToast('Affichage des parties');
              } else {
                setScreenMode('book_court');
                showToast('Affichage des terrains');
              }
            }}
          >
            <LinearGradient
              colors={[colors.blue500, colors.yellow400]}
              locations={[0.15, 0.85]}
              style={styles.headerPlusGradient}
            >
              <Plus size={20} color="#0f172a" strokeWidth={2.8} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.closeBtn} onPress={onClose}>
            <X size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Switcher Tabs: Réserver un terrain vs Parties ouvertes */}
      <View style={styles.screenModeWrapper}>
        <View style={styles.screenModeContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.screenModeBtn, screenMode === 'book_court' && styles.screenModeBtnActive]}
            onPress={() => setScreenMode('book_court')}
          >
            <Clock
              size={15}
              color={screenMode === 'book_court' ? '#ffffff' : '#94a3b8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.screenModeText,
                screenMode === 'book_court' && styles.screenModeTextActive,
              ]}
            >
              Réserver un terrain
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.screenModeBtn, screenMode === 'open_matches' && styles.screenModeBtnActive]}
            onPress={() => setScreenMode('open_matches')}
          >
            <CalendarDays
              size={15}
              color={screenMode === 'open_matches' ? '#ffffff' : '#94a3b8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.screenModeText,
                screenMode === 'open_matches' && styles.screenModeTextActive,
              ]}
            >
              Parties ouvertes ({displayedMatches.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ------------------------------------------------------------- */}
      {/* MODE 1: RÉSERVER UN TERRAIN (MATCHING SMASHLYAI.COM BROWSE COURTS) */}
      {/* ------------------------------------------------------------- */}
      {screenMode === 'book_court' && (
        <FlatList
          data={filteredClubs}
          keyExtractor={(club) => club.id}
          ListHeaderComponent={
            <View>
              {/* 14-day horizontal date picker */}
              <Text style={styles.sectionHeaderLabel}>Choisir la date :</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.datesScroll}
              >
                {daysList.map((item) => {
                  const isSelected = selectedDayOffset === item.offset;
                  return (
                    <TouchableOpacity
                      key={item.offset}
                      activeOpacity={0.8}
                      style={[styles.dateCard, isSelected && styles.dateCardActive]}
                      onPress={() => setSelectedDayOffset(item.offset)}
                      accessibilityRole="button"
                      accessibilityLabel={`Date ${item.dayName} ${item.dayNumber} ${item.monthName}`}
                    >
                      <Text style={[styles.dateDayName, isSelected && styles.dateTextActive]}>
                        {item.dayName}
                      </Text>
                      <Text style={[styles.dateDayNumber, isSelected && styles.dateTextActive]}>
                        {item.dayNumber}
                      </Text>
                      <Text style={[styles.dateMonthName, isSelected && styles.dateTextActive]}>
                        {item.monthName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Time of Day filter pills */}
              <View style={styles.timeOfDayRow}>
                {[
                  { key: 'all', label: 'Toute la journée' },
                  { key: 'morning', label: 'Matin (<12h)' },
                  { key: 'afternoon', label: 'Après-midi (12h-18h)' },
                  { key: 'evening', label: 'Soir (>=18h)' },
                ].map((t) => {
                  const active = timeOfDay === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      activeOpacity={0.8}
                      style={[styles.timePill, active && styles.timePillActive]}
                      onPress={() => setTimeOfDay(t.key as TimeOfDay)}
                      accessibilityRole="button"
                      accessibilityLabel={`Filtrer par créneau: ${t.label}`}
                    >
                      <Text style={[styles.timePillText, active && styles.timePillTextActive]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Search bar & Venue Filter */}
              <View style={styles.courtSearchRow}>
                <View style={styles.courtSearchBox}>
                  <Search size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                  <TextInput
                    value={clubSearch}
                    onChangeText={setClubSearch}
                    placeholder="Filtrer club ou ville..."
                    placeholderTextColor="#64748b"
                    style={styles.courtSearchInput}
                    accessibilityLabel="Filtrer club ou ville"
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.venuePill,
                    venueFilter !== 'all' && styles.venuePillActive,
                  ]}
                  onPress={() => {
                    setVenueFilter((prev) =>
                      prev === 'all' ? 'indoor' : prev === 'indoor' ? 'outdoor' : 'all'
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Filtre terrain intérieur ou extérieur"
                >
                  <Text style={styles.venuePillText}>
                    {venueFilter === 'all'
                      ? 'Tous'
                      : venueFilter === 'indoor'
                      ? 'Indoor'
                      : 'Outdoor'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item: club }) => (
            <View key={club.id} style={styles.clubCourtCard}>
              {/* Club Image with Gradient Overlay */}
              <View style={styles.clubImageWrapper}>
                <Image source={club.image} style={styles.clubImage} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', 'rgba(15, 23, 42, 0.95)']}
                  style={styles.clubImageGradient}
                />
                <View style={styles.clubImageHeader}>
                  <View style={styles.clubTitleCol}>
                    <Text style={styles.clubCardTitle} numberOfLines={1}>
                      {club.name}
                    </Text>
                    <View style={styles.clubLocationBadge}>
                      <MapPin size={12} color="#cbd5e1" style={{ marginRight: 4 }} />
                      <Text style={styles.clubLocationBadgeText}>
                        {club.city} · {club.distanceKm} km
                      </Text>
                    </View>
                  </View>
                  <View style={styles.courtsCountBadge}>
                    <Text style={styles.courtsCountText}>{club.courtsCount} terrains</Text>
                  </View>
                </View>
              </View>

              {/* Available Slots Horizontal Scroll */}
              <View style={styles.slotsContainer}>
                <Text style={styles.slotsLabel}>Créneaux disponibles :</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.slotsScroll}
                >
                  {club.slots.map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      activeOpacity={0.85}
                      style={styles.slotChip}
                      onPress={() => handleBookClubSlot(club, slot)}
                      accessibilityRole="button"
                      accessibilityLabel={`Créneau à ${slot.time}, ${slot.durationMin} minutes, ${slot.pricePerPlayer} euros`}
                    >
                      <Text style={styles.slotChipTime}>{slot.time}</Text>
                      <Text style={styles.slotChipMeta}>
                        {slot.durationMin}m · {slot.pricePerPlayer}€
                      </Text>
                      <Text style={styles.slotChipType}>{slot.courtType}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Actions Row */}
              <View style={styles.clubCardActions}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.directBookYellowBtn}
                  onPress={() => handleBookClubSlot(club)}
                  accessibilityRole="button"
                  accessibilityLabel="Réserver sur le site du club"
                >
                  <ExternalLink size={15} color="#0f172a" style={{ marginRight: 6 }} />
                  <Text style={styles.directBookYellowText}>Réserver sur le site du club</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.createMatchClubBtn}
                  onPress={() => handleCreateMatchAtClub(club)}
                  accessibilityRole="button"
                  accessibilityLabel="Créer une partie dans ce club"
                >
                  <Plus size={15} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.createMatchClubText}>Créer une partie</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyClubsBox}>
              <Text style={styles.emptyClubsText}>
                Aucun créneau disponible pour cette sélection.
              </Text>
            </View>
          }
          style={styles.matchesScroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: insets.bottom + (isScreen ? 95 : 24),
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODE 2: PARTIES OUVERTES (OPEN MATCHES FEED)                  */}
      {/* ------------------------------------------------------------- */}
      {screenMode === 'open_matches' && (
        <>
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
                style={[
                  styles.filterPill,
                  activeFilter !== 'all' && styles.activeFilterPill,
                ]}
                onPress={onOpenFilters}
              >
                <SlidersHorizontal
                  size={15}
                  color={activeFilter !== 'all' ? '#ffffff' : '#cbd5e1'}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter !== 'all' && styles.activeFilterText,
                  ]}
                >
                  Filtres
                </Text>
                {activeFilter !== 'all' && (
                  <View style={styles.filterCountBadge}>
                    <Text style={styles.filterCountText}>1</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  activeFilter === 'my_level' && styles.activeFilterPill,
                ]}
                onPress={() =>
                  setActiveFilter((prev) => (prev === 'my_level' ? 'all' : 'my_level'))
                }
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'my_level' && styles.activeFilterText,
                  ]}
                >
                  Mon niveau ±1
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  activeFilter === 'friendly' && styles.activeFilterPill,
                ]}
                onPress={() =>
                  setActiveFilter((prev) => (prev === 'friendly' ? 'all' : 'friendly'))
                }
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'friendly' && styles.activeFilterText,
                  ]}
                >
                  🤝 Amical
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.filterPill,
                  activeFilter === 'competitive' && styles.activeFilterPill,
                ]}
                onPress={() =>
                  setActiveFilter((prev) => (prev === 'competitive' ? 'all' : 'competitive'))
                }
              >
                <Text
                  style={[
                    styles.filterPillText,
                    activeFilter === 'competitive' && styles.activeFilterText,
                  ]}
                >
                  🏆 Compétitif
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Matches List Content with FlatList Virtualization */}
          <FlatList
            data={displayedMatches}
            keyExtractor={(match) => match.id}
            renderItem={renderMatchItem}
            style={styles.matchesScroll}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + (isScreen ? 95 : 20),
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={3}
            maxToRenderPerBatch={4}
            windowSize={5}
            removeClippedSubviews={Platform.OS === 'android'}
            ListEmptyComponent={
              <View style={styles.emptyClubsBox}>
                <Text style={styles.emptyClubsText}>
                  Aucune partie disponible pour ces filtres.
                </Text>
              </View>
            }
          />
        </>
      )}

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
                    outputRange: [15, 0],
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
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    color: '#94a3b8',
    fontSize: 11.5,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  screenModeWrapper: {
    backgroundColor: '#0a0f1d',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 10,
  },
  screenModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232f48',
  },
  screenModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  screenModeBtnActive: {
    backgroundColor: '#2563eb',
  },
  screenModeText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '600',
  },
  screenModeTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionHeaderLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  datesScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  dateCard: {
    backgroundColor: '#131b2e',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232f48',
    minWidth: 68,
  },
  dateCardActive: {
    backgroundColor: '#2563eb',
    borderColor: '#38bdf8',
  },
  dateDayName: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateDayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 2,
  },
  dateMonthName: {
    fontSize: 10.5,
    color: '#94a3b8',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  timeOfDayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  timePill: {
    backgroundColor: '#131b2e',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#232f48',
  },
  timePillActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  timePillText: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600',
  },
  timePillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  courtSearchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  courtSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2e',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: '#232f48',
  },
  courtSearchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12.5,
  },
  venuePill: {
    backgroundColor: '#131b2e',
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#232f48',
  },
  venuePillActive: {
    borderColor: '#facc15',
  },
  venuePillText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  clubsList: {
    gap: 14,
  },
  emptyClubsBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyClubsText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  clubCourtCard: {
    backgroundColor: '#131b2e',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#232f48',
  },
  clubImageWrapper: {
    height: 120,
    position: 'relative',
    backgroundColor: '#0a0f1d',
  },
  clubImage: {
    width: '100%',
    height: '100%',
  },
  clubImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  clubImageHeader: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  clubTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  clubCardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  clubLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  clubLocationBadgeText: {
    color: '#cbd5e1',
    fontSize: 11.5,
  },
  courtsCountBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courtsCountText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
  },
  slotsContainer: {
    padding: 12,
  },
  slotsLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  slotsScroll: {
    gap: 8,
  },
  slotChip: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  slotChipTime: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  slotChipMeta: {
    color: '#dbeafe',
    fontSize: 10.5,
    fontWeight: '600',
  },
  slotChipType: {
    color: '#93c5fd',
    fontSize: 9.5,
  },
  clubCardActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  directBookYellowBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#facc15',
    paddingVertical: 9,
    borderRadius: 10,
  },
  directBookYellowText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '800',
  },
  createMatchClubBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue500,
    paddingVertical: 9,
    borderRadius: 10,
  },
  createMatchClubText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Open matches styles
  filterBar: {
    backgroundColor: '#0a0f1d',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 9,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue500,
    borderColor: colors.blue500,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  formatBadge: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formatBadgeText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  spotsBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spotsBadgeText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  completBadge: {
    backgroundColor: '#7f1d1d',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completBadgeText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
  },
  playersCourtSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0f1d',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
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
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerAvatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cesarBadgePin: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    backgroundColor: '#facc15',
    borderRadius: 6,
    padding: 1,
  },
  cesarBadgePinImg: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  nameRow: {
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  purpleLevelBadge: {
    backgroundColor: '#581c87',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  purpleLevelText: {
    color: '#e9d5ff',
    fontSize: 10,
    fontWeight: '700',
  },
  freeSlotCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeDashText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  freeLevelDashedCircle: {
    width: 18,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#334155',
  },
  netDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  netLine: {
    width: 1,
    height: 18,
    backgroundColor: '#334155',
  },
  vsText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    marginVertical: 2,
  },
  pronosticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pronosticsText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 12,
  },
  socialBtn: {
    padding: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaveGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  leaveGameText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionPillTextJoin: {
    color: '#34d399',
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionPillTextRequest: {
    color: '#60a5fa',
    fontSize: 12.5,
    fontWeight: '700',
  },
  actionPillSent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionPillTextSent: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '600',
  },
  actionPillFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  actionPillTextFull: {
    color: '#64748b',
    fontSize: 12.5,
    fontWeight: '600',
  },
  cardQuickIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniIconBox: {
    padding: 6,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  toastBubble: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
