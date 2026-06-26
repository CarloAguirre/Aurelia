import React, { Fragment, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme/tokens';

const OPTIONS = [1, 3, 7, 14];

interface SlaConfirmWidgetProps {
  initialDays: number;
  observationNumber: number;
  resolved?: boolean;
  onSave: (days: number) => void;
}

export function SlaConfirmWidget({ initialDays, observationNumber, resolved = false, onSave }: SlaConfirmWidgetProps) {
  const [days, setDays] = useState(initialDays);

  return (
    <Fragment>
      <View style={styles.card}>
        <Text style={styles.title}>SLA · DÍAS HÁBILES PARA RESOLVER</Text>
        <View style={styles.options}>
          {OPTIONS.map((option) => {
            const selected = days === option;
            return (
              <TouchableOpacity key={option} disabled={resolved} activeOpacity={0.75} onPress={() => setDays(option)} style={[styles.option, selected && styles.optionSelected]}>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option} día{option === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.customRow}>
          <View style={styles.inputBox}><Text style={styles.inputText}>{days}</Text></View>
          <Text style={styles.customText}>días personalizados</Text>
        </View>
      </View>
      <TouchableOpacity disabled={resolved} activeOpacity={0.8} onPress={() => onSave(days)} style={[styles.saveButton, resolved && styles.saveButtonResolved]}>
        <Text style={styles.saveText}>Guardar observación {observationNumber}</Text>
      </TouchableOpacity>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  card: {
    marginLeft: 33,
    marginRight: spacing.md,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  title: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: spacing.sm,
  },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMid,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  optionSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  optionText: {
    color: colors.muted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  optionTextSelected: {
    color: colors.navy,
  },
  customRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputBox: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.borderMid,
    borderRadius: radius.sm + 1,
    borderWidth: 1.5,
    height: 30,
    justifyContent: 'center',
    width: 55,
  },
  inputText: {
    color: colors.primary,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  customText: {
    color: colors.muted,
    fontSize: fontSize.sm,
  },
  saveButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.teal,
    borderRadius: radius.full,
    marginLeft: 33,
    marginTop: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  saveButtonResolved: {
    opacity: 0.45,
  },
  saveText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
});
