import React, { useState } from 'react';
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
    <View style={styles.container}>
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
      <TouchableOpacity disabled={resolved} activeOpacity={0.8} onPress={() => onSave(days)} style={[styles.saveButton, resolved && styles.saveButtonResolved]}>
        <Text style={styles.saveText}>Guardar observación {observationNumber}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginLeft: 33, marginRight: spacing.md, backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.md, shadowColor: colors.primary, shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  title: { color: colors.muted, fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.6, marginBottom: spacing.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm - 2, marginBottom: spacing.md },
  option: { backgroundColor: colors.white, borderColor: colors.borderMid, borderRadius: radius.sm, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 7 },
  optionSelected: { backgroundColor: colors.gold, borderColor: colors.gold },
  optionText: { color: colors.muted, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  optionTextSelected: { color: colors.navy },
  customRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  inputBox: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.borderMid, borderRadius: radius.sm, borderWidth: 1, height: 32, justifyContent: 'center', minWidth: 60 },
  inputText: { color: colors.primary, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  customText: { color: colors.muted, fontSize: fontSize.sm },
  saveButton: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: colors.teal, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  saveButtonResolved: { opacity: 0.65 },
  saveText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
