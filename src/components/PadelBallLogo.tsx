import React, { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Text as SvgText } from 'react-native-svg';

type Props = {
  size?: number;
  letter?: string;
  ball?: string;
  edge?: string;
  seam?: string;
  rotateDeg?: number;
  fontWeight?: string | number;
};

export default function PadelBallLogo({
  size = 34,
  letter = 'P',
  ball = '#F6D35E',
  edge = '#E3BE40',
  seam = '#FFFFFF',
  rotateDeg = -18,
  fontWeight = 'bold',
}: Props) {
  const reactId = useId ? useId().replace(/:/g, '') : 'padel';
  const clipId = `clip-padel-${reactId}`;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
    >
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx="50" cy="50" r="47" />
        </ClipPath>
      </Defs>

      {/* Main ball */}
      <Circle
        cx="50"
        cy="50"
        r="47"
        fill={ball}
        stroke="#000000"
        strokeWidth="3.5"
      />

      <G clipPath={`url(#${clipId})`} transform={`rotate(${rotateDeg} 50 50)`}>
        {/* Seams */}
        <Path
          d="M 8,28 C 22,18 78,18 92,28"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Path
          d="M 8,28 C 22,18 78,18 92,28"
          fill="none"
          stroke="#000000"
          strokeWidth="9.5"
          strokeLinecap="round"
          opacity={0.5}
        />

        <Path
          d="M 8,72 C 22,82 78,82 92,72"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <Path
          d="M 8,72 C 22,82 78,82 92,72"
          fill="none"
          stroke="#000000"
          strokeWidth="9.5"
          strokeLinecap="round"
          opacity={0.5}
        />
      </G>

      {/* Center Letter */}
      <SvgText
        x="50"
        y="63"
        textAnchor="middle"
        fontSize="41"
        fontWeight={fontWeight as any}
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="2.5"
      >
        {letter.slice(0, 1).toUpperCase()}
      </SvgText>
    </Svg>
  );
}
