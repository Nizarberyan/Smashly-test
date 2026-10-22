import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSwipeable } from './SwipeableTabScreen';
import { Users2, ArrowLeft, UserPlus, Search, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface NetworkScreenProps {
  onGoHome?: () => void;
  onOpenProfile?: () => void;
}

export const NetworkScreen: React.FC<NetworkScreenProps> = ({
  onGoHome,
  onOpenProfile,
}) => {
  const insets = useSafeAreaInsets();
  const { panHandlers } = useSwipeable();

  const mockContacts = [
    {
      id: '1',
      name: 'Julien M.',
      level: 'Niv. 4',
      club: 'Tennis Padel Club Venelles',
      avatar: require('../../images/avatar-julien.png'),
      status: 'En ligne',
    },
    {
      id: '2',
      name: 'César B.',
      level: 'Niv. 8',
      club: 'Country Club Aixois',
      avatar: require('../../images/avatar-cesar.png'),
      status: 'Il y a 2h',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: 4 }]}>
      {/* Top Header (Swipeable down) */}
      <View style={styles.header} {...panHandlers}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconBox}>
            <Users2 size={20} color="#ffffff" strokeWidth={2.2} />
          </View>
          <Text style={styles.headerTitle}>Mon Réseau</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.backBtn}
          onPress={onGoHome}
        >
          <ArrowLeft size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 95,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Network Stats Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryCount}>2 partenaires</Text>
              <Text style={styles.summarySub}>Connectés à Marseille & Venelles</Text>
            </View>
            <TouchableOpacity style={styles.addPlayerBtn} activeOpacity={0.8}>
              <UserPlus size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.addPlayerText}>Inviter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contacts List */}
        <Text style={styles.sectionTitle}>Membres de ton réseau</Text>

        {mockContacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <Image source={contact.avatar} style={styles.contactAvatar} />
            <View style={styles.contactInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>{contact.level}</Text>
                </View>
              </View>
              <Text style={styles.contactClub}>{contact.club}</Text>
              <Text style={styles.contactStatus}>● {contact.status}</Text>
            </View>
          </View>
        ))}

        {/* Protection Notice */}
        <View style={styles.noticeCard}>
          <ShieldCheck size={18} color="#3b82f6" style={{ marginRight: 8 }} />
          <Text style={styles.noticeText}>
            Seuls les membres de votre réseau ou de même niveau (±1) peuvent voir vos disponibilités.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.blue500,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  backBtn: {
    padding: 6,
  },
  scroll: {
    flex: 1,
    paddingTop: 16,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  summarySub: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  addPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue500,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addPlayerText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#38bdf8',
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  levelBadge: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  levelBadgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
  },
  contactClub: {
    fontSize: 12.5,
    color: '#94a3b8',
    marginTop: 2,
  },
  contactStatus: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600',
    marginTop: 4,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    marginTop: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#93c5fd',
    lineHeight: 16,
  },
});
