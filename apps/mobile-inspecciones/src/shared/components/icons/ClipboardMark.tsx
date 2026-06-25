import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

export function ClipboardMark({ width = 25, height = 20, color = '#646464' }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 25 20">
      <Path d="M7 1.5h11v18H7z" fill={color} />
      <Rect x={9.5} y={0} width={6} height={4} rx={1.2} fill={color} />
      <Circle cx={9.2} cy={10} r={1.1} fill="#F4F6F9" />
      <Circle cx={9.2} cy={15} r={1.1} fill="#F4F6F9" />
      <Line x1={12.4} y1={10} x2={16.5} y2={10} stroke="#F4F6F9" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1={12.4} y1={15} x2={16.5} y2={15} stroke="#F4F6F9" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}
