import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight } from '../../theme/tokens';
import { SparklesMark } from '../icons/SparklesMark';

export const STEP_LABELS = [
  'Identificación',
  'Observación',
  'Medida y criticidad',
  'Más observaciones',
  'Empresa y personal',
  'Resumen',
  'Completado',
];

const STEP_PCT = ['14%', '28%', '42%', '57%', '71%', '86%', '100%'];
const STEP_DOTS = STEP_LABELS.length;

interface Props {
  currentStep: number;
  agentStatus?: 'active' | 'thinking';
}

export function ChatHeader({ currentStep, agentStatus = 'active' }: Props) {
  const insets = useSafeAreaInsets();
  const safeStep = Math.min(currentStep, STEP_LABELS.length - 1);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}> 
      <View style={styles.agentBar}>
        <View style={styles.agentLeft}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <SparklesMark size={14} color={colors.navy} />
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
        <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
          <FontAwesome5 name="ellipsis-v" size={15} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <View style={styles.progressWrapper}>
        <View style={styles.stepsRow}>
          {Array.from({ length: STEP_DOTS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.step,
                i < safeStep && styles.stepDone,
                i === safeStep && styles.stepActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.stepLabel}>
            <Text style={styles.stepLabelBold}>
              Paso {safeStep + 1} · {STEP_LABELS[safeStep]}
            </Text>
          </Text>
          <Text style={styles.stepLabel}>{STEP_PCT[safeStep]}</Text>
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
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
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
