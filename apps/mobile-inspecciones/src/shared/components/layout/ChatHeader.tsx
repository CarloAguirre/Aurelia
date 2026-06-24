import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight } from '../../theme/tokens';

export const STEP_LABELS = [
  'Identificación',
  'Observación',
  'Medida y criticidad',
  'Más observaciones',
  'Empresa y personal',
  'Resumen',
  'Completado',
];

const TOTAL_STEPS = STEP_LABELS.length - 1;

interface Props {
  currentStep: number;
  agentStatus?: 'active' | 'thinking';
}

export function ChatHeader({ currentStep, agentStatus = 'active' }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      {/* Agent bar */}
      <View style={styles.agentBar}>
        <View style={styles.agentLeft}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>✦</Text>
            </View>
            <View style={[styles.statusDot, agentStatus === 'thinking' && styles.statusDotThinking]} />
          </View>
          <View>
            <Text style={styles.agentName}>AurelIA</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, agentStatus === 'thinking' && styles.statusIndicatorThinking]} />
              <Text style={styles.statusText}>
                {agentStatus === 'thinking' ? 'Buscando en historial…' : 'Activo'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrapper}>
        <View style={styles.stepsRow}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.step,
                i < currentStep && styles.stepDone,
                i === currentStep && styles.stepActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.stepLabel}>
            <Text style={styles.stepLabelBold}>Paso {currentStep + 1} · {STEP_LABELS[currentStep]}</Text>
          </Text>
          <Text style={styles.stepLabel}>
            {Math.round(((currentStep + 1) / TOTAL_STEPS) * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.navyDark,
  },
  agentBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  agentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  avatarWrapper: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 14, color: colors.navy, fontWeight: fontWeight.bold },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.teal,
    borderWidth: 2,
    borderColor: colors.navyDark,
  },
  statusDotThinking: { backgroundColor: colors.gold },
  agentName: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.white },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: 1 },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
  },
  statusIndicatorThinking: { backgroundColor: colors.gold },
  statusText: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)' },
  progressWrapper: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stepsRow: { flexDirection: 'row', gap: 3, marginBottom: 5 },
  step: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepDone: { backgroundColor: colors.gold },
  stepActive: { backgroundColor: 'rgba(200,160,100,0.5)' },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.45)' },
  stepLabelBold: { fontWeight: fontWeight.semibold, color: 'rgba(255,255,255,0.7)' },
});
