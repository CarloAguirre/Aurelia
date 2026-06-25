import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  size?: number;
  color: string;
}

export function SparklesMark({ size = 14, color }: Props) {
  const main = Math.round(size * 0.62);
  const small = Math.round(size * 0.28);
  const tiny = Math.round(size * 0.2);

  return (
    <View style={[styles.root, { width: size, height: size }]}> 
      <View
        style={[
          styles.diamond,
          styles.main,
          { width: main, height: main, backgroundColor: color, left: Math.round(size * 0.18), top: Math.round(size * 0.2) },
        ]}
      />
      <View
        style={[
          styles.diamond,
          { width: small, height: small, backgroundColor: color, right: 0, top: 0 },
        ]}
      />
      <View
        style={[
          styles.diamond,
          { width: tiny, height: tiny, backgroundColor: color, right: Math.round(size * 0.1), bottom: Math.round(size * 0.08) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
  },
  diamond: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  main: {
    borderRadius: 3,
  },
});
