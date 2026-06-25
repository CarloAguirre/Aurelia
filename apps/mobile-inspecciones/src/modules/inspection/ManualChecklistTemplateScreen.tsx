import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { InspectionAnswerValue, type InspectionChecklistItem, type InspectionChecklistTemplateResponse } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { FieldLabel, OfflineBanner, SelectBox } from '../../shared/components/form/ManualFormUi';
import { ManualFlowFooter, ManualFlowHeader } from '../../shared/components/form/ManualFlowScaffold';
import { ManualFormStepper, SelectSheet, type SelectSheetOption } from './ManualSelectionUi';
import { useInspectionChecklistTemplates } from './hooks/useInspectionChecklistTemplates';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';

type ChecklistItemRow = InspectionChecklistItem & { sectionTitle: string };

const answerOptions = [
  { label: 'SÍ', value: InspectionAnswerValue.COMPLIANT },
  { label: 'NO', value: InspectionAnswerValue.NOT_COMPLIANT },
  { label: 'N/A', value: InspectionAnswerValue.NOT_APPLICABLE },
];

function getItemsCount(template: InspectionChecklistTemplateResponse): number {
  return template.sections.reduce((total, section) => total + section.items.length, 0);
}

function getTemplateItems(template: InspectionChecklistTemplateResponse | undefined): ChecklistItemRow[] {
  if (!template) return [];
  return template.sections
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((section) => section.items
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({ ...item, sectionTitle: section.title })));
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
        <Text style={styles.metaText}>{code ?? 'Sin código'}</Text>
      </View>
      <View style={styles.metaItem}>
        <FontAwesome5 name="list-ul" size={13} color={colors.muted} />
        <Text style={styles.metaText}>{itemsCount ?? 0} ítems</Text>
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

function ProgressCard({ answeredCount, totalCount, answers }: { answeredCount: number; totalCount: number; answers: Record<string, InspectionAnswerValue> }) {
  const values = Object.values(answers);
  const yesCount = values.filter((value) => value === InspectionAnswerValue.COMPLIANT).length;
  const noCount = values.filter((value) => value === InspectionAnswerValue.NOT_COMPLIANT).length;
  const naCount = values.filter((value) => value === InspectionAnswerValue.NOT_APPLICABLE).length;
  const yesWidth = totalCount ? `${(yesCount / totalCount) * 100}%` : '0%';
  const noWidth = totalCount ? `${(noCount / totalCount) * 100}%` : '0%';
  const naWidth = totalCount ? `${(naCount / totalCount) * 100}%` : '0%';

  return (
    <View style={styles.progressCard}>
      <Text style={styles.progressText}>{answeredCount} de {totalCount} respondidos</Text>
      <View style={styles.progressRail}>
        <View style={[styles.progressYes, { width: yesWidth }]} />
        <View style={[styles.progressNo, { width: noWidth }]} />
        <View style={[styles.progressNa, { width: naWidth }]} />
      </View>
    </View>
  );
}

