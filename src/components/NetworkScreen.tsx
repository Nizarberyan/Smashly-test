import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Share,
  Platform,
  ToastAndroid,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeable } from './SwipeableTabScreen';
import {
  Users2,
  ArrowLeft,
  UserPlus,
  Search,
  MessageSquare,
  Trophy,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  CircleHelp,
  X,
  Shield,
  Zap,
  Flame,
  Crown,
  Star,
} from 'lucide-react-native';
import { colors } from '../theme/colors';

const getLevelBadgeIcon = (levelNum: number, color: string, size = 12) => {
  if (levelNum >= 8) return <Crown size={size} color={color} strokeWidth={2.4} />;
  if (levelNum === 7) return <Trophy size={size} color={color} strokeWidth={2.4} />;
  if (levelNum >= 5) return <Flame size={size} color={color} strokeWidth={2.4} />;
  if (levelNum >= 3) return <Zap size={size} color={color} strokeWidth={2.4} />;
  return <Shield size={size} color={color} strokeWidth={2.4} />;
};

interface NetworkScreenProps {
  onGoHome?: () => void;
  onOpenProfile?: () => void;
  onOpenMatches?: () => void;
}

type TabMode = 'players' | 'coaches';
type LevelFilter = 'all' | '1-2' | '3-4' | '5-6' | '7-8';

interface CommunityPlayer {
  id: string;
  name: string;
  levelNum: number;
  romanLevel: string;
  levelLabel: string;
  levelColor: string;
  club: string;
  city: string;
  position: 'Gauche' | 'Droite' | 'Polyvalent';
  avatar: any;
  status: string;
  isOnline: boolean;
  matchesPlayed: number;
}

interface CommunityCoach {
  id: string;
  name: string;
  title: string;
  hourlyRate: number;
  club: string;
  rating: number;
  reviewsCount: number;
  avatar: any;
  specialty: string;
}

