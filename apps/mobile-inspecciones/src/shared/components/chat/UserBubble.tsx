import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

interface Props {
  text: string;
  time?: string;
}

export function UserBubble({ text, time }: Props) {
  const now = new Date();
  const timeStr = time ?? `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.time}>{timeStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    backgroundColor: colors.navyDark,
    borderRadius: radius.lg,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.white,
    lineHeight: fontSize.base * 1.5,
    fontWeight: fontWeight.medium,
  },
  time: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.38)',
    marginTop: spacing.xs,
  },
});
