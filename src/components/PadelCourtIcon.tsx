import React from 'react';
import Svg, { Rect, Line } from 'react-native-svg';

interface PadelCourtIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const PadelCourtIcon: React.FC<PadelCourtIconProps> = ({
  size = 24,
  color = '#ffffff',
  strokeWidth = 2,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Rect x="5" y="2" width="14" height="20" rx="2" />
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Line x1="5" y1="6" x2="19" y2="6" />
    <Line x1="5" y1="18" x2="19" y2="18" />
    <Line x1="12" y1="6" x2="12" y2="18" />
  </Svg>
);

export default PadelCourtIcon;