const COMMUNITY_PLAYERS: CommunityPlayer[] = [
  {
    id: 'p1',
    name: 'Julien M.',
    levelNum: 4,
    romanLevel: 'IV',
    levelLabel: 'Confirmé',
    levelColor: '#84cc16',
    club: 'Tennis Padel Club Venelles',
    city: 'Venelles',
    position: 'Gauche',
    avatar: require('../../images/avatar-julien.png'),
    status: 'En ligne',
    isOnline: true,
    matchesPlayed: 42,
  },
  {
    id: 'p2',
    name: 'César B.',
    levelNum: 8,
    romanLevel: 'VIII',
    levelLabel: 'Legend',
    levelColor: '#f97316',
    club: 'Country Club Aixois',
    city: 'Aix-en-Provence',
    position: 'Polyvalent',
    avatar: require('../../images/avatar-cesar.png'),
    status: 'Il y a 2h',
    isOnline: false,
    matchesPlayed: 118,
  },
  {
    id: 'p3',
    name: 'Sarah L.',
    levelNum: 3,
    romanLevel: 'III',
    levelLabel: 'Intermédiaire',
    levelColor: '#10b981',
    club: 'Set Club Aix',
    city: 'Aix-en-Provence',
    position: 'Droite',
    avatar: { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
    status: 'En ligne',
    isOnline: true,
    matchesPlayed: 24,
  },
  {
    id: 'p4',
    name: 'Thomas D.',
    levelNum: 5,
    romanLevel: 'V',
    levelLabel: 'Avancé',
    levelColor: '#eab308',
    club: 'Win Win Padel',
    city: 'Cabriès',
    position: 'Gauche',
    avatar: { uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
    status: 'Hier',
    isOnline: false,
    matchesPlayed: 65,
  },
  {
    id: 'p5',
    name: 'Maxime R.',
    levelNum: 2,
    romanLevel: 'II',
    levelLabel: 'Initié',
    levelColor: '#06b6d4',
    club: 'AVT Padel Club',
    city: 'Marseille',
    position: 'Polyvalent',
    avatar: { uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    status: 'En ligne',
    isOnline: true,
    matchesPlayed: 15,
  },
];

const COMMUNITY_COACHES: CommunityCoach[] = [
  {
    id: 'c1',
    name: 'Marc Antoine',
    title: 'Coach Certifié FFT Padel',
    hourlyRate: 50,
    club: 'Tennis Padel Club Venelles',
    rating: 4.9,
    reviewsCount: 38,
    avatar: { uri: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' },
    specialty: 'Tactique Bandeja & Sorties de vitre',
  },
  {
    id: 'c2',
    name: 'Élodie Fontaine',
    title: 'Ancienne Joueuse Pro & Coach',
    hourlyRate: 60,
    club: 'Country Club Aixois',
    rating: 5.0,
    reviewsCount: 52,
    avatar: { uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
    specialty: 'Préparation physique & Vibora',
  },
];

export const NetworkScreen: React.FC<NetworkScreenProps> = ({
  onGoHome,
  onOpenMatches,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();

  const [activeTab, setActiveTab] = useState<TabMode>('players');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLevelModal, setShowLevelModal] = useState(false);

  const inviteUrl = 'https://smashlyai.com/invite/nizar-padel';

  const handleShareInvite = async () => {
    try {
      await Share.share({
        title: 'Rejoins-moi sur Smashly AI',
        message: `Trouve des partenaires de padel à ton niveau et joue avec moi sur Smashly AI : ${inviteUrl}`,
        url: inviteUrl,
      });
    } catch {
      // Ignored
    }
  };

  const handleMessagePlayer = useCallback((player: CommunityPlayer) => {
    Alert.alert(
      `Discuter avec ${player.name}`,
      `Veux-tu envoyer un message ou proposer une partie à ${player.name} (${player.romanLevel} - ${player.levelLabel}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir le chat', onPress: onGoHome },
      ]
    );
  }, [onGoHome]);

  const handleProposeMatch = useCallback((player: CommunityPlayer) => {
    Alert.alert(
      `Proposer une partie`,
      `Inviter ${player.name} à une prochaine partie de padel ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Voir les parties', onPress: onOpenMatches },
      ]
    );
  }, [onOpenMatches]);

  const handleBookCoach = useCallback((coach: CommunityCoach) => {
    Alert.alert(
      `Réserver avec ${coach.name}`,
      `Tarif : ${coach.hourlyRate}€ / heure à ${coach.club}.\nSpécialité : ${coach.specialty}`,
      [
        { text: 'Fermer', style: 'cancel' },
        {
          text: 'Réserver un créneau',
          onPress: () => {
            Alert.alert('Demande envoyée', `Votre demande de réservation avec ${coach.name} a été transmise !`);
          },
        },
      ]
    );
  }, []);

  const filteredPlayers = useMemo(() => {
    return COMMUNITY_PLAYERS.filter((player) => {
      // Level filter
      if (levelFilter === '1-2' && (player.levelNum < 1 || player.levelNum > 2)) return false;
      if (levelFilter === '3-4' && (player.levelNum < 3 || player.levelNum > 4)) return false;
      if (levelFilter === '5-6' && (player.levelNum < 5 || player.levelNum > 6)) return false;
      if (levelFilter === '7-8' && (player.levelNum < 7 || player.levelNum > 8)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = player.name.toLowerCase().includes(q);
        const matchesClub = player.club.toLowerCase().includes(q);
        const matchesCity = player.city.toLowerCase().includes(q);
        return matchesName || matchesClub || matchesCity;
      }

      return true;
    });
  }, [levelFilter, searchQuery]);

  const filteredCoaches = useMemo(() => {
    if (!searchQuery.trim()) return COMMUNITY_COACHES;
    const q = searchQuery.toLowerCase().trim();
    return COMMUNITY_COACHES.filter((coach) => {
      return (
        coach.name.toLowerCase().includes(q) ||
        coach.club.toLowerCase().includes(q) ||
        coach.specialty.toLowerCase().includes(q) ||
        coach.title.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const renderPlayerItem = useCallback(
    ({ item: player }: { item: CommunityPlayer }) => (
      <View style={styles.playerCard}>
        <View style={styles.playerCardTop}>
          {/* Avatar with status dot */}
          <View style={styles.avatarWrapper}>
            <Image
              source={player.avatar}
              style={[styles.playerAvatar, { borderColor: player.levelColor }]}
            />
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: player.isOnline ? '#22c55e' : '#94a3b8' },
              ]}
            />
          </View>

          {/* Info */}
          <View style={styles.playerMainInfo}>
            <View style={styles.playerNameRow}>
              <Text style={styles.playerName}>{player.name}</Text>
              <View
                style={[
                  styles.levelBadge,
                  { borderColor: `${player.levelColor}60`, backgroundColor: `${player.levelColor}18` },
                ]}
              >
                {getLevelBadgeIcon(player.levelNum, player.levelColor, 12)}
                <Text style={[styles.levelBadgeText, { color: player.levelColor }]}>
                  Niv. {player.romanLevel}
                </Text>
              </View>
            </View>

            <View style={styles.clubLocationRow}>
              <MapPin size={12} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text style={styles.clubText} numberOfLines={1}>
                {player.club} · {player.city}
              </Text>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>Côté {player.position}</Text>
              </View>
              <View style={styles.tagPill}>
                <Text style={styles.tagPillText}>{player.matchesPlayed} parties</Text>
              </View>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDotSmall,
                    { backgroundColor: player.isOnline ? '#22c55e' : '#64748b' },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: player.isOnline ? '#22c55e' : '#94a3b8' },
                  ]}
                >
                  {player.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.playerCardActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionBtnOutline}
            onPress={() => handleMessagePlayer(player)}
            accessibilityRole="button"
            accessibilityLabel={`Envoyer un message à ${player.name}`}
          >
            <MessageSquare size={14} color="#93c5fd" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnOutlineText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.actionBtnSolid}
            onPress={() => handleProposeMatch(player)}
            accessibilityRole="button"
            accessibilityLabel={`Proposer une partie à ${player.name}`}
          >
            <Trophy size={14} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnSolidText}>Proposer une partie</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [handleMessagePlayer, handleProposeMatch]
  );

  const renderCoachItem = useCallback(
    ({ item: coach }: { item: CommunityCoach }) => (
      <View style={styles.coachCard}>
        <View style={styles.coachCardTop}>
          <Image source={coach.avatar} style={styles.coachAvatar} />
          <View style={styles.coachMainInfo}>
            <View style={styles.coachNameRow}>
              <View style={styles.coachNameWithBadge}>
                <Text style={styles.coachName}>{coach.name}</Text>
                <View style={styles.coachProBadge}>
                  <Award size={11} color="#facc15" strokeWidth={2.4} />
                  <Text style={styles.coachProBadgeText}>PRO</Text>
                </View>
              </View>
              <View style={styles.coachPriceBadge}>
                <Text style={styles.coachPriceText}>{coach.hourlyRate}€ / h</Text>
              </View>
            </View>

            <View style={styles.coachTitleRatingRow}>
              <Text style={styles.coachTitle}>{coach.title}</Text>
              <View style={styles.coachRatingBadge}>
                <Star size={11} color="#facc15" fill="#facc15" />
                <Text style={styles.coachRatingText}>{coach.rating.toFixed(1)}</Text>
                <Text style={styles.coachReviewsText}>({coach.reviewsCount})</Text>
              </View>
            </View>

            <View style={styles.clubLocationRow}>
              <MapPin size={12} color="#94a3b8" style={{ marginRight: 4 }} />
              <Text style={styles.clubText}>{coach.club}</Text>
            </View>

            <View style={styles.coachSpecialtyRow}>
              <Zap size={12} color="#facc15" strokeWidth={2.4} style={{ marginRight: 5 }} />
              <Text style={styles.coachSpecialty}>{coach.specialty}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.coachBookBtn}
          onPress={() => handleBookCoach(coach)}
          accessibilityRole="button"
          accessibilityLabel={`Réserver un cours avec ${coach.name}`}
        >
          <Calendar size={15} color="#0f172a" style={{ marginRight: 8 }} />
          <Text style={styles.coachBookBtnText}>Réserver un cours avec {coach.name.split(' ')[0]}</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleBookCoach]
  );

  const renderListHeader = useMemo(
    () => (
      <>
        {/* Search Bar */}
        <View style={[styles.searchBar, activeTab === 'coaches' && { marginBottom: 14 }]}>
          <Search size={18} color="#94a3b8" style={{ marginRight: 10 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              activeTab === 'players'
                ? 'Rechercher un joueur, un club, une ville...'
                : 'Rechercher un coach ou spécialité...'
            }
            placeholderTextColor="#64748b"
            style={styles.searchInput}
            accessibilityLabel={
              activeTab === 'players'
                ? 'Rechercher un joueur, un club, une ville'
                : 'Rechercher un coach ou spécialité'
            }
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
              style={styles.searchClearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={15} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* LEVEL FILTER PILLS (Only for players tab) */}
        {activeTab === 'players' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.levelFilterScrollView}
            contentContainerStyle={styles.levelFilterScroll}
          >
            {[
              { key: 'all', label: 'Tous' },
              { key: '1-2', label: 'Niv. 1-2 (Débutant)' },
              { key: '3-4', label: 'Niv. 3-4 (Intermédiaire)' },
              { key: '5-6', label: 'Niv. 5-6 (Avancé)' },
              { key: '7-8', label: 'Niv. 7-8 (Expert/Legend)' },
            ].map((f) => {
              const active = levelFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  activeOpacity={0.8}
                  style={[styles.levelFilterPill, active && styles.levelFilterPillActive]}
                  onPress={() => setLevelFilter(f.key as LevelFilter)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtre niveau ${f.label}`}
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[
                      styles.levelFilterText,
                      active && styles.levelFilterTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </>
    ),
    [activeTab, levelFilter, searchQuery]
  );

  return (
    <View style={[styles.container, { paddingTop: 4 }]}>
      {/* Top Header */}
      <View style={styles.header} {...panHandlers}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <Users2 size={20} color="#ffffff" strokeWidth={2.2} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Mon Réseau</Text>
            <Text style={styles.headerSub}>Partenaires & Coachs Smashly</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.helpHeaderBtn}
            onPress={() => setShowLevelModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Guide de l'échelle des 8 niveaux Smashly"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CircleHelp size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.inviteHeaderBtn}
            onPress={handleShareInvite}
            accessibilityRole="button"
            accessibilityLabel="Inviter des partenaires"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <UserPlus size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.inviteHeaderBtnText}>Inviter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.backBtn}
            onPress={onGoHome}
            accessibilityRole="button"
            accessibilityLabel="Retour à l'accueil"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeft size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Tab: Joueurs vs Coachs */}
      <View style={styles.tabSwitcherWrapper}>
        <View style={styles.tabSwitcher} accessibilityRole="tablist">
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabSwitchBtn, activeTab === 'players' && styles.tabSwitchBtnActive]}
            onPress={() => setActiveTab('players')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'players' }}
            accessibilityLabel={`Afficher la liste des joueurs, ${COMMUNITY_PLAYERS.length} joueurs`}
          >
            <Users2
              size={16}
              color={activeTab === 'players' ? '#ffffff' : '#94a3b8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabSwitchText,
                activeTab === 'players' && styles.tabSwitchTextActive,
              ]}
            >
              Joueurs ({COMMUNITY_PLAYERS.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabSwitchBtn, activeTab === 'coaches' && styles.tabSwitchBtnActive]}
            onPress={() => setActiveTab('coaches')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'coaches' }}
            accessibilityLabel={`Afficher la liste des coachs, ${COMMUNITY_COACHES.length} coachs certifiés`}
          >
            <Award
              size={16}
              color={activeTab === 'coaches' ? '#ffffff' : '#94a3b8'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabSwitchText,
                activeTab === 'coaches' && styles.tabSwitchTextActive,
              ]}
            >
              Coachs certifiés ({COMMUNITY_COACHES.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'players' ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(p) => p.id}
          renderItem={renderPlayerItem}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Users2 size={24} color="#64748b" />
              </View>
              <Text style={styles.emptyTitle}>Aucun joueur trouvé</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? `Aucun profil ne correspond à "${searchQuery}".`
                  : 'Aucun joueur disponible dans ce groupe de niveaux pour le moment.'}
              </Text>
              {(searchQuery.trim().length > 0 || levelFilter !== 'all') && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setSearchQuery('');
                    setLevelFilter('all');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Réinitialiser les filtres de recherche"
                >
                  <Text style={styles.emptyResetBtnText}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: insets.bottom + 115,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      ) : (
        <FlatList
          data={filteredCoaches}
          keyExtractor={(c) => c.id}
          renderItem={renderCoachItem}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Award size={24} color="#64748b" />
              </View>
              <Text style={styles.emptyTitle}>Aucun coach trouvé</Text>
              <Text style={styles.emptySub}>
                {searchQuery
                  ? `Aucun coach certifié ne correspond à "${searchQuery}".`
                  : 'Aucun coach disponible pour le moment.'}
              </Text>
              {searchQuery.trim().length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.emptyResetBtn}
                  onPress={() => setSearchQuery('')}
                  accessibilityRole="button"
                  accessibilityLabel="Effacer la recherche"
                >
                  <Text style={styles.emptyResetBtnText}>Effacer la recherche</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          style={styles.scroll}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: insets.bottom + 115,
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
        />
      )}

      {/* Level System Info Pop-up Modal */}
      <Modal
        visible={showLevelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLevelModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLevelModal(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalSparkleBox}>
                  <Sparkles size={18} color="#facc15" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Échelle des 8 Niveaux</Text>
                  <Text style={styles.modalSub}>Standard officiel Smashly AI</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.modalCloseBtn}
                onPress={() => setShowLevelModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Fermer la fenêtre"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Matchmaking Info Note */}
            <View style={styles.modalRuleNote}>
              <View style={styles.modalRuleHeader}>
                <Shield size={14} color="#38bdf8" style={{ marginRight: 6 }} />
                <Text style={styles.modalRuleHeaderTitle}>Parties équilibrées (±1 niveau max)</Text>
              </View>
              <Text style={styles.modalRuleText}>
                L'écart entre joueurs sur Smashly est strictement limité à <Text style={{ fontWeight: '700', color: '#38bdf8' }}>±1 niveau</Text> pour garantir des matchs disputés, équitables et passionnants.
              </Text>
            </View>

            {/* 8-Level 2-Column Grid */}
            <View style={styles.modalLevelGrid}>
              {[
                { roman: 'I', label: 'Starter', color: '#3b82f6', desc: 'Bases & découverte' },
                { roman: 'II', label: 'Initié', color: '#06b6d4', desc: 'Échanges réguliers' },
                { roman: 'III', label: 'Intermédiaire', color: '#10b981', desc: 'Vitres & volées' },
                { roman: 'IV', label: 'Confirmé', color: '#84cc16', desc: 'Bandejas & tactique' },
                { roman: 'V', label: 'Avancé', color: '#eab308', desc: 'Rythme & smashs' },
                { roman: 'VI', label: 'Expert', color: '#f59e0b', desc: 'Tournois P25/P100' },
                { roman: 'VII', label: 'Challenger', color: '#ef4444', desc: 'Compétition P250+' },
                { roman: 'VIII', label: 'Legend', color: '#f97316', desc: 'Élite nationale' },
              ].map((lvl, idx) => (
                <View key={lvl.roman} style={styles.modalLevelItem}>
                  <View style={[styles.modalLevelCircle, { backgroundColor: lvl.color }]}>
                    {getLevelBadgeIcon(idx + 1, '#ffffff', 13)}
                  </View>
                  <View style={styles.modalLevelInfo}>
                    <Text style={styles.modalLevelTitle}>
                      {lvl.roman} · {lvl.label}
                    </Text>
                    <Text style={styles.modalLevelDesc} numberOfLines={1}>
                      {lvl.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Bottom Primary Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalPrimaryBtn}
              onPress={() => setShowLevelModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Fermer le guide des niveaux"
            >
              <Text style={styles.modalPrimaryBtnText}>Compris !</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    borderRadius: 12,
    backgroundColor: colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSub: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue500,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  inviteHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  backBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  tabSwitcherWrapper: {
    backgroundColor: '#0a0f1d',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 10,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#131b2e',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#232f48',
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabSwitchBtnActive: {
    backgroundColor: '#2563eb',
  },
  tabSwitchText: {
    color: '#94a3b8',
    fontSize: 12.5,
    fontWeight: '600',
  },
  tabSwitchTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b2e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#232f48',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
  },
  searchClearBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelFilterScrollView: {
    marginBottom: 14,
  },
  levelFilterScroll: {
    gap: 8,
    paddingRight: 16,
  },
  levelFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#232f48',
  },
  levelFilterPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#38bdf8',
  },
  levelFilterText: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  levelFilterTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  emptyBox: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#232f48',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 280,
  },
  emptyResetBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    color: '#38bdf8',
    fontSize: 12.5,
    fontWeight: '700',
  },
  playerCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#232f48',
    marginBottom: 12,
  },
  playerCardTop: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
    width: 48,
    height: 48,
    alignSelf: 'flex-start',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#131b2e',
  },
  playerMainInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  clubLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clubText: {
    fontSize: 12,
    color: '#94a3b8',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagPill: {
    backgroundColor: '#0a0f1d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagPillText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  playerCardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionBtnOutlineText: {
    color: '#93c5fd',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSolid: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.blue500,
  },
  actionBtnSolidText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  coachCard: {
    backgroundColor: '#131b2e',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#232f48',
    marginBottom: 12,
  },
  coachCardTop: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  coachAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#facc15',
  },
  coachMainInfo: {
    flex: 1,
  },
  coachNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  coachNameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coachName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  coachProBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  coachProBadgeText: {
    color: '#facc15',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coachPriceBadge: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#facc15',
  },
  coachPriceText: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '800',
  },
  coachTitleRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  coachRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coachRatingText: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: '800',
  },
  coachReviewsText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '500',
  },
  coachTitle: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  coachSpecialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  coachSpecialty: {
    fontSize: 11.5,
    color: '#cbd5e1',
    flex: 1,
  },
  coachBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    backgroundColor: '#facc15',
    paddingVertical: 10,
    borderRadius: 10,
  },
  coachBookBtnText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  helpHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#232f48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#131b2e',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#232f48',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalSparkleBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalSub: {
    fontSize: 11.5,
    color: '#94a3b8',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRuleNote: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginBottom: 14,
  },
  modalRuleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  modalRuleHeaderTitle: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  modalRuleText: {
    color: '#94a3b8',
    fontSize: 11.5,
    lineHeight: 16,
  },
  modalLevelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalLevelItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalLevelCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  modalLevelCircleText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '900',
  },
  modalLevelInfo: {
    flex: 1,
  },
  modalLevelTitle: {
    color: '#f8fafc',
    fontSize: 11.5,
    fontWeight: '700',
  },
  modalLevelDesc: {
    color: '#94a3b8',
    fontSize: 9.5,
    marginTop: 1,
  },
  modalPrimaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
