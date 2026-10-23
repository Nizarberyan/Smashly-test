import React, { memo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users2, Map, Plus } from 'lucide-react-native';

import { colors } from '../theme/colors';
import { PadelCourtIcon } from './PadelCourtIcon';

export type NavTab = 'welcome' | 'network' | 'map' | 'courts' | 'profile';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickAction?: () => void;
  avatarUrl?: string | null;
  userInitials?: string;
  isJulien?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = memo(({
  activeTab,
  onSelectTab,
  onQuickAction,
  avatarUrl,
  userInitials = 'J',
  isJulien = true,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 16),
        },
      ]}
      accessibilityRole="tablist"
    >
      <View style={styles.navBar}>
        {/* 1. Network / Community */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.navButton, activeTab === 'network' && styles.activeNavButton]}
          onPress={() => onSelectTab('network')}
          accessibilityRole="tab"
          accessibilityLabel="Communauté et réseau"
          accessibilityState={{ selected: activeTab === 'network' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Users2
            size={24}
            color={activeTab === 'network' ? colors.yellow400 : '#e2e8f0'}
            strokeWidth={activeTab === 'network' ? 2.5 : 2}
          />
          {activeTab === 'network' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* 2. Map */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.navButton, activeTab === 'map' && styles.activeNavButton]}
          onPress={() => onSelectTab('map')}
          accessibilityRole="tab"
          accessibilityLabel="Carte des clubs et joueurs"
          accessibilityState={{ selected: activeTab === 'map' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Map
            size={24}
            color={activeTab === 'map' ? colors.yellow400 : '#e2e8f0'}
            strokeWidth={activeTab === 'map' ? 2.5 : 2}
          />
          {activeTab === 'map' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* 3. Center Gradient + Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.plusButtonContainer}
          onPress={onQuickAction ? onQuickAction : () => onSelectTab('welcome')}
          accessibilityRole="button"
          accessibilityLabel="Action rapide ou accueil Smashly"
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <LinearGradient
            colors={[colors.blue500, colors.yellow400]}
            locations={[0.15, 0.85]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.plusGradient}
          >
            <Plus size={24} color="#0f172a" strokeWidth={2.8} />
          </LinearGradient>
        </TouchableOpacity>

        {/* 4. Padel Court Icon (Open Matches) */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.navButton, activeTab === 'courts' && styles.activeNavButton]}
          onPress={() => onSelectTab('courts')}
          accessibilityRole="tab"
          accessibilityLabel="Parties ouvertes et réservation de pistes"
          accessibilityState={{ selected: activeTab === 'courts' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <PadelCourtIcon
            size={25}
            color={activeTab === 'courts' ? colors.yellow400 : '#e2e8f0'}
            strokeWidth={activeTab === 'courts' ? 2.5 : 2}
          />
          {activeTab === 'courts' && <View style={styles.activeDot} />}
        </TouchableOpacity>

        {/* 5. User Profile Logo / Avatar */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.profileButton}
          onPress={() => onSelectTab('profile')}
          accessibilityRole="tab"
          accessibilityLabel="Profil utilisateur et paramètres"
          accessibilityState={{ selected: activeTab === 'profile' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <View
            style={[
              styles.avatarBorder,
              activeTab === 'profile' && styles.avatarBorderActive,
            ]}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
                fadeDuration={0}
              />
            ) : isJulien ? (
              <Image
                source={require('../../images/avatar-julien.png')}
                style={styles.avatarImage}
                resizeMode="cover"
                fadeDuration={0}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>{userInitials}</Text>
              </View>
            )}
          </View>
          {activeTab === 'profile' && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
});

BottomNavBar.displayName = 'BottomNavBar';

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  navBar: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bottomBarBg,
    borderColor: colors.bottomBarBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  navButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  activeNavButton: {},
  activeDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.yellow400,
  },
  plusButtonContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
  avatarBorder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  avatarBorderActive: {
    borderColor: colors.yellow400,
    borderWidth: 2.5,
    shadowColor: colors.yellow400,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  initialsAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
