import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MapPin, Target, Trophy, Sparkles, RotateCcw } from 'lucide-react-native';

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
  const [minLevel, setMinLevel] = useState(0.0);
  const [maxLevel, setMaxLevel] = useState(7.0);

  // Animation values offloaded to native thread
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(450)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const sliderWidthAnim = useRef(new Animated.Value(65)).current;

  // Touch gesture handler for swiping down to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only claim gesture if dragging downwards
        return gestureState.dy > 4;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.4) {
          // Swipe down threshold reached: dismiss sheet smoothly offscreen
          Animated.parallel([
            Animated.timing(backdropAnim, {
              toValue: 0,
              duration: 140,
              useNativeDriver: true,
            }),
            Animated.timing(panY, {
              toValue: 650,
              duration: 160,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
          });
        } else {
          // Snap back to 0
          Animated.spring(panY, {
            toValue: 0,
            tension: 85,
            friction: 9,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      slideAnim.setValue(450);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 75,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(450);
      panY.setValue(0);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 450,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSelectFormat = (selected: 'all' | 'friendly' | 'competitive') => {
    setFormat(selected);
  };

  const handleSelectDistance = (d: number, pct: number) => {
    setDistance(d);
    Animated.spring(sliderWidthAnim, {
      toValue: pct,
      tension: 90,
      friction: 10,
      useNativeDriver: false,
    }).start();
  };

  const handleReset = () => {
    setOnlyMyLevel(false);
    setFormat('competitive');
    setDistance(100);
    setMinLevel(0.0);
    setMaxLevel(7.0);
    sliderWidthAnim.setValue(65);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Animated Dimmed Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Animated Bottom Sheet with PanGesture Downward Drag */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: Animated.add(slideAnim, panY) }],
            },
          ]}
        >
          {/* Touch Gesture Zone: Drag handle + Header */}
          <View {...panResponder.panHandlers} style={styles.gestureHeaderZone}>
            {/* Affordance Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <Text style={styles.title}>Filtres</Text>
                <View style={styles.badgeActive}>
                  <Sparkles size={12} color="#facc15" style={{ marginRight: 4 }} />
                  <Text style={styles.badgeActiveText}>1 actif</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeBtn}
                onPress={handleClose}
              >
                <X size={19} color="#94a3b8" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Rayon de recherche */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <MapPin size={18} color="#38bdf8" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Rayon de recherche</Text>
                </View>
                <Text style={styles.sectionValue}>{distance} km</Text>
              </View>

              {/* Distance Presets */}
              <View style={styles.distancePresetsRow}>
                {[15, 30, 50, 100, 200].map((d) => {
                  const pctMap: Record<number, number> = {
                    15: 15,
                    30: 32,
                    50: 50,
                    100: 65,
                    200: 95,
                  };
                  const isSelected = distance === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.7}
                      style={[
                        styles.distancePresetPill,
                        isSelected && styles.distancePresetPillActive,
                      ]}
                      onPress={() => handleSelectDistance(d, pctMap[d])}
                    >
                      <Text
                        style={[
                          styles.distancePresetText,
                          isSelected && styles.distancePresetTextActive,
                        ]}
                      >
                        {d}km
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Slider Track with Animated Fill & Glowing Thumb */}
              <View style={styles.sliderTrack}>
                <Animated.View
                  style={[
                    styles.sliderFill,
                    {
                      width: sliderWidthAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.sliderThumb,
                    {
                      left: sliderWidthAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '95%'],
                      }),
                    },
                  ]}
                >
                  <View style={styles.sliderThumbCenter} />
                </Animated.View>
              </View>

              <Text style={styles.sectionHint}>Distance autour de ta ville (Marseille / Venelles)</Text>
            </View>

            {/* Section 2: Niveau Smashly */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <Target size={18} color="#facc15" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Niveau Smashly</Text>
                </View>
                <Text style={styles.sectionValue}>
                  {minLevel.toFixed(1)} - {maxLevel.toFixed(1)}
                </Text>
              </View>

              <Text style={styles.sectionHint}>
                Niveau Smashly moyen des joueurs inscrits
              </Text>

              {/* Toggle Box: Uniquement mon niveau */}
              <View style={styles.toggleCard}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.toggleLabel}>
                    Uniquement mon niveau Smashly (±1)
                  </Text>
                  <Text style={styles.toggleSub}>
                    Filtre automatiquement les parties compatibles avec ton niveau
                  </Text>
                </View>
                <Switch
                  value={onlyMyLevel}
                  onValueChange={setOnlyMyLevel}
                  trackColor={{ false: '#334155', true: colors.blue500 }}
                  thumbColor="#ffffff"
                />
              </View>

              {/* Quick Level Filters */}
              <View style={styles.levelPresetsRow}>
                {[
                  { label: 'Tous', min: 0.0, max: 9.0 },
                  { label: 'Débutant (1-3)', min: 1.0, max: 3.5 },
                  { label: 'Intermédiaire (3-6)', min: 3.0, max: 6.0 },
                  { label: 'Avancé (6+)', min: 6.0, max: 9.0 },
                ].map((lvl) => {
                  const isCurrent = minLevel === lvl.min && maxLevel === lvl.max;
                  return (
                    <TouchableOpacity
                      key={lvl.label}
                      activeOpacity={0.75}
                      style={[
                        styles.levelPresetPill,
                        isCurrent && styles.levelPresetPillActive,
                      ]}
                      onPress={() => {
                        setMinLevel(lvl.min);
                        setMaxLevel(lvl.max);
                      }}
                    >
                      <Text
                        style={[
                          styles.levelPresetText,
                          isCurrent && styles.levelPresetTextActive,
                        ]}
                      >
                        {lvl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Format */}
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleLeft}>
                  <Trophy size={18} color="#eab308" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Format de jeu</Text>
                </View>
              </View>

              <View style={styles.formatButtonsRow}>
                {/* Tous */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.formatBtn,
                    format === 'all' && styles.formatBtnActive,
                  ]}
                  onPress={() => handleSelectFormat('all')}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      format === 'all' && styles.formatBtnTextActive,
                    ]}
                  >
                    Tous
                  </Text>
                </TouchableOpacity>

                {/* Amical */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.formatBtn,
                    format === 'friendly' && styles.formatBtnActive,
                  ]}
                  onPress={() => handleSelectFormat('friendly')}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      format === 'friendly' && styles.formatBtnTextActive,
                    ]}
                  >
                    🤝 Amical
                  </Text>
                </TouchableOpacity>

                {/* Compétitif */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.formatBtn,
                    styles.formatBtnCompetitive,
                    format === 'competitive' && styles.formatBtnCompetitiveActive,
                  ]}
                  onPress={() => handleSelectFormat('competitive')}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      format === 'competitive' && {
                        color: '#0f172a',
                        fontWeight: '800',
                      },
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
              activeOpacity={0.7}
              style={styles.clearBtn}
              onPress={handleReset}
            >
              <RotateCcw size={15} color="#cbd5e1" style={{ marginRight: 6 }} />
              <Text style={styles.clearBtnText}>Effacer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.applyBtn}
              onPress={() => {
                onApply();
                handleClose();
              }}
            >
              <Text style={styles.applyBtnText}>Voir 1 partie</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 10, 20, 0.72)',
  },
  bottomSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  gestureHeaderZone: {
    paddingBottom: 2,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#475569',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgeActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  badgeActiveText: {
    color: '#facc15',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  section: {
    marginBottom: 22,
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
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
  },
  distancePresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  distancePresetPill: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  distancePresetPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  distancePresetText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  distancePresetTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sliderTrack: {
    height: 7,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    position: 'relative',
    marginVertical: 10,
    justifyContent: 'center',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#38bdf8',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
    marginLeft: -11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderThumbCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
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
  },
  toggleSub: {
    color: '#64748b',
    fontSize: 11.5,
    marginTop: 2,
  },
  levelPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  levelPresetPill: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  levelPresetPillActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  levelPresetText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  levelPresetTextActive: {
    color: '#60a5fa',
    fontWeight: '700',
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
    borderColor: '#38bdf8',
    shadowColor: colors.blue500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  formatBtnCompetitive: {
    backgroundColor: '#1e293b',
  },
  formatBtnCompetitiveActive: {
    backgroundColor: colors.yellow400,
    borderColor: colors.yellow400,
    shadowColor: colors.yellow400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  formatBtnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  formatBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  clearBtnText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1.6,
    backgroundColor: colors.blue500,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
  },
});
