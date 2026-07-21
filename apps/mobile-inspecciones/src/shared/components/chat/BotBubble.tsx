import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';
import { useMobileInspectionAssignmentScope } from '../../stores/mobileInspectionAssignmentScope.store';
import { useManualInspectionDraft } from '../../../modules/inspection/manualInspection.store';
import { SparklesMark } from '../icons/SparklesMark';

interface Props {
  text: string;
  html?: boolean;
  time?: string;
}

interface AssistantCopyContext {
  inspectorName: string;
  areaName: string | null;
  sectorName: string | null;
}

function canonicalAssistantText(text: string, context: AssistantCopyContext): string {
  const normalized = text.trim();
  const area = context.areaName ?? 'el área';
  const location = [context.areaName, context.sectorName].filter(Boolean).join(' · ');

  if (normalized === 'Hola, soy AurelIA. ¿En qué área estás hoy?') {
    return `¡Hola, **${context.inspectorName}**! 👋 Soy AurelIA. Voy a ayudarte a registrar esta inspección de forma rápida. ¿En qué **área** estás hoy?`;
  }

  if (normalized === 'Selecciona el sector.') {
    return `Perfecto, **${area}** ✓. Ahora el sector — ¿en cuál específicamente?`;
  }

  if (normalized === 'Selecciona el tipo de inspección.') {
    return `**${location || 'Área · sector'} ✓**. ¿Qué tipo de inspección es?`;
  }

  if (normalized === 'Selecciona la fecha de inspección.') {
    return 'Selecciona la **fecha de inspección**.';
  }

  if (normalized === 'Capturemos la ubicación obligatoria.') {
    return 'Capturemos la **ubicación obligatoria**.';
  }

  if (normalized === 'Selecciona el tipo de hallazgo.') {
    return 'Selecciona el **tipo de hallazgo**.';
  }

  return text;
}

function FormattedText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
  return (
    <Text style={styles.text}>
      {parts.map((part, index) => {
        const strong = part.startsWith('**') && part.endsWith('**');
        const value = strong ? part.slice(2, -2) : part;
        return (
          <Text key={`${index}-${value}`} style={strong ? styles.strong : undefined}>
            {value}
          </Text>
        );
      })}
    </Text>
  );
}

export function BotBubble({ text, time }: Props) {
  const canSelectCompany = useMobileInspectionAssignmentScope((state) => state.canSelectCompany);
  const inspectorName = useManualInspectionDraft((state) => state.inspectorName);
  const areaName = useManualInspectionDraft((state) => state.areaName);
  const sectorName = useManualInspectionDraft((state) => state.sectorName);
  const hiddenForAssignedCompany = !canSelectCompany && [
    'Te sugiero una empresa responsable para este hallazgo.',
    'Selecciona empresa responsable de los hallazgos.',
    'Selecciona empresa responsable.',
  ].includes(text.trim());
  const displayText = canonicalAssistantText(text, { inspectorName, areaName, sectorName });
  const now = new Date();
  const timeStr = time ?? `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (hiddenForAssignedCompany) return null;

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <SparklesMark size={10} color={colors.navy} />
      </View>
      <View style={styles.bubble}>
        <FormattedText text={displayText} />
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
  bubble: {
    maxWidth: '85%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 4,
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
    fontWeight: fontWeight.regular,
  },
  strong: {
    fontWeight: fontWeight.bold,
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.placeholder,
    marginTop: spacing.xs,
  },
});
