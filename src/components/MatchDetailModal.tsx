import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  Clock,
  Plus,
  Target,
} from 'lucide-react-native';
import { Image } from 'react-native';

import { colors } from '../theme/colors';

interface MatchDetailModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  visible,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

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
            <ImageBackground
              source={require('../../images/venelles-court.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            >
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
                >
                  <MapPin size={15} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.itineraryText}>Itinéraire</Text>
                </TouchableOpacity>
              </View>

              {/* Title & Location at bottom of hero */}
              <View style={styles.heroBottomText}>
                <Text style={styles.clubTitle}>Avt Association Venelloise ...</Text>
                <Text style={styles.clubSubtitle}>Venelles</Text>
              </View>
            </ImageBackground>
          </View>

          {/* Details Section */}
          <View style={styles.detailsContent}>
            {/* Date & Time Row */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <CalendarDays size={20} color={colors.blue500} style={{ marginRight: 8 }} />
                <Text style={styles.dateTimeText}>Jeudi 22 octobre</Text>
              </View>

              <View style={styles.dateTimeItem}>
                <Clock size={20} color={colors.blue500} style={{ marginRight: 8 }} />
                <Text style={styles.dateTimeText}>16:30</Text>
              </View>
            </View>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={styles.greenBadge}>
                <Text style={styles.greenBadgeText}>Niv. 8</Text>
              </View>

              <View style={styles.yellowBadge}>
                <Text style={styles.yellowBadgeText}>🏆 Compétitif</Text>
              </View>

              <View style={styles.darkBadge}>
                <Text style={styles.darkBadgeText}>1 place libre</Text>
              </View>
            </View>

            {/* Players Section */}
            <Text style={styles.sectionHeader}>Joueurs</Text>

            <View style={styles.playersRow}>
              {/* César */}
              <View style={styles.playerSlot}>
                <View style={styles.avatarCircle}>
                  <Image
                    source={require('../../images/avatar-cesar.png')}
                    style={styles.playerAvatarImg}
                  />
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.playerName}>César</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <View style={styles.purpleLevelBadge}>
                    <Text style={styles.purpleLevelText}>8</Text>
                  </View>
                </View>
              </View>

              {/* Léo */}
              <View style={styles.playerSlot}>
                <View style={[styles.avatarCircle, { backgroundColor: '#334155' }]}>
                  <Text style={styles.avatarInitial}>L</Text>
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.playerName}>Léo</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <View style={styles.purpleLevelBadge}>
                    <Text style={styles.purpleLevelText}>8</Text>
                  </View>
                </View>
              </View>

              {/* VS Divider vertically centered with avatar circles */}
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>vs</Text>
              </View>

              {/* Julien - Thinner yellow ring around avatar */}
              <View style={styles.playerSlot}>
                <View style={[styles.avatarCircle, { borderColor: '#facc15', borderWidth: 1.8 }]}>
                  <Image
                    source={require('../../images/avatar-julien.png')}
                    style={styles.playerAvatarImg}
                  />
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.playerName}>Julien</Text>
                </View>
                <View style={styles.badgeContainer}>
                  <View style={styles.purpleLevelBadge}>
                    <Text style={styles.purpleLevelText}>8</Text>
                  </View>
                </View>
              </View>

              {/* Place libre - 100% vertically and horizontally aligned with the other 3 players */}
              <View style={styles.playerSlot}>
                <View style={styles.dashedSlot}>
                  <Plus size={24} color="#64748b" strokeWidth={2} />
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.freeSlotText} numberOfLines={1}>Place libre</Text>
                </View>
                <View style={styles.badgeContainer} />
              </View>
            </View>

            {/* Notice Card */}
            <View style={styles.noticeCard}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Target size={20} color={colors.blue500} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>
                    L'ajout automatique est réservé aux joueurs de niveau 7 à 8.
                  </Text>
                  <Text style={styles.noticeSubtitle}>
                    En dehors de cet intervalle, ta demande est soumise à validation.
                  </Text>
                </View>
              </View>
            </View>

            {/* Leave match button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.leaveGameBtn}
              onPress={onClose}
            >
              <Text style={styles.leaveGameBtnText}>Quitter la partie</Text>
            </TouchableOpacity>
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
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveGameBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
