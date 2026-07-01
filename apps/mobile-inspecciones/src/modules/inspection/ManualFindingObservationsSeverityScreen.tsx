import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import type { InspectionFindingSeverityResponse } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { OfflineBanner } from '../../shared/components/form/ManualFormUi';
import { ManualFlowFooter, ManualFlowHeader } from '../../shared/components/form/ManualFlowScaffold';
import { ManualFormStepper, type SelectSheetOption } from './ManualSelectionUi';
import { fetchInspectionFindingSeveritiesLocalFirst, fetchInspectionFindingTypesLocalFirst } from '../../shared/services/api/inspection-finding-catalogs.api';
import { type ManualFindingObservationDraft, useManualInspectionDraft } from './manualInspection.store';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';

type CatalogStatus = { loading: boolean; error: string | null };

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

async function pickEvidenceFromGallery(onPick: (uri: string) => void) {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.status !== 'granted') {
    Alert.alert('Permiso requerido', 'Activa el permiso de galería para adjuntar imágenes.');
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: false, selectionLimit: 1 });
  if (!result.canceled && result.assets[0]?.uri) onPick(result.assets[0].uri);
}

async function pickEvidenceFromCamera(onPick: (uri: string) => void) {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (permission.status !== 'granted') {
    Alert.alert('Permiso requerido', 'Activa el permiso de cámara para tomar fotografías.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: false });
  if (!result.canceled && result.assets[0]?.uri) onPick(result.assets[0].uri);
}

function selectedSeverity(observation: ManualFindingObservationDraft, severities: InspectionFindingSeverityResponse[]) {
  return severities.find((item) => item.name === observation.probability) ?? null;
}

function severitySlaLabel(severity: InspectionFindingSeverityResponse | null) {
  if (!severity) return null;
  return severity.closureTimeLabel || '5 Días';
}

function CatalogModal({ visible, title, selectedId, options, loading, errorMessage, onClose, onSelect }: { visible: boolean; title: string; selectedId: string | null; options: SelectSheetOption[]; loading: boolean; errorMessage: string | null; onClose: () => void; onSelect: (option: SelectSheetOption) => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.modalClose} activeOpacity={0.7} onPress={onClose}>
              <FontAwesome5 name="times" size={24} color="#131313" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {loading ? <View style={styles.modalEmpty}><Text style={styles.modalEmptyText}>Cargando opciones...</Text></View> : null}
            {!loading && errorMessage ? <View style={styles.modalEmpty}><Text style={styles.modalEmptyText}>{errorMessage}</Text></View> : null}
            {!loading && !errorMessage && options.length === 0 ? <View style={styles.modalEmpty}><Text style={styles.modalEmptyText}>No hay opciones disponibles. Sincroniza catálogos.</Text></View> : null}
            {!loading && !errorMessage && options.map((option) => (
              <TouchableOpacity key={option.id} style={[styles.modalOption, option.id === selectedId && styles.modalOptionSelected]} activeOpacity={0.72} onPress={() => onSelect(option)}>
                <Text style={[styles.modalOptionText, option.description ? styles.modalOptionTextStrong : null]}>{option.label}</Text>
                {option.description ? <Text style={styles.modalOptionDescription}>{option.description}</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function PhotoSourceModal({ visible, onClose, onCamera, onGallery }: { visible: boolean; onClose: () => void; onCamera: () => void; onGallery: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.photoSourcePanel}>
          <View style={styles.photoSourceHandle} />
          <Text style={styles.photoSourceHeading}>Seleccione el método</Text>
          <Text style={styles.photoSourceDescription}>Seleccione entre subir una foto desde la galería o tomar una foto</Text>
          <TouchableOpacity style={styles.photoSourceCard} activeOpacity={0.75} onPress={onGallery}>
            <View style={styles.photoSourceIconBox}><FontAwesome5 name="image" size={20} color="#666666" /></View>
            <View style={styles.photoSourceTextBox}>
              <Text style={styles.photoSourceTitle}>Subir una imagen</Text>
              <Text style={styles.photoSourceSub}>Seleccione la imagen desde su galería</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoSourceCard} activeOpacity={0.75} onPress={onCamera}>
            <View style={styles.photoSourceIconBox}><FontAwesome5 name="camera" size={20} color="#666666" /></View>
            <View style={styles.photoSourceTextBox}>
              <Text style={styles.photoSourceTitle}>Tomar una foto</Text>
              <Text style={styles.photoSourceSub}>Sacar una foto directamente con la cámara</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoSourceCancel} activeOpacity={0.75} onPress={onClose}>
            <Text style={styles.photoSourceCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ObservationForm({ index, observation, severities, severityStatus, onUpdate, onRemove }: { index: number; observation: ManualFindingObservationDraft; severities: InspectionFindingSeverityResponse[]; severityStatus: CatalogStatus; onUpdate: (patch: Partial<Omit<ManualFindingObservationDraft, 'id'>>) => void; onRemove: () => void }) {
  const [severityPickerOpen, setSeverityPickerOpen] = React.useState(false);
  const [photoPickerOpen, setPhotoPickerOpen] = React.useState(false);
  const severity = selectedSeverity(observation, severities);
  const slaLabel = severitySlaLabel(severity);
  const complete = Boolean(observation.detectedCondition.trim() && observation.correctiveAction.trim() && observation.evidence && severity);

  function setEvidence(uri: string) {
    onUpdate({ evidence: { uri, name: assetName(uri) } });
  }

  async function handleCamera() {
    setPhotoPickerOpen(false);
    await pickEvidenceFromCamera(setEvidence);
  }

  async function handleGallery() {
    setPhotoPickerOpen(false);
    await pickEvidenceFromGallery(setEvidence);
  }

  const severityOptions = severities.map((item) => ({ id: item.id, label: item.name, description: item.description }));

  return (
    <View style={styles.observationCard}>
      <View style={styles.observationHeader}>
        <FontAwesome5 name="plus-circle" size={12} color="#9B7440" />
        <Text style={styles.observationTitle}>NUEVA OBSERVACIÓN {index + 1}</Text>
      </View>
      <Text style={styles.fieldLabel}>Condición detectada *</Text>
      <TextInput multiline value={observation.detectedCondition} onChangeText={(value) => onUpdate({ detectedCondition: value })} placeholder="Describe la condición subestándar, su ubicación exacta y la norma que incumple..." placeholderTextColor="#8A8A8A" style={styles.textArea} textAlignVertical="top" />
      <Text style={styles.fieldLabel}>Fotografía "Antes" *</Text>
      <TouchableOpacity activeOpacity={0.75} onPress={() => setPhotoPickerOpen(true)} style={[styles.photoBox, observation.evidence && styles.photoBoxDone]}>
        {observation.evidence ? <View style={styles.photoIconDone}><FontAwesome5 name="camera" size={15} color={colors.white} /></View> : <Text style={styles.photoEmoji}>📷</Text>}
        <View style={styles.photoCopy}>
          <Text style={[styles.photoTitle, observation.evidence && styles.photoTitleDone]}>{observation.evidence?.name ?? 'Tomar foto o galería'}</Text>
          {!observation.evidence ? <Text style={styles.photoSub}>Fecha, hora y GPS automáticos</Text> : null}
        </View>
      </TouchableOpacity>
      <Text style={styles.fieldLabel}>Medidas correctivas propuestas</Text>
      <TextInput multiline value={observation.correctiveAction} onChangeText={(value) => onUpdate({ correctiveAction: value })} placeholder="Qué debe hacer la EECC para corregir esta condición..." placeholderTextColor="#8A8A8A" style={styles.textAreaSmall} textAlignVertical="top" />
      <Text style={styles.criticalityTitle}>Seleccione la criticidad</Text>
      <Text style={styles.criticalitySubtitle}>Califica el riesgo global de esta visita · aplica a las observaciones registradas</Text>
      <TouchableOpacity style={styles.criticalitySelect} activeOpacity={0.75} onPress={() => setSeverityPickerOpen(true)}>
        <Text style={[styles.criticalityValue, !severity && styles.criticalityPlaceholder]}>{severity?.name ?? 'Seleccione'}</Text>
        <FontAwesome5 name="caret-down" size={16} color={colors.primary} />
      </TouchableOpacity>
      {severity ? <View style={styles.slaHighlightBox}><View><Text style={styles.slaLabel}>SLA CALCULADO</Text><Text style={styles.slaValue}>{slaLabel}</Text></View><TouchableOpacity style={styles.slaButton} activeOpacity={0.75}><Text style={styles.slaButtonText}>Reasignar SLA</Text></TouchableOpacity></View> : null}
      <View style={styles.formActions}>
        <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.75} onPress={onRemove}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
        <TouchableOpacity disabled={!complete} style={[styles.saveObservationBtn, !complete && styles.saveObservationBtnDisabled]} activeOpacity={0.75} onPress={() => onUpdate({ saved: true })}><Text style={styles.saveObservationText}>✓ Guardar observación</Text></TouchableOpacity>
      </View>
      <CatalogModal visible={severityPickerOpen} title="Criticidad" selectedId={severity?.id ?? null} options={severityOptions} loading={severityStatus.loading} errorMessage={severityStatus.error} onClose={() => setSeverityPickerOpen(false)} onSelect={(option) => { const found = severities.find((item) => item.id === option.id); onUpdate({ probability: option.label, consequence: found?.description ?? null }); setSeverityPickerOpen(false); }} />
      <PhotoSourceModal visible={photoPickerOpen} onClose={() => setPhotoPickerOpen(false)} onCamera={handleCamera} onGallery={handleGallery} />
    </View>
  );
}

export function ManualFindingObservationsSeverityScreen() {
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
  const [findingTypeStatus, setFindingTypeStatus] = React.useState<CatalogStatus>({ loading: true, error: null });
  const [severityOptions, setSeverityOptions] = React.useState<InspectionFindingSeverityResponse[]>([]);
  const [severityStatus, setSeverityStatus] = React.useState<CatalogStatus>({ loading: true, error: null });

  React.useEffect(() => {
    goToObservations();
  }, [goToObservations]);

  React.useEffect(() => {
    let mounted = true;
    fetchInspectionFindingTypesLocalFirst()
      .then((items) => {
        if (!mounted) return;
        setFindingTypeOptions(items.map((item) => ({ id: item.id, label: item.name })));
        setFindingTypeStatus({ loading: false, error: null });
      })
      .catch(() => {
        if (!mounted) return;
        setFindingTypeOptions([]);
        setFindingTypeStatus({ loading: false, error: 'No se pudieron cargar los tipos de hallazgo desde catálogos.' });
      });
    fetchInspectionFindingSeveritiesLocalFirst()
      .then((items) => {
        if (!mounted) return;
        setSeverityOptions(items);
        setSeverityStatus({ loading: false, error: null });
      })
      .catch(() => {
        if (!mounted) return;
        setSeverityOptions([]);
        setSeverityStatus({ loading: false, error: 'No se pudo cargar la criticidad desde catálogos.' });
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
            {draft.findingObservations.map((observation, index) => <ObservationForm key={observation.id} index={index} observation={observation} severities={severityOptions} severityStatus={severityStatus} onUpdate={(patch) => updateFindingObservation(observation.id, patch)} onRemove={() => removeFindingObservation(observation.id)} />)}
          </ScrollView>
          <ManualFlowFooter secondaryLabel="Atrás" secondaryIcon="arrow-left" onSecondary={back} onPrimary={() => undefined} primaryDisabled />
          <CatalogModal visible={activePicker === 'findingType'} title="Tipo de hallazgo" selectedId={draft.findingTypeId} options={findingTypeOptions} loading={findingTypeStatus.loading} errorMessage={findingTypeStatus.error} onClose={closePicker} onSelect={selectFindingType} />
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
  criticalityTitle: { color: colors.primary, fontSize: 18, lineHeight: 22, fontWeight: fontWeight.bold, marginTop: 4 },
  criticalitySubtitle: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  criticalitySelect: { minHeight: 48, borderRadius: 10, borderWidth: 1.5, borderColor: '#D1D1D1', backgroundColor: '#F6FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, gap: 8 },
  criticalityValue: { flex: 1, color: colors.primary, fontSize: 15, lineHeight: 18, fontWeight: fontWeight.medium },
  criticalityPlaceholder: { color: colors.muted },
  slaHighlightBox: { borderWidth: 1.5, borderColor: '#F29A5B', borderRadius: 10, backgroundColor: '#FFDCC4', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 12 },
  slaLabel: { color: '#5E3B24', fontSize: 10, lineHeight: 12, fontWeight: fontWeight.bold, letterSpacing: 0.7 },
  slaValue: { color: '#5E3B24', fontSize: 22, lineHeight: 25, fontWeight: fontWeight.bold },
  slaButton: { borderWidth: 1.5, borderColor: '#D1D1D1', borderRadius: 10, backgroundColor: colors.white, minHeight: 45, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  slaButtonText: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold },
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
  modalOption: { minHeight: 88, justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingHorizontal: 22, paddingVertical: 14 },
  modalOptionSelected: { backgroundColor: '#FAFAFA' },
  modalOptionText: { fontSize: 16, lineHeight: 24, color: colors.primary, fontWeight: fontWeight.regular },
  modalOptionTextStrong: { fontWeight: fontWeight.bold },
  modalOptionDescription: { color: colors.primary, fontSize: 15, lineHeight: 22, marginTop: 12 },
  modalEmpty: { minHeight: 120, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  modalEmptyText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  photoSourcePanel: { backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30 },
  photoSourceHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: '#D1D1D1', marginBottom: 28 },
  photoSourceHeading: { color: colors.primary, fontSize: 22, lineHeight: 26, fontWeight: fontWeight.bold, marginBottom: 14 },
  photoSourceDescription: { color: colors.muted, fontSize: 16, lineHeight: 22, marginBottom: 22 },
  photoSourceCard: { minHeight: 82, borderWidth: 1.5, borderColor: '#E1E1E1', borderRadius: 12, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12, shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  photoSourceIconBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center' },
  photoSourceTextBox: { flex: 1, gap: 3 },
  photoSourceTitle: { color: colors.primary, fontSize: 18, lineHeight: 22, fontWeight: fontWeight.bold },
  photoSourceSub: { color: colors.muted, fontSize: 14, lineHeight: 18 },
  photoSourceCancel: { minHeight: 54, borderWidth: 1.5, borderColor: colors.gold, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  photoSourceCancelText: { color: colors.goldDark, fontSize: 17, lineHeight: 22, fontWeight: fontWeight.bold },
});
