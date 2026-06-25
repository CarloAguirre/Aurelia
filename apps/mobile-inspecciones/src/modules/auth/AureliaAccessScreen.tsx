import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { GoldFieldsAureliaLogo } from '../../shared/components/brand/GoldFieldsAureliaLogo';
import { login } from '../../shared/services/api/auth.api';
import { useMobileSession } from './mobileSession.store';

export function AureliaAccessScreen() {
  const setMobileSession = useMobileSession((state) => state.setMobileSession);
  const [email, setEmail] = useState('karen.opazo@goldfields.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function submit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const response = await login(email, password);
      setMobileSession(response.token, response.user);
      router.replace('/inspection/dashboard');
    } catch {
      setError('No se pudo iniciar sesión. Revisa usuario, clave o conexión con la API.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.statusBar}>
            <Text style={styles.time}>9:41</Text>
            <View style={styles.statusIcons}>
              <FontAwesome5 name="signal" size={15} color="#111" />
              <FontAwesome5 name="wifi" size={15} color="#111" />
            </View>
          </View>
          <View style={styles.body}>
            <View style={styles.logoWrap}>
              <GoldFieldsAureliaLogo width={137} height={44} />
            </View>
            <Text style={styles.title}>Le damos la bienvenida a <Text style={styles.titleBlue}>AurelIA</Text></Text>
            <Text style={styles.subtitle}>Sistema de gestión ambiental</Text>
            <View style={styles.form}>
              <Text style={styles.label}>Nombre de usuario</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="usuario@goldfields.com"
                placeholderTextColor="#8b9aaa"
                style={styles.input}
              />
              <Text style={styles.labelTwo}>Contraseña</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Contraseña"
                  placeholderTextColor="#8b9aaa"
                  style={styles.passwordInput}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((value) => !value)}>
                  <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={18} color={colors.teal} />
                </TouchableOpacity>
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity style={styles.restore}><Text style={styles.restoreText}>Recuperar contraseña</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.loginButton, !canSubmit ? styles.disabledButton : null]} onPress={submit} activeOpacity={0.75} disabled={!canSubmit}>
                {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.loginText}>Iniciar sesión</Text>}
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
  form: { marginTop: 76, width: '100%' },
  label: { fontSize: 18, color: colors.primary, fontWeight: fontWeight.bold, marginBottom: 10 },
  labelTwo: { fontSize: 18, color: colors.primary, fontWeight: fontWeight.bold, marginTop: 28, marginBottom: 10 },
  input: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: '#f3f8ff', paddingHorizontal: 14, color: colors.primary, fontSize: 15 },
  inputWithIcon: { height: 52, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: '#f3f8ff', flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, height: 52, paddingLeft: 14, color: colors.primary, fontSize: 15 },
  eyeButton: { width: 48, height: 52, alignItems: 'center', justifyContent: 'center' },
  errorText: { marginTop: 10, color: '#bd3b5b', fontSize: 12, lineHeight: 16 },
  restore: { alignSelf: 'flex-end', marginTop: 28 },
  restoreText: { color: colors.gold, fontSize: 15, fontWeight: fontWeight.bold, textDecorationLine: 'underline' },
  loginButton: { marginTop: 27, height: 52, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { backgroundColor: '#d3d3d3' },
  loginText: { color: colors.white, fontSize: 16, fontWeight: fontWeight.bold },
  lang: { marginTop: 22, alignSelf: 'center', height: 32, flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#d1d1d1' },
  en: { width: 45, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  es: { width: 43, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  enText: { color: colors.primary, fontSize: 18, fontWeight: fontWeight.bold },
  esText: { color: colors.white, fontSize: 18, fontWeight: fontWeight.bold },
  footer: { position: 'absolute', bottom: 31, left: 0, right: 0, alignItems: 'center' },
  footerText: { color: colors.muted, fontSize: 15 },
  footerBrand: { color: colors.muted, fontSize: 14, fontWeight: fontWeight.bold, marginTop: 6, letterSpacing: 0.8 },
});
