import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  ToastAndroid,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WelcomeScreen } from './src/components/WelcomeScreen';
import { ProfileScreen } from './src/components/ProfileScreen';
import { OpenMatchesModal } from './src/components/OpenMatchesModal';
import { MatchDetailModal } from './src/components/MatchDetailModal';
import { FiltersModal } from './src/components/FiltersModal';
import { NetworkScreen } from './src/components/NetworkScreen';
import { MapScreen } from './src/components/MapScreen';
import { SwipeableTabScreen } from './src/components/SwipeableTabScreen';
import { BottomNavBar, NavTab } from './src/components/BottomNavBar';
import { AuthModal } from './src/components/AuthModal';
import { MatchesProvider, useMatches } from './src/context/MatchesContext';
import { colors } from './src/theme/colors';

function MainApp() {
  const { isAuthenticated, currentUser } = useMatches();
  // Optional modal state when already authenticated (e.g. from ProfileScreen)
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If not authenticated, the Auth Screen is strictly mandatory and cannot be bypassed
  const isAuthVisible = !isAuthenticated || showAuthModal;

  const [activeTab, setActiveTab] = useState<NavTab>('welcome');
  const [navigationHistory, setNavigationHistory] = useState<NavTab[]>(['welcome']);
  const [showMatchDetail, setShowMatchDetail] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = useCallback((val?: boolean) => {
    setIsDarkMode((prev) => (typeof val === 'boolean' ? val : !prev));
  }, []);

  // Fast, instant tab navigation without sluggish JS-thread animations
  const navigateToTab = useCallback(
    (tab: NavTab) => {
      if (tab === activeTab) return;
      setNavigationHistory((prev) => {
        if (prev[prev.length - 1] === tab) return prev;
        return [...prev, tab];
      });
      setActiveTab(tab);
    },
    [activeTab]
  );

  const returnToChat = useCallback(() => {
    setActiveTab('welcome');
    setNavigationHistory(['welcome']);
  }, []);

  const handleGoBack = useCallback(() => {
    // 0. If user is NOT authenticated, back button must NOT bypass login!
    if (!isAuthenticated) {
      return false; // Handled by 2-tap exit protection
    }

    // 0b. If Auth modal was voluntarily opened by an already-authenticated user, close it
    if (showAuthModal) {
      setShowAuthModal(false);
      return true;
    }

    // 1. If Filter modal is open, close it
    if (showFilters) {
      setShowFilters(false);
      return true;
    }

    // 2. If Match detail modal is open, close it
    if (showMatchDetail) {
      setShowMatchDetail(false);
      return true;
    }

    // 3. If on any tab screen other than chat/welcome, return directly to chat
    if (activeTab !== 'welcome') {
      returnToChat();
      return true;
    }

    // 4. On Welcome screen: return false to allow 2-tap exit protection
    return false;
  }, [isAuthenticated, showAuthModal, showFilters, showMatchDetail, activeTab, returnToChat]);

  // ANDROID HARDWARE BACK BUTTON HANDLER
  useEffect(() => {
    let lastBackPressTime = 0;

    const onHardwareBackPress = () => {
      const handled = handleGoBack();
      if (handled) {
        return true;
      }

      // If user is on Welcome screen: 2-tap exit protection
      if (Platform.OS === 'android') {
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          BackHandler.exitApp();
          return true;
        } else {
          lastBackPressTime = now;
          ToastAndroid.show('Appuyez encore pour quitter', ToastAndroid.SHORT);
          return true;
        }
      }

      return false;
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onHardwareBackPress
    );

    return () => {
      backSubscription.remove();
    };
  }, [handleGoBack]);

  const handleQuickAction = useCallback(() => {
    Alert.alert(
      'Action Rapide',
      'Que souhaitez-vous faire ?',
      [
        {
          text: 'Créer une partie',
          onPress: () => Alert.alert('Création', 'Assistant de création de partie ouvert.'),
        },
        {
          text: 'Trouver un coach',
          onPress: () => Alert.alert('Coachs', 'Affichage des coachs certifiés Smashly.'),
        },
        {
          text: 'Voir mon profil',
          onPress: () => navigateToTab('profile'),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  }, [navigateToTab]);

  return (
    <View style={[styles.container, !isDarkMode && styles.containerLight]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Screen Container: Base Chat Page + Overlay Swipeable Tab Sheet */}
      <View style={styles.screenContainer}>
        {/* Base Chat Page: Always mounted to preserve conversation state & scroll */}
        <WelcomeScreen
          onOpenMatches={() => navigateToTab('courts')}
          onBookCoach={() =>
            Alert.alert('Réserve ton coach', 'Affichage des coachs de padel certifiés Smashly.')
          }
          onQuickAction={handleQuickAction}
          onOpenNetwork={() => navigateToTab('network')}
          onOpenMap={() => navigateToTab('map')}
          onOpenCourts={() => navigateToTab('courts')}
          onOpenProfile={() => navigateToTab('profile')}
          showBottomNav={false}
        />

        {/* Any other action from the bottom navbar slides up as a sheet that can be swiped down */}
        {activeTab !== 'welcome' && (
          <SwipeableTabScreen
            key={activeTab}
            isDarkMode={isDarkMode}
            onDismiss={() => {
              setActiveTab('welcome');
              setNavigationHistory(['welcome']);
            }}
          >
            {activeTab === 'profile' && (
              <ProfileScreen
                onGoHome={returnToChat}
                onOpenMatches={() => navigateToTab('courts')}
                onBookCoach={() =>
                  Alert.alert('Réserve ton coach', 'Affichage des coachs de padel certifiés Smashly.')
                }
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            )}

            {activeTab === 'courts' && (
              <OpenMatchesModal
                visible={true}
                isScreen={true}
                onClose={returnToChat}
                onOpenMatchDetail={(matchId: string) => {
                  setSelectedMatchId(matchId);
                  setShowMatchDetail(true);
                }}
                onOpenFilters={() => setShowFilters(true)}
              />
            )}

            {activeTab === 'network' && (
              <NetworkScreen
                onGoHome={returnToChat}
                onOpenProfile={() => navigateToTab('profile')}
              />
            )}

            {activeTab === 'map' && (
              <MapScreen
                onGoHome={returnToChat}
                onOpenMatches={() => navigateToTab('courts')}
              />
            )}
          </SwipeableTabScreen>
        )}
      </View>

      {/* Match Detail Modal: On-demand mount to save GPU & memory */}
      {showMatchDetail && (
        <MatchDetailModal
          visible={showMatchDetail}
          matchId={selectedMatchId}
          onClose={() => {
            setShowMatchDetail(false);
            setSelectedMatchId(null);
          }}
        />
      )}

      {/* Filters Modal with Swipe-down Dismissal: On-demand mount */}
      {showFilters && (
        <FiltersModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={() => {
            // Apply filters
          }}
        />
      )}

      {/* Auth Screen / Modal: Mandatory when unauthenticated; dismissible only if already logged in */}
      <AuthModal
        visible={isAuthVisible}
        canDismiss={isAuthenticated}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {/* Persistent Floating Bottom Navigation Bar with Instant Response */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        onQuickAction={handleQuickAction}
        avatarUrl={currentUser?.profile_picture_url}
        userInitials={(((currentUser?.first_name?.[0] || 'J') + (currentUser?.last_name?.[0] || 'D'))).toUpperCase()}
        isJulien={!currentUser?.profile_picture_url && currentUser?.first_name?.toLowerCase() === 'julien'}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MatchesProvider>
        <MainApp />
      </MatchesProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerLight: {
    backgroundColor: '#f8fafc',
  },
  screenContainer: {
    flex: 1,
  },
});
