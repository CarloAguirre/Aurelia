import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fontWeight } from '../../shared/theme/tokens';

export function AureliaAccessScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.hero}>
            <Text style={styles.logo}>AURELIA</Text>
            <Text style={styles.title}>Le damos la bienvenida a AurelIA</Text>
            <Text style={styles.subtitle}>Sistema de gestión ambiental</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/inspection/dashboard')} activeOpacity={0.82}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Diseñado y desarrollado por</Text>
            <Text style={styles.footerBrand}>KABELI</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark },
  screen: { flex: 1, backgroundColor: colors.navyDark, paddingHorizontal: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 48 },
  logo: { color: colors.white, fontSize: 22, fontWeight: fontWeight.bold, letterSpacing: 2.4, marginBottom: 42 },
  title: { color: colors.white, fontSize: 22, lineHeight: 28.6, textAlign: 'center', fontWeight: fontWeight.bold },
  subtitle: { color: 'rgba(255,255,255,0.62)', fontSize: 15, marginTop: 4 },
  button: { height: 39, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.navy, fontSize: 14, fontWeight: fontWeight.bold },
  footer: { position: 'absolute', bottom: 28, left: 24, right: 24, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.42)', fontSize: 11 },
  footerBrand: { color: colors.white, fontSize: 11, fontWeight: fontWeight.bold, marginTop: 2, letterSpacing: 1.1 },
});
