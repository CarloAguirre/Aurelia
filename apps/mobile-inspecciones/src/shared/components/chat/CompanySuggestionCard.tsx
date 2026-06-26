import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme/tokens';
import type { CompanyResponse } from '../../services/api/organization.api';

interface CompanySuggestionCardProps {
  company: CompanyResponse;
  reason: string;
  disabled?: boolean;
  onConfirm: () => void;
  onChooseOther: () => void;
}

export function CompanySuggestionCard({ company, reason, disabled = false, onConfirm, onChooseOther }: CompanySuggestionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sparkle}>✦</Text>
        <Text style={styles.headerText}>Empresa sugerida por AurelIA</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>EMPRESA RESPONSABLE</Text>
        <Text style={styles.companyName}>{company.name}</Text>
        <View style={styles.divider} />
        <View style={styles.reasonRow}>
          <Text style={styles.chartIcon}>↳</Text>
          <Text style={styles.reason}>{reason}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity disabled={disabled} activeOpacity={0.75} onPress={onChooseOther} style={[styles.secondaryButton, disabled && styles.disabled]}>
          <Text style={styles.secondaryText}>☷ Elegir otra</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={disabled} activeOpacity={0.75} onPress={onConfirm} style={[styles.primaryButton, disabled && styles.disabled]}>
          <Text style={styles.primaryText}>✓ Confirmar {company.name}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginLeft: 33,
    marginRight: spacing.md,
    backgroundColor: colors.white,
    borderColor: colors.gold,
    borderRadius: radius.md + 2,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FDF3E3',
    borderBottomColor: 'rgba(200,160,100,0.2)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sparkle: {
    color: colors.goldDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  headerText: {
    color: colors.goldDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  label: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  companyName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: fontWeight.bold,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.sm,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chartIcon: {
    color: colors.teal,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    marginTop: 1,
  },
  reason: {
    color: colors.muted,
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: 10,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderMid,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    flex: 0.78,
    height: 36,
    justifyContent: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#72D7C9',
    borderRadius: radius.sm + 2,
    flex: 1.25,
    height: 36,
    justifyContent: 'center',
  },
  secondaryText: {
    color: colors.muted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  primaryText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});
