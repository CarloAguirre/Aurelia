import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight, spacing } from '../../shared/theme/tokens';
import { FieldBox, FieldLabel, FormCard, FormStepper, LocationMapPreview, ManualFooter, ManualHeader, OfflineBanner, SelectBox } from '../../shared/components/form/ManualFormUi';
import { useMobileSession } from '../auth/mobileSession.store';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionCatalogs } from './useManualInspectionCatalogs';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionLocation } from './useManualInspectionLocation';

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.fieldGroup}><FieldLabel>{label}</FieldLabel>{children}</View>;
}

export function ManualIdentificationConnected() {
  const draft = useManualInspectionDraft();
  const user = useMobileSession((state) => state.user);
  const { online, hasSession } = useManualConnectivityStatus();
  const { areas, sectors, loadingAreas, loadingSectors } = useManualInspectionCatalogs();
  const { captureLocation, capturing, locationError } = useManualInspectionLocation();
  const inspectorName = user?.fullName ?? draft.inspectorName;
  const inspectorCompanyName = user?.companyName ?? draft.inspectorCompanyName;

  function cancel() {
    router.replace('/inspection/start');
  }

  function selectArea() {
    if (loadingAreas || !areas.length) return;
    const currentIndex = areas.findIndex((area) => area.id === draft.areaId);
    const nextArea = areas[(currentIndex + 1) % areas.length];
    draft.setArea(nextArea.id, nextArea.name);
  }

  function selectSector() {
    if (!draft.areaId || loadingSectors || !sectors.length) return;
    const currentIndex = sectors.findIndex((sector) => sector.id === draft.sectorId);
    const nextSector = sectors[(currentIndex + 1) % sectors.length];
    draft.setSector(nextSector.id, nextSector.name);
  }

  async function capture() {
    const ok = await captureLocation();
    if (!ok && locationError) Alert.alert('Ubicación', locationError);
  }

  function next() {
    if (!hasSession) {
      Alert.alert('Sesión requerida', 'Inicia sesión antes de enviar una inspección. Puedes seguir completando el borrador localmente.');
      return;
    }
    if (!draft.areaId || !draft.sectorId) {
      Alert.alert('Faltan datos', 'Selecciona área y sector antes de continuar.');
      return;
    }
    if (!draft.locationCaptured) {
      Alert.alert('Falta ubicación', 'Captura la ubicación real antes de continuar.');
      return;
    }
    Alert.alert('Siguiente paso', 'La pantalla Tipo de inspección se integrará en la siguiente iteración.');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <ManualHeader title="Identificación" subtitle="Paso 1 de 5" badge="GF HSE" />
          <OfflineBanner online={online} hasSession={hasSession} />
          <FormStepper activeStep={1} steps={['Datos', 'Tipo', 'Obs.', 'Resumen']} />
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            <View><Text style={styles.title}>Identificación</Text><Text style={styles.subtitle}>Completa los datos del inspector y de la inspección antes de continuar</Text></View>
            <FormCard icon={<FontAwesome5 name="user-tag" size={11} color={colors.blueLink} />} title="Datos del inspector" subtitle="¿Quién está realizando esta inspección?">
              <LabeledField label="Inspector *"><FieldBox value={inspectorName} /></LabeledField>
              <LabeledField label="Empresa del inspector *"><FieldBox value={inspectorCompanyName} /></LabeledField>
            </FormCard>
            <FormCard icon={<FontAwesome5 name="map-marked-alt" size={11} color={colors.teal} />} title="Datos de la inspección" subtitle="¿Dónde y cuándo se realiza esta inspección?">
              <View style={styles.twoColumns}>
                <View style={styles.column}><LabeledField label="Área *"><SelectBox value={draft.areaName ?? '-Seleccionar-'} loading={loadingAreas} onPress={selectArea} /></LabeledField></View>
                <View style={styles.column}><LabeledField label="Sector *"><SelectBox value={draft.sectorName ?? '-Seleccionar-'} loading={loadingSectors} disabled={!draft.areaId} onPress={selectSector} /></LabeledField></View>
              </View>
              <LabeledField label="Fecha de inspección *"><FieldBox value={draft.inspectionDate} variant="input" right={<FontAwesome5 name="calendar-alt" size={16} color={colors.primary} />} /></LabeledField>
              <View style={styles.locationHeader}><FieldLabel>Ubicación *</FieldLabel><TouchableOpacity style={styles.infoButton} activeOpacity={0.7}><FontAwesome5 name="info" size={13} color={colors.blueLink} /></TouchableOpacity></View>
              <TouchableOpacity style={[styles.locationButton, !draft.locationCaptured && styles.locationButtonPending]} activeOpacity={0.8} onPress={capture} disabled={capturing}>
                <FontAwesome5 name={draft.locationCaptured ? 'check-circle' : 'crosshairs'} size={14} color={colors.white} />
                <Text style={styles.locationButtonText}>{capturing ? 'Capturando ubicación...' : draft.locationCaptured ? 'Ubicación capturada' : 'Capturar ubicación'}</Text>
              </TouchableOpacity>
              {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
              <FieldBox value={draft.locationLabel} variant="input" />
              <LocationMapPreview latitude={draft.latitude} longitude={draft.longitude} accuracyLabel={draft.locationAccuracyLabel} />
              <View style={styles.hintRow}><FontAwesome5 name="hand-point-up" size={11} color={colors.blueLink} /><Text style={styles.hintText}>Captura GPS real; el ajuste manual del pin queda para la siguiente iteración</Text></View>
            </FormCard>
          </ScrollView>
          <ManualFooter onCancel={cancel} onNext={next} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark },
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { flex: 1 },
  contentInner: { gap: 12, paddingHorizontal: 14, paddingTop: 14, paddingBottom: spacing.md },
  title: { fontSize: 18, lineHeight: 21.6, fontWeight: fontWeight.bold, color: colors.primary },
  subtitle: { marginTop: 4, fontSize: 12, lineHeight: 16.8, color: colors.muted },
  fieldGroup: { gap: 6 },
  twoColumns: { flexDirection: 'row', gap: 8 },
  column: { flex: 1 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoButton: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.blueLink, alignItems: 'center', justifyContent: 'center' },
  locationButton: { height: 48, borderRadius: 10, backgroundColor: '#3A9B3A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  locationButtonPending: { backgroundColor: colors.gold },
  locationButtonText: { fontSize: 13, fontWeight: fontWeight.bold, color: colors.white },
  errorText: { marginTop: -4, fontSize: 11, lineHeight: 15, color: '#BD3B5B' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hintText: { fontSize: 11, lineHeight: 14.3, color: colors.muted },
});
