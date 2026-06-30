import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { OfflineBanner } from '../../shared/components/form/ManualFormUi';
import { ManualFlowFooter, ManualFlowHeader } from '../../shared/components/form/ManualFlowScaffold';
import { ManualFormStepper, type SelectSheetOption } from './ManualSelectionUi';
import { fetchInspectionFindingTypesLocalFirst } from '../../shared/services/api/inspection-finding-catalogs.api';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { type ManualFindingObservationDraft, useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';

const probabilities = ['Muy improbable', 'Improbable', 'Posible', 'Probable', 'Casi seguro'];
const consequences = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];
const matrix = [
  [5, 10, 15, 20, 25],
  [4, 8, 12, 16, 20],
  [3, 6, 9, 12, 15],
  [2, 4, 6, 8, 10],
  [1, 2, 3, 4, 5],
];

function EmptyObservationsCard() {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.infoIcon}><FontAwesome5 name="info" size={11} color="#4A90C4" /></View>
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>Sin observaciones aún</Text>
        <Text style={styles.emptyText}>Agrega al menos una observación para continuar. Puedes agregar todas las que encontraste en esta visita.</Text>
      </View>
    </View>
  );
}

function AddObservationButton({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.78} disabled={disabled} onPress={onPress} style={[styles.addButton, disabled && styles.addButtonDisabled]}>
      <FontAwesome5 name="plus" size={13} color={disabled ? '#D1D1D1' : '#1E5A92'} />
      <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>Agregar observación</Text>
    </TouchableOpacity>
  );
}

function assetName(uri: string) {
  const name = uri.split('/').pop();
  return name && name.includes('.') ? name : 'foto_obs1.jpg';
}

