import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

interface Props {
  obsCount: number;
  photoCount: number;
  onSubmit: () => void;
  submitted?: boolean;
}

export function SubmitWidget({ obsCount, photoCount, onSubmit, submitted = false }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Resumen listo para enviar</Text>

      <View style={styles.row}>
        <Text style={styles.rowIcon}>📋</Text>
        <Text style={styles.rowText}>
          {obsCount} {obsCount === 1 ? 'observación registrada' : 'observaciones registradas'}
        </Text>
      </View>

      {photoCount > 0 && (
        <View style={styles.row}>
          <Text style={styles.rowIcon}>📷</Text>
          <Text style={styles.rowText}>
            {photoCount} {photoCount === 1 ? 'foto adjuntada' : 'fotos adjuntadas'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, submitted && styles.btnDone]}
        onPress={submitted ? undefined : onSubmit}
        disabled={submitted}
        activeOpacity={0.8}
      >
        <Text style={styles.btnText}>
          {submitted ? '⏳ Enviando…' : '↑ Enviar inspección'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
    borderRadius: radius.md + 2,
    padding: spacing.md,
    gap: spacing.sm,
    marginLeft: 33,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.navy,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowIcon: { fontSize: 14 },
  rowText: {
    fontSize: fontSize.sm,
    color: colors.body,
  },
  btn: {
    marginTop: spacing.xs,
    backgroundColor: colors.navy,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  btnDone: {
    backgroundColor: colors.placeholder,
  },
  btnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