function ReferencePhotoBox() {
  return (
    <View style={styles.photoWrap}>
      <Text style={styles.photoLabel}>Foto referencial general para la inspección *</Text>
      <TouchableOpacity style={styles.photoBox} activeOpacity={0.75}>
        <Text style={styles.photoIcon}>📷</Text>
        <Text style={styles.photoTitle}>Tomar foto o galería</Text>
        <Text style={styles.photoSubtitle}>Fecha, hora y GPS automáticos</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChecklistAnswerButton({ label, value, selected, onPress }: { label: string; value: InspectionAnswerValue; selected: boolean; onPress: () => void }) {
  const selectedStyle = value === InspectionAnswerValue.COMPLIANT
    ? styles.answerButtonYes
    : value === InspectionAnswerValue.NOT_COMPLIANT
      ? styles.answerButtonNo
      : styles.answerButtonNa;

  return (
    <TouchableOpacity style={[styles.answerButton, selected && selectedStyle]} activeOpacity={0.75} onPress={onPress}>
      <Text style={[styles.answerButtonText, selected && styles.answerButtonTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChecklistItem({ item, index, answer, onAnswer }: { item: ChecklistItemRow; index: number; answer?: InspectionAnswerValue; onAnswer: (value: InspectionAnswerValue) => void }) {
  return (
    <View style={styles.itemWrap}>
      <View style={styles.questionRow}>
        <Text style={styles.itemIndex}>{index + 1}</Text>
        <Text style={styles.questionText}>{item.question}</Text>
      </View>
      <View style={styles.answerRow}>
        {answerOptions.map((option) => (
          <ChecklistAnswerButton key={option.value} label={option.label} value={option.value} selected={answer === option.value} onPress={() => onAnswer(option.value)} />
        ))}
      </View>
    </View>
  );
}

function ChecklistItemsCard({ template, items }: { template: InspectionChecklistTemplateResponse; items: ChecklistItemRow[] }) {
  const draft = useManualInspectionDraft();
  const setAnswer = useManualInspectionDraft((state) => state.setAnswer);
  const headerTitle = template.sections[0]?.title ?? template.name;

  return (
    <View style={styles.itemsCard}>
      <View style={styles.itemsHeader}>
        <Text style={styles.itemsHeaderTitle}>{headerTitle}</Text>
        <Text style={styles.itemsHeaderCode}>{template.code}</Text>
      </View>
      {items.length === 0 ? (
        <View style={styles.emptyItemsBox}>
          <Text style={styles.stateText}>Esta plantilla no tiene ítems activos.</Text>
        </View>
      ) : items.map((item, index) => (
        <ChecklistItem key={item.id} item={item} index={index} answer={draft.answersByItemId[item.id]} onAnswer={(value) => setAnswer(item.id, value)} />
      ))}
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
  const selectedTemplate = templates.find((template) => template.id === draft.templateId);
  const items = useMemo(() => getTemplateItems(selectedTemplate), [selectedTemplate]);
  const options = useMemo<SelectSheetOption[]>(() => templates.map(templateToOption), [templates]);
  const answeredCount = items.filter((item) => Boolean(draft.answersByItemId[item.id])).length;
  const canContinue = Boolean(selectedTemplate && items.length > 0 && answeredCount === items.length);

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
      Alert.alert('Ítems pendientes', 'Responde todos los ítems antes de continuar.');
      return;
    }
    Alert.alert('Siguiente paso', 'El resumen de la inspección se integrará en la siguiente iteración.');
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
            {selectedTemplate ? (
              <>
                <ProgressCard answeredCount={answeredCount} totalCount={items.length} answers={draft.answersByItemId} />
                <ReferencePhotoBox />
                <ChecklistItemsCard template={selectedTemplate} items={items} />
              </>
            ) : null}
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
  progressCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 13, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 } },
  progressText: { fontSize: 12, lineHeight: 15, fontWeight: fontWeight.bold, color: colors.primary },
  progressRail: { marginTop: 8, height: 6, borderRadius: 4, backgroundColor: colors.border, flexDirection: 'row', overflow: 'hidden' },
  progressYes: { height: 6, backgroundColor: '#3A9B3A' },
  progressNo: { height: 6, backgroundColor: '#C4365A' },
  progressNa: { height: 6, backgroundColor: colors.borderMid },
  photoWrap: { gap: 6 },
  photoLabel: { fontSize: 13, lineHeight: 16, fontWeight: fontWeight.bold, color: colors.primary },
  photoBox: { minHeight: 98, borderRadius: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderMid, backgroundColor: '#F6FAFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 24 },
  photoIcon: { fontSize: 28, lineHeight: 34 },
  photoTitle: { marginTop: 6, fontSize: 13, lineHeight: 16, fontWeight: fontWeight.semibold, color: colors.muted, textAlign: 'center' },
  photoSubtitle: { marginTop: 3, fontSize: 11, lineHeight: 14, color: colors.placeholder, textAlign: 'center' },
  itemsCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  itemsHeader: { minHeight: 36, backgroundColor: colors.navy, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  itemsHeaderTitle: { fontSize: 12, lineHeight: 15, fontWeight: fontWeight.bold, color: colors.white },
  itemsHeaderCode: { fontSize: 10, lineHeight: 12, color: 'rgba(255,255,255,0.45)' },
  itemWrap: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 2, paddingHorizontal: 12, paddingTop: 11, paddingBottom: 6 },
  itemIndex: { minWidth: 14, paddingTop: 1, fontSize: 10, lineHeight: 13, fontWeight: fontWeight.bold, color: colors.placeholder },
  questionText: { flex: 1, fontSize: 12, lineHeight: 18, color: colors.primary },
  answerRow: { flexDirection: 'row', gap: 6, paddingLeft: 32, paddingRight: 12 },
  answerButton: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: '#F6FAFF', alignItems: 'center', justifyContent: 'center' },
  answerButtonYes: { backgroundColor: '#EAF7EA', borderColor: '#3A9B3A' },
  answerButtonNo: { backgroundColor: '#FBE9EF', borderColor: '#C4365A' },
  answerButtonNa: { backgroundColor: '#EFEFEF', borderColor: colors.placeholder },
  answerButtonText: { fontSize: 12, lineHeight: 15, fontWeight: fontWeight.bold, color: colors.primary, textAlign: 'center' },
  answerButtonTextSelected: { color: colors.primary },
  emptyItemsBox: { padding: 14 },
});
