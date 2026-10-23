import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  Clock,
  Plus,
  Target,
  Check,
} from 'lucide-react-native';

import { colors } from '../theme/colors';
import { useMatches } from '../context/MatchesContext';
import { calculateMatchLevelRange, formatMatchDateTime } from '../services/matchRules';
import { Match, Player } from '../types/match';

interface MatchDetailModalProps {
  visible: boolean;
  matchId?: string | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  visible,
  matchId,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const { matches, currentUser, getMatchStatus, joinMatch, leaveMatch, requestToJoin } =
    useMatches();

  // Find match by matchId or fallback to first match
  const match: Match | undefined =
    matches.find((m) => m.id === matchId) || matches[0];

  if (!match) return null;

  const userStatus = getMatchStatus(match);
  const { minLevel, maxLevel, average } = calculateMatchLevelRange(match.players);
  const remainingSpots = match.max_players - match.players.length;

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const handleJoin = () => {
    const res = joinMatch(match.id);
    if (res.success) {
      showToast('Partie rejointe !');
    } else if (res.message) {
      Alert.alert('Information', res.message);
    }
  };

  const handleLeave = () => {
    Alert.alert(
      'Quitter la partie',
      'Voulez-vous vraiment vous désinscrire de cette partie ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, quitter',
          style: 'destructive',
          onPress: () => {
            leaveMatch(match.id);
            showToast('Désinscription enregistrée');
          },
        },
      ]
    );
  };

  const handleRequest = () => {
    requestToJoin(match.id);
    showToast('Demande envoyée aux joueurs de la partie');
  };

  const formatLevelNum = (num: number) =>
    num % 1 === 0 ? num.toString() : num.toFixed(1).replace('.', ',');

  // Render a single player slot (0, 1, 2, or 3)
  const renderPlayerSlot = (slotIndex: number) => {
    const player: Player | undefined = match.players.find((p) => p.slot === slotIndex);
    const isCurrentUser =
      player && (player.user_id === currentUser.user_id || player.first_name === currentUser.first_name);

    if (player) {
      return (
        <View key={slotIndex} style={styles.playerSlot}>
          <View
            style={[
              styles.avatarCircle,
              isCurrentUser && { borderColor: colors.yellow400, borderWidth: 1.8 },
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
          <View style={styles.nameContainer}>
            <Text style={styles.playerName} numberOfLines={1}>
              {player.first_name}
            </Text>
          </View>
          <View style={styles.badgeContainer}>
            <View style={styles.purpleLevelBadge}>
              <Text style={styles.purpleLevelText}>{player.level}</Text>
            </View>
          </View>
        </View>
      );
    }

    // Free Slot
    return (
      <TouchableOpacity
        key={slotIndex}
        activeOpacity={userStatus === 'CAN_JOIN' ? 0.7 : 1}
        style={styles.playerSlot}
        onPress={() => {
          if (userStatus === 'CAN_JOIN') {
            joinMatch(match.id, slotIndex);
            showToast('Partie rejointe !');
          }
        }}
      >
        <View style={styles.dashedSlot}>
          <Plus size={24} color="#64748b" strokeWidth={2} />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.freeSlotText} numberOfLines={1}>
            Place libre
          </Text>
        </View>
        <View style={styles.badgeContainer} />
      </TouchableOpacity>
    );
  };

  // Date and Time parsing
  const { dateShort, time } = formatMatchDateTime(match.match_datetime);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Image Section */}
          <View style={styles.heroWrapper}>
            <Image
              source={
                match.club.city.toLowerCase().includes('venelles')
                  ? require('../../images/venelles-court.jpg')
                  : require('../../images/hero-welcome-test.jpg')
              }
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <View style={styles.heroImage}>
              {/* Header with back and itinerary buttons */}
              <View style={[styles.topControls, { paddingTop: Math.max(insets.top, 16) }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.roundBackBtn}
                  onPress={onClose}
                >
                  <ChevronLeft size={24} color="#ffffff" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.itineraryBtn}
                  onPress={() => showToast(`Itinéraire vers ${match.club.name}`)}
                >
                  <MapPin size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.itineraryText}>Itinéraire</Text>
                </TouchableOpacity>
              </View>

              {/* Title & Location at bottom of hero */}
              <View style={styles.heroBottomText}>
                <Text style={styles.clubTitle}>{match.club.name}</Text>
                <Text style={styles.clubSubtitle}>{match.club.city}</Text>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsContent}>
            {/* Date & Time Row */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <CalendarDays size={20} color={colors.blue500} style={{ marginRight: 8 }} />
                <Text style={styles.dateTimeText}>{dateShort}</Text>
              </View>

              <View style={styles.dateTimeItem}>
                <Clock size={20} color={colors.blue500} style={{ marginRight: 8 }} />
                <Text style={styles.dateTimeText}>{time}</Text>
              </View>
            </View>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.greenBadge}>
                <Text style={styles.greenBadgeText}>
                  Niv. {formatLevelNum(minLevel)} - {formatLevelNum(maxLevel)}
                </Text>
              </View>

              <View style={styles.yellowBadge}>
                <Text style={styles.yellowBadgeText}>
                  {match.match_type === 'competitive' ? '🏆 Compétitif' : '🤝 Amical'}
                </Text>
              </View>

              <View style={styles.darkBadge}>
                <Text style={styles.darkBadgeText}>
                  {remainingSpots <= 0
                    ? 'Complet'
                    : `${remainingSpots} place${remainingSpots > 1 ? 's' : ''} libre${
                        remainingSpots > 1 ? 's' : ''
                      }`}
                </Text>
              </View>
            </View>

            {/* Players Section (2 vs 2 Court) */}
            <Text style={styles.sectionHeader}>Joueurs</Text>

            <View style={styles.playersRow}>
              {/* Team 1: Slots 0 & 1 */}
              {renderPlayerSlot(0)}
              {renderPlayerSlot(1)}

              {/* VS Divider */}
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>vs</Text>
              </View>

              {/* Team 2: Slots 2 & 3 */}
              {renderPlayerSlot(2)}
              {renderPlayerSlot(3)}
            </View>

            {/* Notice Card for Level Range */}
            <View style={styles.noticeCard}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Target size={20} color={colors.blue500} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>
                    L'ajout automatique est réservé aux joueurs de niveau{' '}
                    {formatLevelNum(minLevel)} à {formatLevelNum(maxLevel)}.
                  </Text>
                  <Text style={styles.noticeSubtitle}>
                    En dehors de cet intervalle, ta demande est soumise à validation.
                  </Text>
                </View>
              </View>
            </View>

            {/* Dynamic Bottom Action Button based on Julien's Status */}
            {userStatus === 'ALREADY_JOINED' && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.leaveGameBtn}
                onPress={handleLeave}
              >
                <Text style={styles.leaveGameBtnText}>Quitter la partie</Text>
              </TouchableOpacity>
            )}

            {userStatus === 'CAN_JOIN' && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.joinGameBtn}
                onPress={handleJoin}
              >
                <Text style={styles.joinGameBtnText}>Rejoindre la partie</Text>
              </TouchableOpacity>
            )}

            {userStatus === 'NEEDS_REQUEST' && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.requestGameBtn}
                onPress={handleRequest}
              >
                <Text style={styles.requestGameBtnText}>Demander à rejoindre</Text>
              </TouchableOpacity>
            )}

            {userStatus === 'REQUEST_SENT' && (
              <View style={styles.requestSentBox}>
                <Check size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                <Text style={styles.requestSentText}>Demande envoyée</Text>
              </View>
            )}

            {userStatus === 'FULL' && (
              <View style={styles.fullMatchBox}>
                <Text style={styles.fullMatchText}>Partie complète</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  heroWrapper: {
    height: 240,
    width: '100%',
  },
  heroImage: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itineraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  itineraryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroBottomText: {
    marginTop: 'auto',
  },
  clubTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  clubSubtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  detailsContent: {
    padding: 20,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginBottom: 20,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    color: '#ffffff',
    fontSize: 16.5,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  greenBadge: {
    backgroundColor: '#065f46',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  greenBadgeText: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '700',
  },
  yellowBadge: {
    backgroundColor: colors.yellow400,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  yellowBadgeText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  darkBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
  },
  darkBadgeText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  playersRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  playerSlot: {
    alignItems: 'center',
    width: 72,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  playerAvatarImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  nameContainer: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  playerName: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
  },
  badgeContainer: {
    height: 22,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purpleLevelBadge: {
    backgroundColor: '#9333ea',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purpleLevelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  vsContainer: {
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  dashedSlot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.8,
    borderColor: '#475569',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeSlotText: {
    color: '#64748b',
    fontSize: 12,
  },
  noticeCard: {
    backgroundColor: '#0f1a30',
    borderColor: '#2a3b5c',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  noticeTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  noticeSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  leaveGameBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveGameBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  joinGameBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinGameBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  requestGameBtn: {
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestGameBtnText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '700',
  },
  requestSentBox: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestSentText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  fullMatchBox: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.65,
  },
  fullMatchText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});
