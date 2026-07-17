import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';
import { useMobileInspectionAssignmentScope } from '../../stores/mobileInspectionAssignmentScope.store';

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
  const canSelectCompany = useMobileInspectionAssignmentScope((state) => state.canSelectCompany);
  const assignedCompanyName = useMobileInspectionAssignmentScope((state) => state.companyName);
  const confirmedRef = React.useRef(false);
  const lockedCompany = !canSelectCompany && Boolean(assignedCompanyName) && chips.length === 1 && chips[0] === assignedCompanyName;

  React.useEffect(() => {
    if (!lockedCompany || selected === assignedCompanyName || confirmedRef.current || !assignedCompanyName) return;
    confirmedRef.current = true;
    onSelect?.(assignedCompanyName);
  }, [assignedCompanyName, lockedCompany, onSelect, selected]);

  if (lockedCompany) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedLabel}>Empresa responsable</Text>
        <View style={styles.lockedField}><Text style={styles.lockedValue}>{assignedCompanyName}</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chipWrap}>
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
      </View>
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
  lockedContainer: {
    marginLeft: 33,
    marginRight: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md + 2,
    borderWidth: 1,
  },
  lockedLabel: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  lockedField: {
    height: 50,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: '#F6FAFF',
    borderColor: '#24588B',
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
  },
  lockedValue: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm - 2,
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
