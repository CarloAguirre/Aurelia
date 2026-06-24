import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

interface Props {
  onSkip: () => void;
  resolved?: boolean;
}

export function PhotoStepWidget({ onSkip, resolved = false }: Props) {
  return (
    <View style={[styles.container, styles.marginLeft]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>📷</Text>
      </View>
      <Text style={styles.title}>Adjuntar fotografía del hallazgo</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, resolved && styles.btnDone]}
          onPress={resolved ? undefined : onSkip}
          activeOpacity={0.7}
          disabled={resolved}
        >
          <Text style={styles.btnPrimaryText}>
            {resolved ? '✓ Sin foto' : 'Continuar sin foto'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          disabled
          activeOpacity={1}
        >
          <Text style={styles.btnOutlineText}>📷 Tomar foto</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Mobile D</Text>
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
    borderColor: colors.borderMid,
    borderStyle: 'dashed',
    borderRadius: radius.md + 2,
    padding: 14,
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.body },
  actions: {
    flexDirection: 'column',
    gap: spacing.xs,
    width: '100%',
  },
  btn: {
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  btnPrimary: {
    backgroundColor: colors.teal,
  },
  btnDone: {
    backgroundColor: colors.borderMid,
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.borderMid,
    backgroundColor: 'transparent',
    opacity: 0.5,
  },
  btnPrimaryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  btnOutlineText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  badge: {
    backgroundColor: colors.warnSurf,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.warnTxt },
});
