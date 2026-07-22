import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../theme/tokens';
import { PhotoSourceSheet } from '../form/PhotoSourceSheet';

interface Props {
  onSkip: () => void;
  onCapture: (uri: string) => void;
  resolved?: boolean;
  resolvedTitle?: string;
  resolvedSub?: string;
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
  if (!result.canceled && result.assets[0]?.uri) onCapture(result.assets[0].uri);
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
  if (!result.canceled && result.assets[0]?.uri) onCapture(result.assets[0].uri);
}

export function PhotoStepWidget({
  onCapture,
  resolved = false,
  resolvedTitle = 'Foto adjunta ✓',
  resolvedSub = 'IMG.jpg · GPS ✓ · --:--',
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (resolved) {
    return (
      <View style={styles.resolvedOuter}>
        <View style={styles.resolvedCard}>
          <View style={styles.resolvedCheck}>
            <Text style={styles.resolvedCheckText}>✓</Text>
          </View>
          <View style={styles.resolvedCopy}>
            <Text numberOfLines={1} style={styles.resolvedTitle}>{resolvedTitle}</Text>
            <Text numberOfLines={1} style={styles.resolvedSub}>{resolvedSub}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.iconBox}>
          <FontAwesome5 name="camera-retro" size={18} color="#646464" />
        </View>
        <Text style={styles.title}>Adjuntar fotografía del hallazgo</Text>
        <Text style={styles.subtitle}>Fecha, hora y GPS se registran automáticamente</Text>
        <TouchableOpacity activeOpacity={0.78} onPress={() => setPickerOpen(true)} style={styles.triggerBtn}>
          <FontAwesome5 name="camera" size={11} color="#333333" />
          <Text style={styles.triggerText}>Desde galería</Text>
        </TouchableOpacity>
      </View>
      <PhotoSourceSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onCamera={async () => {
          setPickerOpen(false);
          await launchCamera(onCapture);
        }}
        onGallery={async () => {
          setPickerOpen(false);
          await launchGallery(onCapture);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginLeft: 33,
    marginRight: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderColor: '#D1D1D1',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F9',
    borderRadius: 10,
  },
  title: {
    color: '#333333',
    fontSize: 12,
    fontWeight: fontWeight.bold,
    lineHeight: 14,
  },
  subtitle: {
    color: '#ACACAC',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
  },
  triggerBtn: {
    width: '100%',
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#F4F6F9',
    borderColor: '#D1D1D1',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  triggerText: {
    color: '#333333',
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  resolvedOuter: {
    marginBottom: 10,
    marginLeft: 33,
    marginRight: 12,
    borderColor: '#D1D1D1',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  resolvedCard: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E0FFD3',
    borderRadius: 12,
  },
  resolvedCheck: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A5C16',
    borderRadius: 8,
  },
  resolvedCheckText: {
    color: '#E0FFD3',
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  resolvedCopy: {
    minWidth: 0,
    flex: 1,
  },
  resolvedTitle: {
    color: '#2A5C16',
    fontSize: 12,
    fontWeight: fontWeight.bold,
    lineHeight: 15,
  },
  resolvedSub: {
    color: '#2A5C16',
    fontSize: 10,
    lineHeight: 13,
  },
});
