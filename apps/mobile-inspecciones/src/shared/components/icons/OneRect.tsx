import React from 'react';
import Svg, { Rect } from 'react-native-svg';

export function OneRect() {
  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Rect x={1} y={1} width={8} height={8} fill="#fff" />
    </Svg>
  );
}
