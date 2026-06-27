import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme/tokens';

interface ChatLocationWidgetProps {
  captured: boolean;
  label: string;
  accuracy: string;
  capturing?: boolean;
  resolved?: boolean;
  onCapture: () => void;
}

export function ChatLocationWidget({ captured, label, accuracy, capturing = false, resolved = false, onCapture }: ChatLocationWidgetProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <FontAwesome5 name="map-marker-alt" size={13} color={colors.tealTxt} />
        <Text style={styles.headerText}>Ubicación de la inspección</Text>
      </View>
      <Text style={styles.description}>La ubicación es obligatoria para Checklist normativo.</Text>
      <TouchableOpacity disabled={capturing || resolved} activeOpacity={0.8} onPress={onCapture} style={[styles.button, captured && styles.buttonDone]}>
        <FontAwesome5 name={captured ? 'check-circle' : 'crosshairs'} size={14} color={colors.white} />
        <Text style={styles.buttonText}>{capturing ? 'Capturando ubicación...' : captured ? 'Ubicación capturada' : 'Capturar ubicación'}</Text>
      </TouchableOpacity>
      <View style={styles.locationBox}>
        <Text style={styles.locationLabel}>{label}</Text>
        <Text style={styles.accuracy}>{accuracy}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginLeft: 33, marginRight: spacing.md, backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md + 2, borderWidth: 1, padding: spacing.md, gap: spacing.sm },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  headerText: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  description: { color: colors.muted, fontSize: fontSize.sm, lineHeight: 17 },
  button: { alignItems: 'center', backgroundColor: colors.gold, borderRadius: radius.md, flexDirection: 'row', gap: spacing.sm, height: 44, justifyContent: 'center' },
  buttonDone: { backgroundColor: colors.ok },
  buttonText: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  locationBox: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.sm + 2, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  locationLabel: { color: colors.primary, fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  accuracy: { color: colors.muted, fontSize: fontSize.xs, marginTop: 2 },
});
