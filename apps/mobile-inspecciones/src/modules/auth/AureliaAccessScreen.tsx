import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { GoldFieldsAureliaLogo } from '../../shared/components/brand/GoldFieldsAureliaLogo';

export function AureliaAccessScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.statusBar}>
            <Text style={styles.time}>9:41</Text>
            <View style={styles.statusIcons}><FontAwesome5 name="signal" size={15} color="#111" /><FontAwesome5 name="wifi" size={15} color="#111" /></View>
          </View>
          <View style={styles.body}>
            <View style={styles.logoWrap}><GoldFieldsAureliaLogo width={137} height={44} /></View>
            <Text style={styles.title}>Le damos la bienvenida a <Text style={styles.titleBlue}>AurelIA</Text></Text>
            <Text style={styles.subtitle}>Sistema de gestión ambiental</Text>
            <View style={styles.form}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <View style={styles.input} />
              <Text style={styles.labelTwo}>Contraseña</Text>
              <View style={styles.inputWithIcon}><FontAwesome5 name="eye" size={18} color={colors.teal} /></View>
              <TouchableOpacity style={styles.restore}><Text style={styles.restoreText}>Recuperar contraseña</Text></TouchableOpacity>
              <TouchableOpacity style={styles.disabledButton} onPress={() => router.replace('/inspection/dashboard')} activeOpacity={0.75}>
                <Text style={styles.disabledText}>Iniciar sesión</Text>
              </TouchableOpacity>
              <View style={styles.lang}><View style={styles.en}><Text style={styles.enText}>EN</Text></View><View style={styles.es}><Text style={styles.esText}>ES</Text></View></View>
            </View>
          </View>
          <View style={styles.footer}><Text style={styles.footerText}>Diseñado y desarrollado por</Text><Text style={styles.footerBrand}>KABELI</Text></View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111' },
  screen: { flex: 1, backgroundColor: '#fff' },
  statusBar: { height: 28, backgroundColor: '#111', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { color: '#fff', fontSize: 14, fontWeight: fontWeight.bold },
  statusIcons: { flexDirection: 'row', gap: 12 },
  body: { flex: 1, paddingHorizontal: 24, alignItems: 'center' },
  logoWrap: { marginTop: 69, width: 137, height: 44 },
  title: { marginTop: 49, fontSize: 22, lineHeight: 28, color: colors.primary, fontWeight: fontWeight.bold, textAlign: 'center' },
  titleBlue: { color: colors.blueLink },
  subtitle: { marginTop: 13, fontSize: 16, color: colors.primary, textAlign: 'center' },
  form: { marginTop: 96, width: '100%' },
  label: { fontSize: 18, color: colors.primary, fontWeight: fontWeight.bold, marginBottom: 10 },
  labelTwo: { fontSize: 18, color: colors.primary, fontWeight: fontWeight.bold, marginTop: 43, marginBottom: 10 },
  input: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: '#f3f8ff' },
  inputWithIcon: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: '#f3f8ff', alignItems: 'flex-end', justifyContent: 'center', paddingRight: 14 },
  restore: { alignSelf: 'flex-end', marginTop: 48 },
  restoreText: { color: colors.gold, fontSize: 15, fontWeight: fontWeight.bold, textDecorationLine: 'underline' },
  disabledButton: { marginTop: 27, height: 52, borderRadius: 10, backgroundColor: '#d3d3d3', alignItems: 'center', justifyContent: 'center' },
  disabledText: { color: '#6f6f6f', fontSize: 16, fontWeight: fontWeight.bold },
  lang: { marginTop: 22, alignSelf: 'center', height: 32, flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#d1d1d1' },
  en: { width: 45, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  es: { width: 43, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  enText: { color: colors.primary, fontSize: 18, fontWeight: fontWeight.bold },
  esText: { color: colors.white, fontSize: 18, fontWeight: fontWeight.bold },
  footer: { position: 'absolute', bottom: 31, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: colors.muted, fontSize: 15 },
  footerBrand: { color: colors.muted, fontSize: 14, fontWeight: fontWeight.bold, marginTop: 6, letterSpacing: 0.8 },
});
