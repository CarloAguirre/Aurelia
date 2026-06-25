import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';

interface Props {
  onSkip: () => void;
  onCapture: (uri: string) => void;
  resolved?: boolean;
}

async function launchCamera(onCapture: (uri: string) => void) {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesita permiso de cámara para tomar fotos.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: false,
  });
  if (!result.canceled && result.assets[0]?.uri) {
    onCapture(result.assets[0].uri);
  }
}

async function launchGallery(onCapture: (uri: string) => void) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso requerido', 'Necesita permiso de galería para adjuntar fotos.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: false,
    selectionLimit: 1,
  });
  if (!result.canceled && result.assets[0]?.uri) {
    onCapture(result.assets[0].uri);
  }
}

export function PhotoStepWidget({ onSkip, onCapture, resolved = false }: Props) {
  if (resolved) {
    return (
      <View style={[styles.resolvedCard, styles.marginLeft]}>
        <FontAwesome5 name="check-circle" size={16} color={colors.successTxt} />
        <View>
          <Text style={styles.resolvedTitle}>Foto procesada ✓</Text>
          <Text style={styles.resolvedSub}>GPS y hora registrados automáticamente</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.marginLeft]}>
      <View style={styles.iconBox}>
        <FontAwesome5 name="camera-retro" size={18} color={colors.muted} />
      </View>
      <Text style={styles.title}>Adjuntar fotografía del hallazgo</Text>
      <Text style={styles.subtitle}>Fecha, hora y GPS se registran automáticamente</Text>
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.foOpt}
          onPress={() => launchCamera(onCapture)}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="camera" size={11} color={colors.body} />
          <Text style={styles.foOptText}>Tomar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.foOpt}
          onPress={() => launchGallery(onCapture)}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="image" size={11} color={colors.body} />
          <Text style={styles.foOptText}>Desde galería</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={onSkip} activeOpacity={0.7} style={styles.skipBtn}>
        <Text style={styles.skipText}>Continuar sin foto</Text>
      </TouchableOpacity>
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
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.body },
  subtitle: { fontSize: fontSize.xs, color: colors.placeholder, textAlign: 'center' },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  foOpt: {
    flex: 1,
    height: 34,
    borderRadius: radius.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.borderMid,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  foOptText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.body,
  },
  skipBtn: {
    paddingVertical: spacing.xs,
  },
  skipText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  resolvedCard: {
    backgroundColor: colors.successSurf,
    borderRadius: radius.md + 2,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resolvedTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.successTxt,
  },
  resolvedSub: {
    fontSize: fontSize.xs,
    color: colors.successTxt,
    marginTop: 1,
  },
});
