import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { OfflineBanner } from '../../shared/components/form/ManualFormUi';
import { ManualFlowFooter, ManualFlowHeader } from '../../shared/components/form/ManualFlowScaffold';
import { ManualFormStepper, type SelectSheetOption } from './ManualSelectionUi';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';

const findingTypeOptions: SelectSheetOption[] = [
  { id: 'atmospheric-emissions', label: 'Desviación en emisiones atmosféricas' },
  { id: 'substance-containment', label: 'Desviación en contención de sustancias' },
  { id: 'soil-or-heritage-sites', label: 'Desviación sobre suelo o sitios patrimoniales' },
  { id: 'vegetation-flora-fauna', label: 'Desviación en seguimiento de medidas de vegetación, flora y fauna' },
  { id: 'waste-management', label: 'Desviación en la gestión o eliminación de residuos' },
  { id: 'equipment-infrastructure', label: 'Desviación en el funcionamiento de equipos e infraestructura' },
  { id: 'water-resource', label: 'Desviación en manejo de recurso hídrico' },
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

function AddObservationButton({ disabled }: { disabled: boolean }) {
  return (
    <TouchableOpacity activeOpacity={0.78} disabled={disabled} style={[styles.addButton, disabled && styles.addButtonDisabled]}>
      <FontAwesome5 name="plus" size={13} color={disabled ? '#D1D1D1' : colors.goldDark} />
      <Text style={[styles.addButtonText, disabled && styles.addButtonTextDisabled]}>Agregar observación</Text>
    </TouchableOpacity>
  );
}

function FindingTypeModal({ visible, selectedId, onClose, onSelect }: { visible: boolean; selectedId: string | null; onClose: () => void; onSelect: (option: SelectSheetOption) => void }) {
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
            {findingTypeOptions.map((option) => {
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
  const activePicker = useManualInspectionFlowStore((state) => state.activePicker);
  const openPicker = useManualInspectionFlowStore((state) => state.openPicker);
  const closePicker = useManualInspectionFlowStore((state) => state.closePicker);
  const goToType = useManualInspectionFlowStore((state) => state.goToType);
  const goToObservations = useManualInspectionFlowStore((state) => state.goToObservations);

  React.useEffect(() => {
    goToObservations();
  }, [goToObservations]);

  function back() {
    closePicker();
    goToType();
    router.replace('/inspection/manual/type');
  }

  function selectFindingType(option: SelectSheetOption) {
    setFindingType(option.id, option.label);
    closePicker();
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
            <EmptyObservationsCard />
            <AddObservationButton disabled />
          </ScrollView>
          <ManualFlowFooter secondaryLabel="Atrás" secondaryIcon="arrow-left" onSecondary={back} onPrimary={() => undefined} primaryDisabled />
          <FindingTypeModal visible={activePicker === 'findingType'} selectedId={draft.findingTypeId} onClose={closePicker} onSelect={selectFindingType} />
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
  selectBox: { height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#D1D1D1', backgroundColor: '#F6FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
  selectText: { flex: 1, fontSize: 14, lineHeight: 18, fontWeight: fontWeight.medium, color: colors.primary },
  selectPlaceholder: { color: colors.primary },
  emptyCard: { minHeight: 90, borderRadius: 12, backgroundColor: '#4A90C4', flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: 14, paddingRight: 12, paddingVertical: 12 },
  infoIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  emptyCopy: { flex: 1, gap: 2 },
  emptyTitle: { fontSize: 13, lineHeight: 16.9, fontWeight: fontWeight.bold, color: colors.white },
  emptyText: { fontSize: 11, lineHeight: 15.4, color: 'rgba(255,255,255,0.88)' },
  addButton: { height: 48, borderRadius: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D1D1', backgroundColor: '#F6FAFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addButtonDisabled: { opacity: 1 },
  addButtonText: { fontSize: 13, fontWeight: fontWeight.semibold, color: colors.goldDark },
  addButtonTextDisabled: { color: '#D1D1D1' },
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
});
