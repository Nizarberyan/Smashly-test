import React, { useRef, useEffect, createContext, useContext } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SwipeableContextType {
  panHandlers?: any;
  dismiss: () => void;
}

export const SwipeableContext = createContext<SwipeableContextType>({
  dismiss: () => {},
});

export const useSwipeable = () => useContext(SwipeableContext);

interface SwipeableTabScreenProps {
  onDismiss: () => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
}

export const SwipeableTabScreen: React.FC<SwipeableTabScreenProps> = ({
  onDismiss,
  children,
  isDarkMode = true,
}) => {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Translation values for slide-in and interactive downward drag
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Track dismissal state to avoid duplicate calls
  const isDismissing = useRef(false);

  const handleDismiss = () => {
    if (isDismissing.current) return;
    isDismissing.current = true;
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(panY, {
        toValue: screenHeight,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  // PanResponder to track swipe-down gestures on drag handle and headers
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Dragging downward with clear vertical intent
        return (
          gestureState.dy > 5 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) * 1.1 &&
          !isDismissing.current
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0 && !isDismissing.current) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isDismissing.current) return;

        // Dismiss threshold: drag down > 70px or rapid downward flick (vy > 0.35)
        if (gestureState.dy > 70 || gestureState.vy > 0.35) {
          handleDismiss();
        } else {
          // Snap back to top position
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

  // Slide-in animation on mount
  useEffect(() => {
    isDismissing.current = false;
    panY.setValue(0);
    slideAnim.setValue(screenHeight);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, [screenHeight]);

  return (
    <SwipeableContext.Provider value={{ panHandlers: panResponder.panHandlers, dismiss: handleDismiss }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Dimmed backdrop revealing chat page underneath when dragged */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.backdrop,
            {
              opacity: Animated.multiply(
                backdropOpacity,
                panY.interpolate({
                  inputRange: [0, 300],
                  outputRange: [0.6, 0],
                  extrapolate: 'clamp',
                })
              ),
            },
          ]}
        />

        {/* Swipeable Screen Sheet with GPU Hardware Compositing */}
        <Animated.View
          style={[
            styles.sheetContainer,
            !isDarkMode && styles.sheetContainerLight,
            {
              transform: [{ translateY: Animated.add(slideAnim, panY) }],
            },
          ]}
          renderToHardwareTextureAndroid={true}
          shouldRasterizeIOS={true}
        >
          {/* Affordance Swipe-Down Drag Handle */}
          <View
            style={[
              styles.dragHandleContainer,
              !isDarkMode && styles.dragHandleContainerLight,
              {
                paddingTop: Math.max(insets.top, Platform.OS === 'ios' ? 12 : 8),
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={[styles.dragHandle, !isDarkMode && styles.dragHandleLight]} />
          </View>

          {/* Child Screen Content */}
          <View style={styles.contentWrap}>{children}</View>
        </Animated.View>
      </View>
    </SwipeableContext.Provider>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 10,
  },
  sheetContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0a0f1d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetContainerLight: {
    backgroundColor: '#f8fafc',
    shadowColor: '#64748b',
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  dragHandleContainer: {
    width: '100%',
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0f1d',
  },
  dragHandleContainerLight: {
    backgroundColor: '#f8fafc',
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#64748b',
  },
  dragHandleLight: {
    backgroundColor: '#cbd5e1',
  },
  contentWrap: {
    flex: 1,
  },
});
