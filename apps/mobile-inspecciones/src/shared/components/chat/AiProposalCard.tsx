import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

interface AiProposalCardProps {
  suggestion: string;
  fallback?: boolean;
  onAccept: () => void;
  onEdit: () => void;
  accepted?: boolean;
}

export function AiProposalCard({
  suggestion,
  fallback,
  onAccept,
  onEdit,
  accepted = false,
}: AiProposalCardProps) {
  return (
    <View style={[styles.container, styles.marginLeft]}>
      <View style={styles.header}>
        <FontAwesome6 name="sparkles" size={11} color={colors.goldDark} />
        <Text style={styles.headerTitle}>Medida sugerida por AurelIA</Text>
        {fallback && <Text style={styles.fallbackBadge}>fallback</Text>}
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Medida correctiva</Text>
        <Text style={styles.suggestion}>{suggestion}</Text>
        <View style={styles.meta}>
          <FontAwesome5 name="chart-line" size={9} color={colors.teal} />
          <Text style={styles.metaText}>
            Basada en historial 2023–2026 · Gold Fields Salares Norte
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onEdit}
          disabled={accepted}
          style={[styles.editBtn, accepted && styles.disabledBtn]}
        >
          <View style={styles.btnContent}>
            <FontAwesome5 name="pen" size={10} color={accepted ? colors.muted : colors.body} />
            <Text style={[styles.editBtnText, accepted && styles.disabledText]}>Editar</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAccept}
          disabled={accepted}
          style={[styles.acceptBtn, accepted && styles.disabledBtn]}
        >
          <View style={styles.btnContent}>
            <FontAwesome5 name="check" size={10} color={colors.white} />
            <Text style={styles.acceptBtnText}>Aceptar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marginLeft: { marginLeft: 33 },
  container: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: radius.md + 2,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FAE8C8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,160,100,0.2)',
  },
  headerTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.goldDark, flex: 1 },
  fallbackBadge: {
    fontSize: 9,
    color: colors.muted,
    backgroundColor: colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.sm + 2, paddingBottom: 0 },
  label: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  suggestion: {
    fontSize: fontSize.md,
    color: colors.primary,
    lineHeight: fontSize.md * 1.5,
    fontWeight: fontWeight.medium,
  },
  meta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: { fontSize: fontSize.xs, color: colors.muted, flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm - 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  editBtn: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.borderMid,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.body },
  acceptBtn: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.white },
  disabledBtn: { opacity: 0.5 },
  disabledText: { color: colors.muted },
});
