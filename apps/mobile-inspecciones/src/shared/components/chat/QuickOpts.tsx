import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

export type QuickOptVariant = 'default' | 'selected' | 'teal' | 'disabled';

interface QuickOptProps {
  label: string;
  icon?: string;
  variant?: QuickOptVariant;
  onPress?: () => void;
}

export function QuickOpt({ label, icon, variant = 'default', onPress }: QuickOptProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={variant === 'selected' || variant === 'disabled'}
      style={[styles.opt, optVariantStyle[variant]]}
      activeOpacity={0.7}
    >
      {icon ? <Text style={[styles.icon, optTextVariantStyle[variant]]}>{icon}</Text> : null}
      <Text style={[styles.label, optTextVariantStyle[variant]]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface QuickOptsProps {
  options: Array<{ label: string; icon?: string; value: string }>;
  selected?: string | null;
  onSelect?: (value: string) => void;
}

export function QuickOpts({ options, selected, onSelect }: QuickOptsProps) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isSelected = selected === opt.value;
        return (
          <QuickOpt
            key={opt.value}
            label={opt.label}
            icon={opt.icon}
            variant={isSelected ? 'selected' : 'default'}
            onPress={() => onSelect?.(opt.value)}
          />
        );
      })}
    </View>
  );
}

const optVariantStyle: Record<QuickOptVariant, object> = {
  default: { borderColor: colors.borderMid, backgroundColor: colors.white },
  selected: { borderColor: colors.navyDark, backgroundColor: colors.navyDark },
  teal: { borderColor: colors.teal, backgroundColor: colors.teal },
  disabled: { borderColor: colors.borderMid, backgroundColor: colors.white, opacity: 0.45 },
};

const optTextVariantStyle: Record<QuickOptVariant, object> = {
  default: { color: colors.blueLink },
  selected: { color: colors.white },
  teal: { color: colors.white },
  disabled: { color: colors.muted },
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 33,
    gap: spacing.xs + 1,
    alignItems: 'flex-start',
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  icon: {
    fontSize: fontSize.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
