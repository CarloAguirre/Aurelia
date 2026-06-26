import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme/tokens';

const PROBABILITIES = [
  { value: 1, label: '1 · Muy improbable' },
  { value: 2, label: '2 · Improbable' },
  { value: 3, label: '3 · Posible' },
  { value: 4, label: '4 · Probable' },
  { value: 5, label: '5 · Casi seguro' },
];

const CONSEQUENCES = [
  { value: 1, label: '1 · Insignificante' },
  { value: 2, label: '2 · Menor' },
  { value: 3, label: '3 · Moderado' },
  { value: 4, label: '4 · Mayor' },
  { value: 5, label: '5 · Catastrófico' },
];

const SLA_BY_LEVEL: Record<string, number> = { Bajo: 14, Medio: 7, Alto: 3, Crítico: 1 };

interface CriticalityWidgetProps {
  resolved?: boolean;
  onComplete: (probability: number, consequence: number, level: string, slaDays: number) => void;
}

function level(probability: number, consequence: number): string {
  const score = (probability - 1) + (consequence - 1);
  if (score <= 1) return 'Bajo';
  if (score <= 3) return 'Medio';
  if (score <= 5) return 'Alto';
  return 'Crítico';
}

function Chip({ label, selected, disabled, onPress }: { label: string; selected: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.75} disabled={disabled} onPress={onPress} style={[styles.chip, selected && styles.chipSelected, disabled && !selected && styles.chipDisabled]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected, disabled && !selected && styles.chipTextDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function CriticalityWidget({ resolved = false, onComplete }: CriticalityWidgetProps) {
  const [probability, setProbability] = useState<number | null>(null);
  const [consequence, setConsequence] = useState<number | null>(null);

  function selectProbability(value: number) {
    if (resolved) return;
    setProbability(value);
    if (consequence) finish(value, consequence);
  }

  function selectConsequence(value: number) {
    if (resolved) return;
    setConsequence(value);
    if (probability) finish(probability, value);
  }

  function finish(nextProbability: number, nextConsequence: number) {
    const nextLevel = level(nextProbability, nextConsequence);
    onComplete(nextProbability, nextConsequence, nextLevel, SLA_BY_LEVEL[nextLevel] ?? 7);
  }

  const currentLevel = probability && consequence ? level(probability, consequence) : null;
  const currentSla = currentLevel ? SLA_BY_LEVEL[currentLevel] ?? 7 : null;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROBABILIDAD · ¿QUÉ TAN PROBABLE ES QUE OCURRA?</Text>
        <View style={styles.chips}>{PROBABILITIES.map((item) => <Chip key={item.value} label={item.label} selected={probability === item.value} disabled={resolved} onPress={() => selectProbability(item.value)} />)}</View>
      </View>
      <View style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONSECUENCIA · ¿QUÉ TAN GRAVE SERÍA EL IMPACTO?</Text>
        <View style={styles.chips}>{CONSEQUENCES.map((item) => <Chip key={item.value} label={item.label} selected={consequence === item.value} disabled={resolved} onPress={() => selectConsequence(item.value)} />)}</View>
      </View>
      {currentLevel ? (
        <View style={styles.resultBox}>
          <View>
            <Text style={styles.resultMeta}>NIVEL · P{probability}×C{consequence}</Text>
            <Text style={styles.resultLevel}>{currentLevel}</Text>
          </View>
          <View style={styles.slaBlock}>
            <Text style={styles.resultMeta}>SLA sugerido</Text>
            <Text style={styles.slaText}>{currentSla} días</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 33,
    marginRight: spacing.md,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  section: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm - 2,
  },
  chip: {
    backgroundColor: colors.white,
    borderColor: colors.borderMid,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.7,
  },
  chipText: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  chipTextSelected: {
    color: colors.navy,
  },
  chipTextDisabled: {
    color: colors.placeholder,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
  },
  resultBox: {
    alignItems: 'center',
    backgroundColor: colors.warnSurf,
    borderColor: colors.gold,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: spacing.md,
    marginTop: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultMeta: {
    color: colors.warnTxt,
    fontSize: 9,
    fontWeight: fontWeight.bold,
  },
  resultLevel: {
    color: colors.warnTxt,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  slaBlock: {
    alignItems: 'flex-end',
  },
  slaText: {
    color: colors.warnTxt,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
});
