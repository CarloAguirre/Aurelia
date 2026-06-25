import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing } from '../../shared/theme/tokens';
import BackArrowIcon from '../../../assets/icons/back-arrow.svg';
import FigmaAiChipIcon from '../../../assets/icons/figma-ai-chip.svg';
import FigmaSparklesSmallIcon from '../../../assets/icons/figma-sparkles-small.svg';
import FigmaClipboardIcon from '../../../assets/icons/figma-clipboard.svg';

function FeatureRow({ children }: { children: string }) {
  return (
    <View style={styles.featureRow}>
      <FontAwesome5 name="check" size={10} color={colors.successTxt} />
      <Text style={styles.featureText}>{children}</Text>
    </View>
  );
}

export function InspectionModeScreen() {
  function startAssistant() {
    router.push('/inspection/chat');
  }

  function openManual() {
    Alert.alert('Formulario manual', 'El wizard manual se integrará en una siguiente iteración.');
  }

  function cancelInspection() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/inspection/start');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.appHeader}>
            <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={cancelInspection}>
              <BackArrowIcon width={18} height={14} />
            </TouchableOpacity>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Nueva inspección</Text>
              <Text style={styles.headerSubtitle}>SGA · Gold Fields Salares Norte</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentInner}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroBlock}>
              <Text style={styles.heroTitle}>¿Cómo deseas registrar esta inspección?</Text>
              <Text style={styles.heroSubtitle}>Puedes usar el asistente IA o el formulario manual</Text>
            </View>

            <View style={styles.assistantCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.assistantIconBox}>
                  <FigmaAiChipIcon width={28} height={22} />
                </View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.assistantTitle}>Asistente AurelIA</Text>
                  <Text style={styles.cardSubtitle}>Modo conversacional con IA</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>RECOMENDADO</Text>
                </View>
              </View>

              <Text style={styles.assistantBody}>
                El asistente te guía con preguntas simples, propone medidas correctivas basadas en el historial de la faena y reduce el tiempo de registro.
              </Text>

              <View style={styles.featureList}>
                <FeatureRow>Medidas correctivas sugeridas por IA</FeatureRow>
                <FeatureRow>Criticidad calculada automáticamente</FeatureRow>
                <FeatureRow>Funciona online y offline</FeatureRow>
              </View>

              <TouchableOpacity style={styles.assistantButton} activeOpacity={0.82} onPress={startAssistant}>
                <View style={styles.assistantButtonContent}>
                  <FigmaSparklesSmallIcon width={18} height={16} />
                  <Text style={styles.assistantButtonText}>Iniciar con asistente</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.manualCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.manualIconBox}>
                  <FigmaClipboardIcon width={25} height={20} />
                </View>
                <View style={styles.manualTitleBlock}>
                  <Text style={styles.manualTitle}>Formulario manual</Text>
                  <Text style={styles.cardSubtitle}>Wizard de 5 pasos</Text>
                </View>
              </View>

              <Text style={styles.manualBody}>Completa el formulario paso a paso como siempre. Sin asistencia de IA.</Text>

              <TouchableOpacity style={styles.manualButton} activeOpacity={0.75} onPress={openManual}>
                <Text style={styles.manualButtonText}>Usar formulario manual</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.75} onPress={cancelInspection}>
              <Text style={styles.cancelButtonText}>Cancelar inspección</Text>
            </TouchableOpacity>
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.navyDark,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  appHeader: {
    height: 56,
    backgroundColor: colors.navyDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 2,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBlock: {
    flex: 1,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  headerSubtitle: {
    marginTop: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: 'rgba(255,255,255,0.55)',
  },
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: spacing.xl,
    gap: 20,
  },
  heroBlock: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  heroTitle: {
    maxWidth: 320,
    fontSize: 18,
    lineHeight: 23.4,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: fontSize.base,
    lineHeight: 18.2,
    fontWeight: fontWeight.regular,
    color: colors.muted,
    textAlign: 'center',
  },
  assistantCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 16,
    padding: 22,
    shadowColor: colors.gold,
    shadowOpacity: Platform.OS === 'web' ? 0.2 : 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assistantIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.goldDark,
  },
  cardTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  assistantTitle: {
    fontSize: 15,
    lineHeight: 17,
    fontWeight: fontWeight.bold,
    color: colors.goldDark,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: fontSize.sm,
    lineHeight: 14,
    fontWeight: fontWeight.regular,
    color: colors.muted,
  },
  badge: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.navy,
  },
  assistantBody: {
    marginTop: 12,
    fontSize: fontSize.md,
    lineHeight: 19.2,
    fontWeight: fontWeight.regular,
    color: colors.body,
  },
  featureList: {
    marginTop: 12,
    gap: 5,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  featureText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.successTxt,
  },
  assistantButton: {
    marginTop: 14,
    height: 46,
    width: '100%',
    backgroundColor: colors.gold,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  assistantButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.navy,
    textAlign: 'center',
  },
  manualCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 21.5,
  },
  manualIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualTitleBlock: {
    flex: 1,
  },
  manualTitle: {
    fontSize: 15,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  manualBody: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: fontSize.md,
    lineHeight: 18,
    fontWeight: fontWeight.regular,
    color: colors.muted,
  },
  manualButton: {
    height: 42,
    width: '100%',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderMid,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.body,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cancelButton: {
    height: 50,
    width: '100%',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gold,
    textAlign: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderMid,
    marginTop: 14,
    marginBottom: 8,
  },
});
