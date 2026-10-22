import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MapPin, Target, Trophy } from 'lucide-react-native';

import { colors } from '../theme/colors';

interface FiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const insets = useSafeAreaInsets();
  const [onlyMyLevel, setOnlyMyLevel] = useState(false);
  const [format, setFormat] = useState<'all' | 'friendly' | 'competitive'>('competitive');
  const [distance, setDistance] = useState(100);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtres</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.closeBtn}
              onPress={onClose}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Rayon de recherche */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <MapPin size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Rayon de recherche</Text>
                </View>
                <Text style={styles.sectionValue}>{distance} km</Text>
              </View>

              {/* Slider Track Representation */}
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: '65%' }]} />
                <View style={[styles.sliderThumb, { left: '65%' }]} />
              </View>

              <Text style={styles.sectionHint}>Distance autour de ta ville</Text>
            </View>

            {/* Section 2: Niveau Smashly */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <Target size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Niveau Smashly</Text>
                </View>
                <Text style={styles.sectionValue}>0.0 - 7.0</Text>
              </View>

              <Text style={styles.sectionHint}>
                Niveau Smashly moyen des joueurs inscrits
              </Text>

              {/* Toggle Box: Uniquement mon niveau */}
              <View style={styles.toggleCard}>
                <Text style={styles.toggleLabel}>
                  Uniquement mon niveau Smashly (±1)
                </Text>
                <Switch
                  value={onlyMyLevel}
                  onValueChange={setOnlyMyLevel}
                  trackColor={{ false: '#334155', true: colors.blue500 }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Min Level Slider */}
              <View style={styles.subSliderSection}>
                <View style={styles.subSliderHeader}>
                  <Text style={styles.subSliderLabel}>Niveau minimum</Text>
                  <Text style={styles.subSliderValue}>0.0</Text>
                </View>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: '0%' }]} />
                  <View style={[styles.sliderThumb, { left: '0%' }]} />
                </View>
              </View>

              {/* Max Level Slider */}
              <View style={styles.subSliderSection}>
                <View style={styles.subSliderHeader}>
                  <Text style={styles.subSliderLabel}>Niveau maximum</Text>
                  <Text style={styles.subSliderValue}>7.0</Text>
                </View>
                <View style={styles.sliderTrack}>
                  <View style={[styles.sliderFill, { width: '100%' }]} />
                  <View style={[styles.sliderThumb, { left: '95%' }]} />
                </View>
              </View>
            </View>

            {/* Section 3: Format */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <Trophy size={18} color="#94a3b8" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Format</Text>
                </View>
              </View>

              <View style={styles.formatButtonsRow}>
                {/* Tous */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.formatBtn,
                    format === 'all' && styles.formatBtnActive,
                  ]}
                  onPress={() => setFormat('all')}
                >
                  <Text style={styles.formatBtnText}>Tous</Text>
                </TouchableOpacity>

                {/* Amical */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.formatBtn,
                    format === 'friendly' && styles.formatBtnActive,
                  ]}
                  onPress={() => setFormat('friendly')}
                >
                  <Text style={styles.formatBtnText}>🤝 Amical</Text>
                </TouchableOpacity>

                {/* Compétitif */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.formatBtn,
                    styles.formatBtnCompetitive,
                    format === 'competitive' && styles.formatBtnCompetitiveActive,
                  ]}
                  onPress={() => setFormat('competitive')}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      format === 'competitive' && { color: '#0f172a', fontWeight: '700' },
                    ]}
                  >
                    🏆 Compétitif
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.clearBtn}
              onPress={onClose}
            >
              <Text style={styles.clearBtnText}>✕ Effacer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.applyBtn}
              onPress={() => {
                onApply();
                onClose();
              }}
            >
              <Text style={styles.applyBtnText}>Voir 1 partie</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#1e293b',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionValue: {
    color: colors.blue500,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    position: 'relative',
    marginVertical: 10,
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.blue500,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: -10,
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0a0f1d',
    borderColor: '#1e293b',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 12,
  },
  toggleLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  subSliderSection: {
    marginTop: 12,
  },
  subSliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subSliderLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  subSliderValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  formatButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  formatBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  formatBtnActive: {
    backgroundColor: colors.blue500,
    borderColor: colors.blue500,
  },
  formatBtnCompetitive: {
    backgroundColor: '#1e293b',
  },
  formatBtnCompetitiveActive: {
    backgroundColor: colors.yellow400,
    borderColor: colors.yellow400,
  },
  formatBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  clearBtnText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1.5,
    backgroundColor: colors.blue500,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
