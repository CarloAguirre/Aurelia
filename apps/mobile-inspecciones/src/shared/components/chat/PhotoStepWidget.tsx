import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  return (
    <View style={[styles.container, styles.marginLeft]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>📷</Text>
      </View>
      <Text style={styles.title}>Adjuntar fotografía del hallazgo</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, resolved && styles.btnDisabled]}
          onPress={resolved ? undefined : () => launchCamera(onCapture)}
          activeOpacity={0.7}
          disabled={resolved}
        >
          <Text style={styles.btnPrimaryText}>📷 Tomar foto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, resolved && styles.btnDisabled]}
          onPress={resolved ? undefined : () => launchGallery(onCapture)}
          activeOpacity={0.7}
          disabled={resolved}
        >
          <Text style={[styles.btnOutlineText, resolved && styles.textDisabled]}>
            🖼 Abrir galería
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnGhost, resolved && styles.btnDisabled]}
          onPress={resolved ? undefined : onSkip}
          activeOpacity={0.7}
          disabled={resolved}
        >
          <Text style={[styles.btnGhostText, resolved && styles.textDisabled]}>
            {resolved ? '✓ Completado' : 'Continuar sin foto'}
          </Text>
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
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.teal,
    backgroundColor: 'transparent',
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnPrimaryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  btnOutlineText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.teal,
  },
  btnGhostText: {
    fontSize: fontSize.sm,
    color: colors.placeholder,
  },
  textDisabled: {
    color: colors.placeholder,
  },
});
