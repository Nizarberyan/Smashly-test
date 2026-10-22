import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface QrCodeViewProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export const QrCodeView: React.FC<QrCodeViewProps> = ({
  size = 84,
  color = '#67e8f9',
  backgroundColor = 'transparent',
}) => {
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Top Left Marker */}
        <Rect x={6} y={6} width={28} height={28} rx={4} fill="none" stroke={color} strokeWidth={5} />
        <Rect x={14} y={14} width={12} height={12} rx={2} fill={color} />

        {/* Top Right Marker */}
        <Rect x={66} y={6} width={28} height={28} rx={4} fill="none" stroke={color} strokeWidth={5} />
        <Rect x={74} y={14} width={12} height={12} rx={2} fill={color} />

        {/* Bottom Left Marker */}
        <Rect x={6} y={66} width={28} height={28} rx={4} fill="none" stroke={color} strokeWidth={5} />
        <Rect x={14} y={74} width={12} height={12} rx={2} fill={color} />

        {/* Decorative QR Data Modules */}
        <Rect x={42} y={10} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={52} y={10} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={42} y={22} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={52} y={28} width={6} height={6} rx={1.5} fill={color} />

        <Rect x={10} y={42} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={22} y={42} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={34} y={42} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={46} y={42} width={8} height={8} rx={2} fill={color} />
        <Rect x={60} y={42} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={72} y={42} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={84} y={42} width={6} height={6} rx={1.5} fill={color} />

        <Rect x={42} y={56} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={54} y={56} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={66} y={56} width={8} height={8} rx={2} fill={color} />
        <Rect x={80} y={56} width={6} height={6} rx={1.5} fill={color} />

        <Rect x={42} y={70} width={8} height={8} rx={2} fill={color} />
        <Rect x={56} y={70} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={70} y={70} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={84} y={70} width={6} height={6} rx={1.5} fill={color} />

        <Rect x={42} y={84} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={54} y={84} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={66} y={84} width={6} height={6} rx={1.5} fill={color} />
        <Rect x={80} y={84} width={8} height={8} rx={2} fill={color} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
