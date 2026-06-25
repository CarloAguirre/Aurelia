import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { InspectionType } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { OfflineBanner } from '../../shared/components/form/ManualFormUi';
import { ManualFormStepper } from './ManualSelectionUi';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';

type ManualTypeOption = {
  type: InspectionType;
  title: string;
  description: string;
  icon: string;
};

const typeOptions: ManualTypeOption[] = [
  {
    type: InspectionType.ENVIRONMENTAL,
    title: 'Hallazgo',
    description: 'Condición subestándar detectada · registro libre con foto',
    icon: 'search',
  },
  {
    type: InspectionType.REGULATORY,
    title: 'Checklist normativo',
    description: '8 plantillas disponibles · ítems NO generan hallazgo automático',
    icon: 'check',
  },
];

function Header() {
  function back() {
    useManualInspectionFlowStore.getState().goToIdentification();
    router.replace('/inspection/manual/identification');
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backIconButton} onPress={back} activeOpacity={0.75}>
        <FontAwesome5 name="arrow-left" size={18} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.headerCopy}>
        <Text style={styles.headerTitle}>Tipo de inspección</Text>
        <Text style={styles.headerSubtitle}>Paso 2 de 5</Text>
      </View>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>GF HSE</Text>
      </View>
    </View>
  );
}

function TypeOptionCard({ option, selected, onPress }: { option: ManualTypeOption; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.optionCard, selected ? styles.optionCardSelected : styles.optionCardIdle]} activeOpacity={0.82} onPress={onPress}>
      <View style={[styles.optionIcon, selected ? styles.optionIconSelected : styles.optionIconIdle]}>
        <FontAwesome5 name={option.icon} size={16} color={selected ? colors.white : '#AAAAAA'} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={[styles.optionTitle, selected ? styles.optionTitleSelected : styles.optionTitleIdle]}>{option.title}</Text>
        <Text style={styles.optionDescription}>{option.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

function FlowFooter() {
  const goToIdentification = useManualInspectionFlowStore((state) => state.goToIdentification);
  const goToObservations = useManualInspectionFlowStore((state) => state.goToObservations);
  const draft = useManualInspectionDraft();

  function back() {
    goToIdentification();
    router.replace('/inspection/manual/identification');
  }

  function next() {
    if (!draft.inspectionType) {
      Alert.alert('Tipo requerido', 'Selecciona el tipo de inspección antes de continuar.');
      return;
    }
    goToObservations();
    Alert.alert('Siguiente paso', 'La pantalla de observaciones se integrará en la siguiente iteración.');
  }

  return (
    <View style={styles.footer}>
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.75} onPress={back}>
          <FontAwesome5 name="arrow-left" size={14} color={colors.gold} />
          <Text style={styles.backText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.82} onPress={next}>
          <Text style={styles.nextText}>Continuar</Text>
          <FontAwesome5 name="arrow-right" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.homeIndicator} />
    </View>
  );
}

export function ManualInspectionTypeScreen() {
  const { online, hasSession } = useManualConnectivityStatus();
  const draft = useManualInspectionDraft();
  const setInspectionType = useManualInspectionDraft((state) => state.setInspectionType);
  const goToType = useManualInspectionFlowStore((state) => state.goToType);

  React.useEffect(() => {
    goToType();
  }, [goToType]);

  function selectType(option: ManualTypeOption) {
    setInspectionType(option.type, option.title);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <Header />
          <OfflineBanner online={online} hasSession={hasSession} />
          <ManualFormStepper activeStep={2} steps={['Datos', 'Tipo', 'Obs.', 'Resumen']} />
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Tipo de inspección</Text>
              <Text style={styles.subtitle}>Para esta inspección se ha seleccionado {draft.inspectionTypeLabel}</Text>
            </View>
            <View style={styles.options}>
              {typeOptions.map((option) => (
                <TypeOptionCard key={option.type} option={option} selected={draft.inspectionType === option.type} onPress={() => selectType(option)} />
              ))}
            </View>
          </ScrollView>
          <FlowFooter />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark },
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { minHeight: 56, backgroundColor: colors.navyDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  backIconButton: { width: 52, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, justifyContent: 'center', paddingHorizontal: 4 },
  headerTitle: { fontSize: 16, lineHeight: 19.2, fontWeight: fontWeight.bold, color: colors.white },
  headerSubtitle: { marginTop: 1, fontSize: 14, lineHeight: 16.8, color: 'rgba(255,255,255,0.55)' },
  headerBadge: { minHeight: 24, borderRadius: 16, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginRight: 8 },
  headerBadgeText: { fontSize: 11, lineHeight: 13, fontWeight: fontWeight.bold, color: colors.navy },
  content: { flex: 1 },
  contentInner: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 24 },
  copyBlock: { gap: 4 },
  title: { fontSize: 18, lineHeight: 21.6, fontWeight: fontWeight.bold, color: colors.primary },
  subtitle: { fontSize: 12, lineHeight: 16.8, color: colors.muted },
  options: { marginTop: 12, gap: 12 },
  optionCard: { minHeight: 68, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15.5, paddingVertical: 15.5, gap: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 } },
  optionCardIdle: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: '#E3E3E3', opacity: 0.5 },
  optionCardSelected: { backgroundColor: '#FDF8F1', borderWidth: 1.5, borderColor: colors.gold },
  optionIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  optionIconIdle: { backgroundColor: '#F7F7F7' },
  optionIconSelected: { backgroundColor: '#FDF0DC' },
  optionCopy: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 14, lineHeight: 18, fontWeight: fontWeight.bold },
  optionTitleIdle: { color: colors.primary },
  optionTitleSelected: { color: '#8E6E3E' },
  optionDescription: { fontSize: 11, lineHeight: 14.3, color: colors.muted },
  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 14, paddingTop: 10, alignItems: 'center' },
  footerButtons: { width: '100%', flexDirection: 'row', gap: 10 },
  backButton: { minHeight: 50, borderRadius: 14, borderWidth: 2, borderColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20, flexBasis: '32%' },
  backText: { fontSize: 16, lineHeight: 19.2, fontWeight: fontWeight.bold, color: colors.gold },
  nextButton: { flex: 1, minHeight: 50, borderRadius: 14, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.gold, shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  nextText: { fontSize: 16, lineHeight: 19.2, fontWeight: fontWeight.bold, color: colors.white },
  homeIndicator: { width: 120, height: 4, borderRadius: 2, backgroundColor: colors.borderMid, marginTop: 14, marginBottom: 8 },
});
