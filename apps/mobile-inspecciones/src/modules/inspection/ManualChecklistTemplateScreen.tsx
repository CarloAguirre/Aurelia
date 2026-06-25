import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import type { InspectionChecklistTemplateResponse } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { FieldLabel, OfflineBanner, SelectBox } from '../../shared/components/form/ManualFormUi';
import { ManualFlowFooter, ManualFlowHeader } from '../../shared/components/form/ManualFlowScaffold';
import { ManualFormStepper, SelectSheet, type SelectSheetOption } from './ManualSelectionUi';
import { useInspectionChecklistTemplates } from './hooks/useInspectionChecklistTemplates';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';

function getItemsCount(template: InspectionChecklistTemplateResponse): number {
  return template.sections.reduce((total, section) => total + section.items.length, 0);
}

function templateToOption(template: InspectionChecklistTemplateResponse): SelectSheetOption {
  const itemsCount = getItemsCount(template);
  return {
    id: template.id,
    label: template.name,
    description: `${template.code} · ${itemsCount} ítems`,
  };
}

function TemplateMeta({ code, itemsCount }: { code: string | null; itemsCount: number | null }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <FontAwesome5 name="hashtag" size={13} color={colors.muted} />
        <Text style={styles.metaText}>{code ?? 'FR-00007'}</Text>
      </View>
      <View style={styles.metaItem}>
        <FontAwesome5 name="list-ul" size={13} color={colors.muted} />
        <Text style={styles.metaText}>{itemsCount ?? 15} ítems</Text>
      </View>
    </View>
  );
}

function TemplateCard({ loading, error, empty, onOpen, onRetry }: { loading: boolean; error: boolean; empty: boolean; onOpen: () => void; onRetry: () => void }) {
  const draft = useManualInspectionDraft();
  const disabled = loading || error || empty;

  return (
    <View style={styles.templateCard}>
      <View style={styles.fieldGroup}>
        <FieldLabel>Seleccione la plantilla *</FieldLabel>
        <SelectBox value={draft.templateName ?? 'Seleccione'} loading={loading} disabled={disabled} onPress={onOpen} />
      </View>
      {loading ? (
        <View style={styles.stateRow}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.stateText}>Cargando plantillas desde la API</Text>
        </View>
      ) : null}
      {error ? (
        <TouchableOpacity style={styles.stateRow} onPress={onRetry} activeOpacity={0.75}>
          <FontAwesome5 name="exclamation-circle" size={13} color="#BD3B5B" />
          <Text style={styles.errorText}>No se pudieron cargar. Toca para reintentar.</Text>
        </TouchableOpacity>
      ) : null}
      {empty ? (
        <View style={styles.stateRow}>
          <FontAwesome5 name="inbox" size={13} color={colors.muted} />
          <Text style={styles.stateText}>No hay plantillas activas disponibles.</Text>
        </View>
      ) : null}
      {!loading && !error && !empty ? <TemplateMeta code={draft.templateCode} itemsCount={draft.templateItemsCount} /> : null}
    </View>
  );
}

export function ManualChecklistTemplateScreen() {
  const { online, hasSession } = useManualConnectivityStatus();
  const draft = useManualInspectionDraft();
  const setTemplate = useManualInspectionDraft((state) => state.setTemplate);
  const activePicker = useManualInspectionFlowStore((state) => state.activePicker);
  const openPicker = useManualInspectionFlowStore((state) => state.openPicker);
  const closePicker = useManualInspectionFlowStore((state) => state.closePicker);
  const goToType = useManualInspectionFlowStore((state) => state.goToType);
  const goToObservations = useManualInspectionFlowStore((state) => state.goToObservations);
  const templatesQuery = useInspectionChecklistTemplates();
  const templates = templatesQuery.data ?? [];
  const options = useMemo<SelectSheetOption[]>(() => templates.map(templateToOption), [templates]);
  const canContinue = Boolean(draft.templateId);

  React.useEffect(() => {
    goToObservations();
  }, [goToObservations]);

  function back() {
    closePicker();
    goToType();
    router.replace('/inspection/manual/type');
  }

  function selectTemplate(option: SelectSheetOption) {
    const template = templates.find((item) => item.id === option.id);
    if (!template) return;
    setTemplate({ id: template.id, name: template.name, code: template.code, itemsCount: getItemsCount(template) });
    closePicker();
  }

  function next() {
    if (!canContinue) {
      Alert.alert('Plantilla requerida', 'Selecciona una plantilla antes de continuar.');
      return;
    }
    Alert.alert('Siguiente paso', 'La resolución de ítems del checklist se integrará en la siguiente iteración.');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <ManualFlowHeader title="Observaciones" subtitle="Paso 3 de 5" badge="GF HSE" onBack={back} />
          <OfflineBanner online={online} hasSession={hasSession} />
          <ManualFormStepper activeStep={3} steps={['Datos', 'Tipo', 'Ítems', 'Resumen']} />
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Checklist normativo</Text>
              <Text style={styles.subtitle}>Responde todos los ítems · los NO quedarán registrados como observaciones</Text>
            </View>
            <TemplateCard loading={templatesQuery.isLoading} error={templatesQuery.isError} empty={!templatesQuery.isLoading && !templatesQuery.isError && templates.length === 0} onOpen={() => openPicker('template')} onRetry={templatesQuery.refetch} />
          </ScrollView>
          <ManualFlowFooter secondaryLabel="Atrás" secondaryIcon="arrow-left" onSecondary={back} onPrimary={next} primaryDisabled={!canContinue} />
          <SelectSheet visible={activePicker === 'template'} title="Seleccione la plantilla" subtitle="Plantillas normativas disponibles" options={options} selectedId={draft.templateId} loading={templatesQuery.isLoading} emptyText="No hay plantillas activas" onClose={closePicker} onSelect={selectTemplate} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark },
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { flex: 1 },
  contentInner: { gap: 12, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 24 },
  copyBlock: { gap: 4 },
  title: { fontSize: 18, lineHeight: 21.6, fontWeight: fontWeight.bold, color: colors.primary },
  subtitle: { fontSize: 12, lineHeight: 16.8, color: colors.muted },
  templateCard: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, padding: 15.5, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 } },
  fieldGroup: { gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, lineHeight: 14, color: colors.muted },
  stateRow: { minHeight: 25, flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 6 },
  stateText: { fontSize: 11, lineHeight: 14, color: colors.muted },
  errorText: { fontSize: 11, lineHeight: 14, color: '#BD3B5B' },
});
