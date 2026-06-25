import React from 'react';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

export function ChipMark() {
  return (
    <Svg width={28} height={22} viewBox="0 0 28 22">
      <Path d="M8 3h12v16H8z" fill="#fff" />
      <SvgText x={14} y={14} fontSize={7} textAnchor="middle" fill="#8E6E3E">AI</SvgText>
    </Svg>
  );
}