async function pickEvidence(onPick: (uri: string) => void) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== 'granted') {
    Alert.alert('Permiso requerido', 'Activa el permiso de galería para adjuntar imágenes.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: false, selectionLimit: 1 });
  if (!result.canceled && result.assets[0]?.uri) onPick(result.assets[0].uri);
}

function nextOption(current: string | null, options: string[]) {
  if (!current) return options[2] ?? options[0];
  const index = options.indexOf(current);
  return options[(index + 1) % options.length];
}

function riskScore(observation: ManualFindingObservationDraft) {
  const p = observation.probability ? probabilities.indexOf(observation.probability) + 1 : 0;
  const c = observation.consequence ? consequences.indexOf(observation.consequence) + 1 : 0;
  return p && c ? p * c : 0;
}

function riskLevel(score: number) {
  if (score >= 15) return 'Crítico';
  if (score >= 9) return 'Alto';
  if (score >= 6) return 'Medio';
  if (score > 0) return 'Bajo';
  return null;
}

function riskColor(score: number) {
  if (score >= 15) return '#F8C6D3';
  if (score >= 9) return '#F7BE8A';
  if (score >= 6) return '#FFE7A9';
  return '#CFF9C9';
}

function ObservationForm({ index, observation, onUpdate, onRemove }: { index: number; observation: ManualFindingObservationDraft; onUpdate: (patch: Partial<Omit<ManualFindingObservationDraft, 'id'>>) => void; onRemove: () => void }) {
  const score = riskScore(observation);
  const level = riskLevel(score);
  const complete = Boolean(observation.detectedCondition.trim() && observation.correctiveAction.trim() && observation.evidence && observation.probability && observation.consequence);

  function setEvidence(uri: string) {
    onUpdate({ evidence: { uri, name: assetName(uri) } });
  }

  return (
    <View style={styles.observationCard}>
      <View style={styles.observationHeader}>
        <FontAwesome5 name="plus-circle" size={12} color="#9B7440" />
        <Text style={styles.observationTitle}>NUEVA OBSERVACIÓN {index + 1}</Text>
      </View>
      <Text style={styles.fieldLabel}>Condición detectada *</Text>
      <TextInput multiline value={observation.detectedCondition} onChangeText={(value) => onUpdate({ detectedCondition: value })} placeholder="Describe la condición subestándar, su ubicación exacta y la norma que incumple..." placeholderTextColor="#8A8A8A" style={styles.textArea} textAlignVertical="top" />
      <Text style={styles.fieldLabel}>Fotografía "Antes" *</Text>
      <TouchableOpacity activeOpacity={0.75} onPress={() => pickEvidence(setEvidence)} style={[styles.photoBox, observation.evidence && styles.photoBoxDone]}>
        {observation.evidence ? <View style={styles.photoIconDone}><FontAwesome5 name="camera" size={15} color={colors.white} /></View> : <Text style={styles.photoEmoji}>📷</Text>}
        <View style={styles.photoCopy}>
          <Text style={[styles.photoTitle, observation.evidence && styles.photoTitleDone]}>{observation.evidence?.name ?? 'Tomar foto o galería'}</Text>
          {!observation.evidence ? <Text style={styles.photoSub}>Fecha, hora y GPS automáticos</Text> : null}
        </View>
      </TouchableOpacity>
      <Text style={styles.fieldLabel}>Medidas correctivas propuestas</Text>
      <TextInput multiline value={observation.correctiveAction} onChangeText={(value) => onUpdate({ correctiveAction: value })} placeholder="Qué debe hacer la EECC para corregir esta condición..." placeholderTextColor="#8A8A8A" style={styles.textAreaSmall} textAlignVertical="top" />
      <Text style={styles.riskTitle}>Criticidad de la inspección</Text>
      <Text style={styles.riskSubtitle}>Califica el riesgo global de esta visita · aplica a las observaciones registradas</Text>
      <View style={styles.riskRow}>
        <View style={styles.riskSelectCard}>
          <Text style={styles.riskLabel}>PROBABILIDAD</Text>
          <TouchableOpacity style={styles.riskSelect} activeOpacity={0.75} onPress={() => onUpdate({ probability: nextOption(observation.probability, probabilities) })}>
            <Text style={styles.riskValue}>{observation.probability ?? 'Seleccionar'}</Text>
            <FontAwesome5 name="caret-down" size={15} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.riskHelp}>Frecuencia esperada del evento</Text>
        </View>
        <View style={styles.riskSelectCard}>
          <Text style={styles.riskLabel}>CONSECUENCIA</Text>
          <TouchableOpacity style={styles.riskSelect} activeOpacity={0.75} onPress={() => onUpdate({ consequence: nextOption(observation.consequence, consequences) })}>
            <Text style={styles.riskValue}>{observation.consequence ?? 'Seleccionar'}</Text>
            <FontAwesome5 name="caret-down" size={15} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.riskHelp}>Severidad del impacto ambiental</Text>
        </View>
      </View>
      {level ? <View style={styles.levelBox}><View><Text style={styles.levelLabel}>NIVEL CALCULADO</Text><Text style={styles.levelValue}>{level}</Text></View><Text style={styles.levelText}>Cierre prioritario. SLA configurable por Admin GF.</Text></View> : <View style={styles.pendingLevel}><Text style={styles.pendingText}>Selecciona ambos campos para calcular</Text></View>}
      {level ? <View style={styles.slaBox}><View><Text style={styles.slaLabel}>SLA CALCULADO</Text><Text style={styles.slaValue}>5 Días</Text></View><TouchableOpacity style={styles.slaButton} activeOpacity={0.75}><Text style={styles.slaButtonText}>Reasignar SLA</Text></TouchableOpacity></View> : null}
      <View style={styles.matrixCard}>
        <Text style={styles.matrixTitle}>Matriz 5×5 · referencia visual</Text>
        <View style={styles.matrixTopLabels}><Text style={styles.axisSpacer} />{[1, 2, 3, 4, 5].map((value) => <Text key={value} style={styles.matrixAxis}>{value}</Text>)}</View>
        {matrix.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.matrixRow}>
            <Text style={styles.matrixAxis}>{5 - rowIndex}</Text>
            {row.map((value) => <View key={value} style={[styles.matrixCell, { backgroundColor: riskColor(value) }, value === score && styles.matrixCellSelected]}><Text style={styles.matrixCellText}>{value}</Text></View>)}
          </View>
        ))}
        <View style={styles.legendRow}><Text style={styles.legendLow}>■ Bajo</Text><Text style={styles.legendMid}>■ Medio</Text><Text style={styles.legendHigh}>■ Alto</Text><Text style={styles.legendCritical}>■ Crítico</Text></View>
      </View>
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.75} onPress={onRemove}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity disabled={!complete} style={[styles.saveObservationBtn, !complete && styles.saveObservationBtnDisabled]} activeOpacity={0.75} onPress={() => onUpdate({ saved: true })}><Text style={styles.saveObservationText}>✓ Guardar observación</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function FindingTypeModal({ visible, selectedId, options, loading, errorMessage, onClose, onSelect }: { visible: boolean; selectedId: string | null; options: SelectSheetOption[]; loading: boolean; errorMessage: string | null; onClose: () => void; onSelect: (option: SelectSheetOption) => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tipo de hallazgo</Text>
            <TouchableOpacity style={styles.modalClose} activeOpacity={0.7} onPress={onClose}>
              <FontAwesome5 name="times" size={24} color="#131313" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {loading ? <View style={styles.modalEmpty}><Text style={styles.modalEmptyText}>Cargando tipos de hallazgo...</Text></View> : null}
            {!loading && errorMessage ? <View style={styles.modalEmpty}><Text style={styles.modalEmptyText}>{errorMessage}</Text></View> : null}
            {!loading && !errorMessage && options.length === 0 ? <View style={styles.modalEmpty}><Text style={styles.modalEmptyText}>No hay tipos de hallazgo disponibles. Sincroniza catálogos.</Text></View> : null}
            {!loading && !errorMessage && options.map((option) => {
              const selected = option.id === selectedId;
              return (
                <TouchableOpacity key={option.id} style={[styles.modalOption, selected && styles.modalOptionSelected]} activeOpacity={0.72} onPress={() => onSelect(option)}>
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function ManualFindingObservationsScreen() {
  const { online, hasSession } = useManualConnectivityStatus();
  const draft = useManualInspectionDraft();
  const setFindingType = useManualInspectionDraft((state) => state.setFindingType);
  const addFindingObservation = useManualInspectionDraft((state) => state.addFindingObservation);
  const updateFindingObservation = useManualInspectionDraft((state) => state.updateFindingObservation);
  const removeFindingObservation = useManualInspectionDraft((state) => state.removeFindingObservation);
  const activePicker = useManualInspectionFlowStore((state) => state.activePicker);
  const openPicker = useManualInspectionFlowStore((state) => state.openPicker);
  const closePicker = useManualInspectionFlowStore((state) => state.closePicker);
  const goToType = useManualInspectionFlowStore((state) => state.goToType);
  const goToObservations = useManualInspectionFlowStore((state) => state.goToObservations);
  const [findingTypeOptions, setFindingTypeOptions] = React.useState<SelectSheetOption[]>([]);
  const [findingTypeLoading, setFindingTypeLoading] = React.useState(true);
  const [findingTypeError, setFindingTypeError] = React.useState<string | null>(null);

  React.useEffect(() => {
    goToObservations();
  }, [goToObservations]);

  React.useEffect(() => {
    let mounted = true;
    setFindingTypeLoading(true);
    setFindingTypeError(null);
    fetchInspectionFindingTypesLocalFirst()
      .then((items) => {
        if (!mounted) return;
        setFindingTypeOptions(items.map((item) => ({ id: item.id, label: item.name, description: item.code })));
      })
      .catch(() => {
        if (!mounted) return;
        setFindingTypeOptions([]);
        setFindingTypeError('No se pudieron cargar los tipos de hallazgo desde catálogos.');
      })
      .finally(() => {
        if (mounted) setFindingTypeLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  function back() {
    closePicker();
    goToType();
    router.replace('/inspection/manual/type');
  }

  function selectFindingType(option: SelectSheetOption) {
    setFindingType(option.id, option.label);
    closePicker();
  }

  function addObservation() {
    if (!draft.findingTypeId) return;
    addFindingObservation();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <ManualFlowHeader title="Observaciones" subtitle="Paso 3 de 5" badge="GF HSE" onBack={back} />
          <OfflineBanner online={online} hasSession={hasSession} />
          <ManualFormStepper activeStep={3} steps={['Datos', 'Tipo', 'Obs.', 'Resumen']} />
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Tipo de hallazgo</Text>
              <Text style={styles.subtitle}>Seleccione el tipo de hallazgo antes de continuar con las observaciones para esta inspección.</Text>
            </View>
            <TouchableOpacity style={styles.selectBox} activeOpacity={0.75} onPress={() => openPicker('findingType')}>
              <Text style={[styles.selectText, !draft.findingTypeLabel && styles.selectPlaceholder]}>{draft.findingTypeLabel ?? 'Seleccione'}</Text>
              <FontAwesome5 name="caret-down" size={16} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.copyBlock}>
              <Text style={styles.title}>Observaciones</Text>
              <Text style={styles.subtitle}>Registra cada condición detectada en esta visita · una a una</Text>
            </View>
            {draft.findingObservations.length === 0 ? <EmptyObservationsCard /> : null}
            {draft.findingObservations.length === 0 ? <AddObservationButton disabled={!draft.findingTypeId} onPress={addObservation} /> : null}
            {draft.findingObservations.map((observation, index) => <ObservationForm key={observation.id} index={index} observation={observation} onUpdate={(patch) => updateFindingObservation(observation.id, patch)} onRemove={() => removeFindingObservation(observation.id)} />)}
          </ScrollView>
          <ManualFlowFooter secondaryLabel="Atrás" secondaryIcon="arrow-left" onSecondary={back} onPrimary={() => undefined} primaryDisabled />
          <FindingTypeModal visible={activePicker === 'findingType'} selectedId={draft.findingTypeId} options={findingTypeOptions} loading={findingTypeLoading} errorMessage={findingTypeError} onClose={closePicker} onSelect={selectFindingType} />
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
  selectBox: { minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: '#D1D1D1', backgroundColor: '#F6FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  selectText: { flex: 1, fontSize: 14, lineHeight: 18, fontWeight: fontWeight.medium, color: colors.primary },
  selectPlaceholder: { color: colors.primary },
  emptyCard: { minHeight: 90, borderRadius: 12, backgroundColor: '#4A90C4', flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: 14, paddingRight: 12, paddingVertical: 12 },
  infoIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  emptyCopy: { flex: 1, gap: 2 },
  emptyTitle: { fontSize: 13, lineHeight: 16.9, fontWeight: fontWeight.bold, color: colors.white },
  emptyText: { fontSize: 11, lineHeight: 15.4, color: 'rgba(255,255,255,0.88)' },
  addButton: { height: 48, borderRadius: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D1D1', backgroundColor: '#F6FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonDisabled: { opacity: 1 },
  addButtonText: { fontSize: 13, fontWeight: fontWeight.semibold, color: '#1E5A92' },
  addButtonTextDisabled: { color: '#D1D1D1' },
  observationCard: { borderWidth: 1.5, borderColor: colors.gold, borderRadius: 12, backgroundColor: colors.white, padding: 12, gap: 8 },
  observationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  observationTitle: { color: '#9B7440', fontSize: 12, lineHeight: 16, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  fieldLabel: { color: colors.primary, fontSize: 13, lineHeight: 17, fontWeight: fontWeight.bold },
  textArea: { minHeight: 78, borderWidth: 1.5, borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: '#F6FAFF', paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, lineHeight: 18, color: colors.primary },
  textAreaSmall: { minHeight: 76, borderWidth: 1.5, borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: '#F6FAFF', paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, lineHeight: 18, color: colors.primary },
  photoBox: { minHeight: 90, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: '#F6FAFF', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 4 },
  photoBoxDone: { minHeight: 58, borderWidth: 0, borderStyle: 'solid', backgroundColor: '#35A137', flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: 14 },
  photoEmoji: { fontSize: 22 },
  photoCopy: { alignItems: 'center' },
  photoIconDone: { width: 42, height: 42, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  photoTitle: { color: colors.muted, fontSize: 13, fontWeight: fontWeight.bold, textAlign: 'center' },
  photoTitleDone: { color: colors.white, textAlign: 'left' },
  photoSub: { color: '#B7B7B7', fontSize: 11, marginTop: 3 },
  riskTitle: { color: colors.primary, fontSize: 18, lineHeight: 22, fontWeight: fontWeight.bold, marginTop: 4 },
  riskSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  riskRow: { flexDirection: 'row', gap: 10 },
  riskSelectCard: { flex: 1, borderWidth: 1, borderColor: '#E1E1E1', borderRadius: 10, backgroundColor: colors.white, padding: 9, gap: 6 },
  riskLabel: { color: colors.muted, fontSize: 10, lineHeight: 13, fontWeight: fontWeight.bold, letterSpacing: 0.8 },
  riskSelect: { minHeight: 48, borderWidth: 1.5, borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: '#F6FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, gap: 6 },
  riskValue: { flex: 1, color: colors.primary, fontSize: 14, lineHeight: 18, fontWeight: fontWeight.medium },
  riskHelp: { color: '#B0B0B0', fontSize: 11, lineHeight: 14 },
  pendingLevel: { height: 64, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E1E1E1', borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' },
  pendingText: { color: '#B0B0B0', fontSize: 12 },
  levelBox: { borderWidth: 1.5, borderColor: '#F29A5B', borderRadius: 10, backgroundColor: '#FFDCC4', flexDirection: 'row', alignItems: 'center', gap: 18, padding: 12 },
  levelLabel: { color: '#5E3B24', fontSize: 10, lineHeight: 12, fontWeight: fontWeight.bold, letterSpacing: 0.7 },
  levelValue: { color: '#5E3B24', fontSize: 21, lineHeight: 24, fontWeight: fontWeight.bold },
  levelText: { flex: 1, color: '#5E3B24', fontSize: 12, lineHeight: 16 },
  slaBox: { borderWidth: 1.5, borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: '#F7F7F7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  slaLabel: { color: colors.primary, fontSize: 10, lineHeight: 12, fontWeight: fontWeight.bold, letterSpacing: 0.7 },
  slaValue: { color: colors.primary, fontSize: 22, lineHeight: 25, fontWeight: fontWeight.bold },
  slaButton: { borderWidth: 1.5, borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: colors.white, minHeight: 45, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  slaButtonText: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold },
  matrixCard: { borderWidth: 1, borderColor: '#E1E1E1', borderRadius: 10, backgroundColor: colors.white, padding: 10, gap: 5 },
  matrixTitle: { color: colors.primary, fontSize: 11, fontWeight: fontWeight.bold, marginBottom: 4 },
  matrixTopLabels: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  axisSpacer: { width: 16 },
  matrixAxis: { width: 16, color: '#A0A0A0', fontSize: 9, textAlign: 'center' },
  matrixRow: { flexDirection: 'row', gap: 3, alignItems: 'center' },
  matrixCell: { flex: 1, height: 23, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  matrixCellSelected: { borderWidth: 2, borderColor: colors.primary },
  matrixCellText: { color: '#3A2A1F', fontSize: 10, fontWeight: fontWeight.bold },
  legendRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  legendLow: { color: '#86D57E', fontSize: 10 },
  legendMid: { color: '#F1C45E', fontSize: 10 },
  legendHigh: { color: '#EE9A61', fontSize: 10 },
  legendCritical: { color: '#D97999', fontSize: 10 },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, height: 44, borderWidth: 1.5, borderColor: colors.gold, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  cancelText: { color: colors.goldDark, fontSize: 13, fontWeight: fontWeight.bold },
  saveObservationBtn: { flex: 1.35, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  saveObservationBtnDisabled: { backgroundColor: '#D1D1D1' },
  saveObservationText: { color: colors.white, fontSize: 13, fontWeight: fontWeight.bold },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.68)' },
  modalPanel: { maxHeight: '78%', minHeight: 540, backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  modalHeader: { minHeight: 76, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 22, paddingRight: 22, paddingTop: 8 },
  modalTitle: { flex: 1, fontSize: 18, lineHeight: 22, fontWeight: fontWeight.bold, color: colors.primary },
  modalClose: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  modalList: { flex: 1 },
  modalOption: { minHeight: 80, justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingHorizontal: 22, paddingVertical: 14 },
  modalOptionSelected: { backgroundColor: '#FAFAFA' },
  modalOptionText: { fontSize: 16, lineHeight: 24, color: colors.primary },
  modalEmpty: { minHeight: 120, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  modalEmptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
