import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

interface Props {
  text: string;
  html?: boolean;
  time?: string;
}

export function BotBubble({ text, time }: Props) {
  const now = new Date();
  const timeStr = time ?? `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarIcon}>✦</Text>
      </View>
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
    alignItems: 'flex-end',
    gap: 7,
    maxWidth: '100%',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarIcon: {
    fontSize: 10,
    color: colors.navy,
    fontWeight: fontWeight.bold,
  },
  bubble: {
    maxWidth: '85%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  text: {
    fontSize: fontSize.base,
    color: colors.primary,
    lineHeight: fontSize.base * 1.5,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    marginTop: spacing.xs,
  },
});
