import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

interface WhatsAppIconProps {
  size?: number;
  color?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  size = 18,
  color = '#22c55e',
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <MessageCircle size={size} color={color} strokeWidth={2.4} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
