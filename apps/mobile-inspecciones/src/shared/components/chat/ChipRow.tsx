import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

export type ChipVariant = 'default' | 'selected-gold' | 'selected-navy';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  onPress?: () => void;
}

export function Chip({ label, variant = 'default', onPress }: ChipProps) {
  const isSelected = variant !== 'default';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isSelected}
      style={[styles.chip, chipVariantStyle[variant]]}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, chipTextVariantStyle[variant]]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface ChipRowProps {
  chips: string[];
  selected?: string | null;
  onSelect?: (value: string) => void;
  variant?: 'gold' | 'navy';
}

export function ChipRow({ chips, selected, onSelect, variant = 'gold' }: ChipRowProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chips.map((chip) => {
          const isSelected = selected === chip;
          const chipVariant: ChipVariant = isSelected
            ? variant === 'gold' ? 'selected-gold' : 'selected-navy'
            : 'default';
          return (
            <Chip
              key={chip}
              label={chip}
              variant={chipVariant}
              onPress={() => onSelect?.(chip)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const chipVariantStyle: Record<ChipVariant, object> = {
  default: {
    borderColor: colors.borderMid,
    backgroundColor: colors.white,
  },
  'selected-gold': {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  'selected-navy': {
    borderColor: colors.navyDark,
    backgroundColor: colors.navyDark,
  },
};

const chipTextVariantStyle: Record<ChipVariant, object> = {
  default: { color: colors.muted },
  'selected-gold': { color: colors.navy },
  'selected-navy': { color: colors.white },
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 33,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm - 2,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
});
