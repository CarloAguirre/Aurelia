import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/shared/theme/tokens';

export default function SuccessScreen() {
  const { inspectionId, findingsCount, evidencesCount } = useLocalSearchParams<{
    inspectionId: string;
    findingsCount: string;
    evidencesCount: string;
  }>();
  const insets = useSafeAreaInsets();
  const findings = Number(findingsCount ?? 0);
  const evidences = Number(evidencesCount ?? 0);

  return (
    <SafeAreaProvider>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.iconBox}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.title}>Inspección enviada</Text>
        <Text style={styles.subtitle}>
          La inspección fue creada exitosamente en el sistema.
        </Text>

        <View style={styles.card}>
          <Row label="ID de inspección" value={inspectionId ?? '—'} mono />
          <Divider />
          <Row label="Hallazgos creados" value={String(findings)} />
          <Divider />
          <Row label="Evidencias vinculadas" value={String(evidences)} />
        </View>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.replace('/inspection/chat')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnPrimaryText}>Nueva inspección</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaProvider>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, mono && rowStyles.mono]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.borderMid }} />;
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: { fontSize: fontSize.sm, color: colors.placeholder },
  value: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.body },
  mono: { fontFamily: 'monospace', fontSize: fontSize.xs, color: colors.navy },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 36,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.xl ?? 22,
    fontWeight: fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.placeholder,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.5,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderMid,
    overflow: 'hidden',
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
