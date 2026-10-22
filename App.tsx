import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WelcomeScreen } from './src/components/WelcomeScreen';
import { OpenMatchesModal } from './src/components/OpenMatchesModal';
import { MatchDetailModal } from './src/components/MatchDetailModal';
import { FiltersModal } from './src/components/FiltersModal';
import { colors } from './src/theme/colors';

export default function App() {
  const [showOpenMatches, setShowOpenMatches] = useState(false);
  const [showMatchDetail, setShowMatchDetail] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Welcome Screen (Home) */}
        <WelcomeScreen
          onOpenMatches={() => setShowOpenMatches(true)}
          onBookCoach={() =>
            Alert.alert('Réserve ton coach', 'Affichage des coachs de padel certifiés Smashly.')
          }
          onQuickAction={() =>
            Alert.alert('Action Rapide', 'Création rapide de partie ou recherche instantanée.')
          }
          onOpenNetwork={() =>
            Alert.alert('Communauté', 'Voir les joueurs de ton réseau.')
          }
          onOpenMap={() =>
            Alert.alert('Smashly Map', 'Carte des terrains de padel et des parties autour de toi.')
          }
          onOpenCourts={() =>
            Alert.alert('Terrains', 'Consulter les clubs et pistes disponibles.')
          }
          onOpenProfile={() =>
            Alert.alert('Profil', 'Affichage de ton profil joueur / coach.')
          }
        />

        {/* Open Matches Modal (Parties ouvertes) */}
        <OpenMatchesModal
          visible={showOpenMatches}
          onClose={() => setShowOpenMatches(false)}
          onOpenMatchDetail={() => setShowMatchDetail(true)}
          onOpenFilters={() => setShowFilters(true)}
        />

        {/* Match Detail Modal (Card view) */}
        <MatchDetailModal
          visible={showMatchDetail}
          onClose={() => setShowMatchDetail(false)}
        />

        {/* Filters Modal */}
        <FiltersModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={() => {
            // Re-apply filters feedback
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
