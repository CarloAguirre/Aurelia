import React from 'react';
import Svg, { Polygon } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

export function FigmaButtonSparklesMark({ width = 18, height = 16, color = '#001E39' }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 16">
      <Polygon points="6.1,2.7 7.8,6.1 11.2,7.8 7.8,9.5 6.1,12.9 4.4,9.5 1,7.8 4.4,6.1" fill={color} />
      <Polygon points="14,0.2 14.8,1.8 16.4,2.6 14.8,3.4 14,5 13.2,3.4 11.6,2.6 13.2,1.8" fill={color} />
      <Polygon points="13.1,10.5 13.9,12.2 15.6,13 13.9,13.8 13.1,15.5 12.3,13.8 10.6,13 12.3,12.2" fill={color} />
    </Svg>
  );
}
