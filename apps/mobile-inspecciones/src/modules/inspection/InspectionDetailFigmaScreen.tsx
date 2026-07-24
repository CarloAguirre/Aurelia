import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  InspectionFindingStatus,
  type InspectionDetailEvidenceResponse,
  type InspectionDetailFindingGroupKey,
  type InspectionDetailFindingItemResponse,
  type InspectionDetailResponse,
  type UpdateInspectionFindingRequest,
} from '@aurelia/contracts';
import { fetchInspectionDetail, updateInspectionFinding } from '../../shared/services/inspections.api';
import { API_URL } from '../../shared/services/http-client';
import { useMobileSession } from '../auth/mobileSession.store';

const GROUP_ORDER: InspectionDetailFindingGroupKey[] = ['executed', 'open', 'closed', 'rejected'];
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

type DetailTab = 'observations' | 'result' | 'followups' | 'general';

type Props = {
  inspectionId: string;
};

const groupUi: Record<InspectionDetailFindingGroupKey, { label: string; chip: string; fg: string; bg: string; border: string; icon: string }> = {
  executed: { label: 'Ejecutadas', chip: 'Ejecutado', fg: '#006153', bg: '#D7FFF6', border: '#00B398', icon: 'check-circle' },
  open: { label: 'Abiertas', chip: 'Abierto', fg: '#463100', bg: '#FFEAB8', border: '#BD3B5B', icon: 'clock' },
  closed: { label: 'Cerradas', chip: 'Cerrado', fg: '#2A5C16', bg: '#E0FFD3', border: '#6CC24A', icon: 'check-circle' },
  rejected: { label: 'Rechazadas', chip: 'Rechazado', fg: '#646464', bg: '#F1F1F1', border: '#ACACAC', icon: 'times-circle' },
};

function severityPalette(label: string) {
  const normalized = label.toLowerCase();
  if (normalized.includes('crít') || normalized.includes('crit')) return { backgroundColor: '#FFD0DB', borderColor: '#E87894', color: '#570B1D' };
  if (normalized.includes('alto')) return { backgroundColor: '#FFE1CD', borderColor: '#D98853', color: '#532A0E' };
  if (normalized.includes('medio') || normalized.includes('moder')) return { backgroundColor: '#FFEAB8', borderColor: '#E1AF3D', color: '#463100' };
  return { backgroundColor: '#E0FFD3', borderColor: '#6CC24A', color: '#2A5C16' };
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
}

function remainingDays(value: string | null | undefined): string {
  if (!value) return 'Sin fecha compromiso';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha compromiso';
  const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return `Vencido hace ${Math.abs(days)} ${Math.abs(days) === 1 ? 'día' : 'días'}`;
  return `${days} ${days === 1 ? 'día restante' : 'días restantes'}`;
}

function allFindings(detail: InspectionDetailResponse): InspectionDetailFindingItemResponse[] {
  return GROUP_ORDER.flatMap((group) => detail.findings[group]);
}

function tabsFor(detail: InspectionDetailResponse): Array<{ id: DetailTab; label: string }> {
  if (detail.header.kind === 'checklist') {
    return [
      { id: 'observations', label: 'Ítems NO' },
      { id: 'result', label: 'Resultado completo' },
      { id: 'followups', label: 'Seguimientos' },
      { id: 'general', label: 'Datos generales' },
    ];
  }
  return [
    { id: 'observations', label: 'Observaciones' },
    { id: 'followups', label: 'Seguimientos' },
    { id: 'general', label: 'Datos generales' },
  ];
}

function highestSeverity(detail: InspectionDetailResponse): string {
  const labels = allFindings(detail).map((finding) => finding.severityLabel).filter(Boolean);
  const score = (label: string) => {
    const value = label.toLowerCase();
    if (value.includes('crít') || value.includes('crit')) return 4;
    if (value.includes('alto')) return 3;
    if (value.includes('medio') || value.includes('moder')) return 2;
    return 1;
  };
  return labels.sort((left, right) => score(right) - score(left))[0] ?? 'Sin criticidad';
}

function earliestDueAt(detail: InspectionDetailResponse): string | null {
  return allFindings(detail)
    .map((finding) => finding.dueAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())[0] ?? null;
}

function Header({ detail }: { detail: InspectionDetailResponse }) {
  const metadata = [detail.header.metadataLine1, detail.header.metadataLine2].filter(Boolean).join('  ·  ');
  const severity = highestSeverity(detail);
  const severityUi = severityPalette(severity);
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.inspectionNumber}>{detail.header.inspectionNumber.startsWith('#') ? detail.header.inspectionNumber : `#${detail.header.inspectionNumber}`}</Text>
        <Text style={styles.title}>{detail.header.title}</Text>
        <View style={styles.metadataRow}>
          <View style={[styles.criticalChip, { backgroundColor: severityUi.backgroundColor, borderColor: severityUi.borderColor }]}><Text style={[styles.criticalChipText, { color: severityUi.color }]}>{severity}</Text></View>
          <Text style={styles.metadata} numberOfLines={2}>{metadata}</Text>
        </View>
      </View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar detalle" style={styles.closeButton} onPress={() => router.back()}>
        <FontAwesome5 name="times" size={20} color="#131313" />
      </TouchableOpacity>
    </View>
  );
}

function ProgressSummary({ detail }: { detail: InspectionDetailResponse }) {
  return (
    <View style={styles.progressSummary}>
      <View style={styles.progressHeading}>
        <Text style={styles.progressLabel}>Progreso de observaciones</Text>
        <Text style={styles.progressPercent}>{Math.round(detail.header.progressPercent)}%</Text>
      </View>
      <View style={styles.progressRail}>
        <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, detail.header.progressPercent))}%` }]} />
      </View>
      <View style={styles.statusPills}>
        {GROUP_ORDER.map((group) => {
          const ui = groupUi[group];
          return (
            <View key={group} style={[styles.statusPill, { backgroundColor: ui.bg }]}>
              <FontAwesome5 name={ui.icon} size={8} color={ui.fg} solid />
              <Text style={[styles.statusPillText, { color: ui.fg }]}>{detail.header.counts[group]} {ui.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TabBar({ detail, activeTab, onChange }: { detail: InspectionDetailResponse; activeTab: DetailTab; onChange: (tab: DetailTab) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabsFor(detail).map((tab) => (
        <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => onChange(tab.id)}>
          <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CriticalityCard({ detail }: { detail: InspectionDetailResponse }) {
  const severity = highestSeverity(detail);
  const dueAt = earliestDueAt(detail);
  const critical = severity.toLowerCase().includes('crít') || severity.toLowerCase().includes('crit');
  const severityUi = severityPalette(severity);
  return (
    <View style={[styles.criticalityCard, { backgroundColor: severityUi.backgroundColor, borderColor: severityUi.borderColor }]}>
      <FontAwesome5 name={critical ? 'exclamation-triangle' : 'shield-alt'} size={18} color={severityUi.color} />
      <View>
        <Text style={styles.criticalityEyebrow}>CRITICIDAD</Text>
        <Text style={styles.criticalityValue}>{severity}</Text>
        <Text style={styles.criticalitySla}>SLA: {remainingDays(dueAt)}</Text>
      </View>
    </View>
  );
}

function resolveEvidenceUri(evidence: InspectionDetailEvidenceResponse | undefined): string | null {
  if (!evidence) return null;
  if (evidence.fileId) return `${API_ORIGIN}/api/files/${encodeURIComponent(evidence.fileId)}/content`;
  if (!evidence.url) return null;
  if (evidence.url.startsWith('http')) return evidence.url;
  if (evidence.url.startsWith('/api/')) return `${API_ORIGIN}${evidence.url}`;
  return evidence.url;
}

function EvidenceBox({ title, evidence, waiting }: { title: string; evidence?: InspectionDetailEvidenceResponse; waiting?: boolean }) {
  const accessToken = useMobileSession((state) => state.accessToken);
  const uri = resolveEvidenceUri(evidence);
  return (
    <View style={styles.evidenceBox}>
      <View style={styles.evidenceHeader}><Text style={styles.evidenceHeaderText}>{title}</Text></View>
      <View style={[styles.evidenceBody, waiting && !uri && styles.evidenceWaiting]}>
        {uri ? <Image source={{ uri, headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined }} style={styles.evidenceImage} resizeMode="cover" /> : <Text style={styles.evidenceWaitingText}>{waiting ? 'Esperando evidencia' : 'Sin evidencia'}</Text>}
      </View>
    </View>
  );
}

function ReviewActions({ inspectionId, findingId }: { inspectionId: string; findingId: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: UpdateInspectionFindingRequest) => updateInspectionFinding(findingId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mobile-inspecciones'] });
    },
    onError: () => {
      Alert.alert('No fue posible actualizar', 'La acción requiere permisos de revisión de hallazgos. Revisa tu perfil o vuelve a intentar.');
    },
  });

  function approve() {
    Alert.alert('Aprobar corrección', 'El hallazgo quedará cerrado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Aprobar', onPress: () => mutation.mutate({ status: InspectionFindingStatus.CLOSED, closedAt: new Date().toISOString() }) },
    ]);
  }

  function reject() {
    Alert.alert('Rechazar corrección', 'El hallazgo volverá al flujo de corrección.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Rechazar', style: 'destructive', onPress: () => mutation.mutate({ status: InspectionFindingStatus.REJECTED, rejectedAt: new Date().toISOString(), rejectionReason: null }) },
    ]);
  }

  return (
    <View style={styles.reviewActions}>
      <TouchableOpacity style={[styles.rejectButton, mutation.isPending && styles.actionButtonDisabled]} disabled={mutation.isPending} onPress={reject}>
        <FontAwesome5 name="times" size={10} color="#570B1D" />
        <Text style={styles.rejectButtonText}>Rechazar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.approveButton, mutation.isPending && styles.actionButtonDisabled]} disabled={mutation.isPending} onPress={approve}>
        {mutation.isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <FontAwesome5 name="check" size={10} color="#FFFFFF" />}
        <Text style={styles.approveButtonText}>Aprobar corrección</Text>
      </TouchableOpacity>
    </View>
  );
}

function FindingCard({ finding, index, inspectionId }: { finding: InspectionDetailFindingItemResponse; index: number; inspectionId: string }) {
  const ui = groupUi[finding.statusGroup];
  const responsible = finding.responsibleUsers[0];
  return (
    <View style={[styles.findingCard, { borderColor: ui.border }]}>
      <View style={styles.findingTopRow}>
        <View style={styles.itemChip}><Text style={styles.itemChipText}>{finding.checklistItemId ? `Ítem ${index + 1}` : `Obs. ${index + 1}`}</Text></View>
        <View style={[styles.findingStatus, { backgroundColor: ui.bg }]}>
          <FontAwesome5 name={ui.icon} size={7} color={ui.fg} solid />
          <Text style={[styles.findingStatusText, { color: ui.fg }]}>{ui.chip}</Text>
        </View>
      </View>
      <Text style={styles.findingTitle}>{finding.title}</Text>
      {finding.condition ? <InfoBox icon="pen" label="Obs. inspector" value={finding.condition} /> : null}
      {finding.proposedCorrectiveAction ? <InfoBox icon="pen" label="Medidas correctivas" value={finding.proposedCorrectiveAction} /> : null}
      {finding.executedActionDescription ? <InfoBox icon="pen" label="Descripción de acción" value={finding.executedActionDescription} /> : null}
      {finding.rejectionReason ? <InfoBox icon="times-circle" label="Motivo de rechazo" value={finding.rejectionReason} /> : null}
      <View style={styles.responsibleRow}>
        <FontAwesome5 name="user" size={9} color="#ACACAC" solid />
        <Text style={styles.responsibleText}>{responsible?.fullName ?? 'Sin responsable'}{responsible?.companyName ? ` · ${responsible.companyName}` : ''}</Text>
      </View>
      <View style={styles.evidenceRow}>
        <EvidenceBox title="ANTES" evidence={finding.beforeEvidence[0]} />
        <EvidenceBox title="DESPUÉS" evidence={finding.afterEvidence[0]} waiting={finding.statusGroup === 'open'} />
      </View>
      {finding.statusGroup === 'open' && !finding.afterEvidence.length ? (
        <View style={styles.waitingRow}><FontAwesome5 name="clock" size={9} color="#463100" solid /><Text style={styles.waitingText}>Esperando evidencia de la EECC</Text></View>
      ) : null}
      {finding.dueAt ? <Text style={styles.dueText}>Fecha compromiso: {formatDate(finding.dueAt)} · {remainingDays(finding.dueAt)}</Text> : null}
      {finding.statusGroup === 'executed' ? <ReviewActions inspectionId={inspectionId} findingId={finding.findingId} /> : null}
    </View>
  );
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <FontAwesome5 name={icon} size={10} color="#ACACAC" />
      <Text style={styles.infoBoxText}><Text style={styles.infoBoxLabel}>{label}: </Text>{value}</Text>
    </View>
  );
}

function ObservationsPanel({ detail }: { detail: InspectionDetailResponse }) {
  const findings = allFindings(detail);
  return (
    <View style={styles.panel}>
      <CriticalityCard detail={detail} />
      <View style={styles.sectionHeading}>
        <FontAwesome5 name="list-ul" size={11} color="#24588B" />
        <Text style={styles.sectionHeadingText}>{findings.length} {detail.header.kind === 'checklist' ? 'ÍTEMS MARCADOS COMO NO' : 'OBSERVACIONES'} · {detail.header.counts.closed} CERRADAS</Text>
      </View>
      {findings.length ? findings.map((finding, index) => <FindingCard key={finding.findingId} finding={finding} index={index} inspectionId={detail.header.inspectionId} />) : <EmptyState text="No hay observaciones registradas para esta inspección." />}
    </View>
  );
}

function ResultPanel({ detail }: { detail: InspectionDetailResponse }) {
  const findings = allFindings(detail);
  const responded = Math.max(findings.length, detail.header.counts.open + detail.header.counts.closed + detail.header.counts.executed + detail.header.counts.rejected);
  return (
    <View style={styles.panel}>
      <View style={styles.sectionHeading}>
        <FontAwesome5 name="chart-bar" size={11} color="#24588B" />
        <Text style={styles.sectionHeadingText}>RESUMEN DEL CHECKLIST</Text>
      </View>
      <View style={styles.resultCard}>
        <View style={styles.resultProgress}><View style={[styles.resultProgressFill, { width: `${Math.max(0, Math.min(100, detail.header.progressPercent))}%` }]} /></View>
        <View style={styles.resultMetrics}>
          <ResultMetric value={`${Math.round(detail.header.progressPercent)}%`} label="Progreso informado" tone="green" />
          <ResultMetric value={String(responded)} label="Ítems con hallazgo" tone="red" />
          <ResultMetric value={String(detail.header.counts.closed)} label="Corregidos" tone="gray" />
          <ResultMetric value={String(detail.header.counts.open)} label="Pendientes" tone="muted" />
        </View>
      </View>
      <View style={styles.sectionHeading}>
        <FontAwesome5 name="list-ol" size={11} color="#24588B" />
        <Text style={styles.sectionHeadingText}>DETALLE ÍTEM A ÍTEM</Text>
      </View>
      <View style={styles.dataNotice}>
        <FontAwesome5 name="info-circle" size={14} color="#24588B" />
        <Text style={styles.dataNoticeText}>El contrato actual del detalle no entrega las respuestas conformes, N/A ni sin respuesta. Se muestran únicamente los ítems que generaron hallazgo, sin completar datos ficticios.</Text>
      </View>
      {findings.map((finding, index) => (
        <View key={finding.findingId} style={[styles.resultRow, finding.statusGroup !== 'closed' && styles.resultRowNo]}>
          <Text style={styles.resultIndex}>{index + 1}</Text>
          <Text style={styles.resultQuestion}>{finding.title}</Text>
          <View style={[styles.answerChip, finding.statusGroup === 'closed' ? styles.answerYes : styles.answerNo]}>
            <Text style={[styles.answerText, finding.statusGroup === 'closed' ? styles.answerYesText : styles.answerNoText]}>{finding.statusGroup === 'closed' ? 'CORREGIDO' : 'NO'}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ResultMetric({ value, label, tone }: { value: string; label: string; tone: 'green' | 'red' | 'gray' | 'muted' }) {
  const style = tone === 'green' ? styles.metricGreen : tone === 'red' ? styles.metricRed : tone === 'gray' ? styles.metricGray : styles.metricMuted;
  return <View style={[styles.resultMetric, style]}><Text style={styles.resultMetricValue}>{value}</Text><Text style={styles.resultMetricLabel}>{label}</Text></View>;
}

function FollowupsPanel({ detail }: { detail: InspectionDetailResponse }) {
  return (
    <View style={styles.panel}>
      <View style={styles.sectionHeading}>
        <FontAwesome5 name="project-diagram" size={11} color="#24588B" />
        <Text style={styles.sectionHeadingText}>SEGUIMIENTOS</Text>
      </View>
      <TimelineStep completed title="Inspección inicial" date={formatDate(detail.general.scheduledAt)} summary={`${allFindings(detail).length} hallazgos registrados`} last={detail.followups.length === 0} />
      {detail.followups.map((followup, index) => (
        <TimelineStep key={followup.followupId} completed={followup.completed} title={followup.title || `Seguimiento ${followup.sequenceNumber}`} date={formatDate(followup.performedAt)} summary={followup.description} last={index === detail.followups.length - 1} />
      ))}
      {!detail.followups.length ? <Text style={styles.timelineEmpty}>No se han registrado seguimientos posteriores.</Text> : null}
    </View>
  );
}

function TimelineStep({ completed, title, date, summary, last }: { completed: boolean; title: string; date: string; summary: string; last: boolean }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, completed ? styles.timelineDotDone : styles.timelineDotPending]}>{completed ? <FontAwesome5 name="check" size={8} color="#FFFFFF" /> : <View style={styles.timelineDotCore} />}</View>
        {!last ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineDate}>{date}</Text>
        <Text style={styles.timelineSummary}>{summary || '—'}</Text>
      </View>
    </View>
  );
}

function GeneralPanel({ detail }: { detail: InspectionDetailResponse }) {
  const findings = allFindings(detail);
  const responsible = detail.general.responsibles[0] ?? findings.flatMap((finding) => finding.responsibleUsers)[0];
  const dueAt = earliestDueAt(detail);
  const rows = [
    ['Tipo', detail.header.kind === 'checklist' ? 'Checklist normativo' : 'Hallazgo'],
    ['Plantilla', detail.general.templateName ?? '—'],
    ['Código', detail.general.templateCode ?? '—'],
    ['Fecha', formatDate(detail.general.scheduledAt)],
    ['Área', detail.general.areaName ?? '—'],
    ['Sector', detail.general.sectorName ?? '—'],
    ['Empresa EECC', detail.general.companyName ?? '—'],
    ['Responsable EECC', responsible?.fullName ?? '—'],
    ['Ubicación', detail.general.locationLabel ?? ([detail.general.latitude, detail.general.longitude].filter(Boolean).join(' ') || '—')],
  ];
  return (
    <View style={styles.panel}>
      <GeneralSection icon="user-tie" title="INSPECTOR">
        <GeneralRow label="Nombre" value={detail.general.inspectorName ?? '—'} />
        <GeneralRow label="Empresa" value={detail.general.inspectorCompanyName ?? '—'} />
      </GeneralSection>
      <GeneralSection icon="clipboard-check" title="INSPECCIÓN">
        {rows.map(([label, value]) => <GeneralRow key={label} label={label} value={value} />)}
      </GeneralSection>
      <GeneralSection icon="tachometer-alt" title="CRITICIDAD Y SLA">
        <GeneralRow label="Nivel" value={highestSeverity(detail)} />
        <GeneralRow label="Fecha compromiso" value={dueAt ? `${formatDate(dueAt)} · ${remainingDays(dueAt)}` : '—'} />
      </GeneralSection>
      <GeneralSection icon="chart-bar" title="RESULTADO">
        <GeneralRow label="Hallazgos totales" value={String(findings.length)} />
        <GeneralRow label="Ejecutados" value={String(detail.header.counts.executed)} />
        <GeneralRow label="Abiertos" value={String(detail.header.counts.open)} />
        <GeneralRow label="Cerrados" value={String(detail.header.counts.closed)} />
        <GeneralRow label="Rechazados" value={String(detail.header.counts.rejected)} />
        <GeneralRow label="Progreso" value={`${Math.round(detail.header.progressPercent)}%`} />
      </GeneralSection>
    </View>
  );
}

function GeneralSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return <View style={styles.generalSection}><View style={styles.sectionHeading}><FontAwesome5 name={icon} size={11} color="#24588B" /><Text style={styles.sectionHeadingText}>{title}</Text></View>{children}</View>;
}

function GeneralRow({ label, value }: { label: string; value: string }) {
  return <View style={styles.generalRow}><Text style={styles.generalLabel}>{label}</Text><Text style={styles.generalValue}>{value}</Text></View>;
}

function EmptyState({ text }: { text: string }) {
  return <View style={styles.emptyState}><FontAwesome5 name="clipboard" size={22} color="#ACACAC" /><Text style={styles.emptyText}>{text}</Text></View>;
}

function Footer() {
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.pdfButton} onPress={() => Alert.alert('PDF de inspección', 'La vista conserva el acceso visual definido en Figma. La API mobile aún no publica un endpoint de exportación PDF para ejecutar esta acción.')}> 
        <FontAwesome5 name="file-pdf" size={13} color="#333333" />
        <Text style={styles.pdfButtonText}>Descargar PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

export function InspectionDetailFigmaScreen({ inspectionId }: Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>('observations');
  const detailQuery = useQuery({
    queryKey: ['mobile-inspecciones', 'inspection-detail', inspectionId],
    queryFn: () => fetchInspectionDetail(inspectionId),
    enabled: Boolean(inspectionId),
    staleTime: 30_000,
  });
  const detail = detailQuery.data;
  const panel = useMemo(() => {
    if (!detail) return null;
    if (activeTab === 'result') return <ResultPanel detail={detail} />;
    if (activeTab === 'followups') return <FollowupsPanel detail={detail} />;
    if (activeTab === 'general') return <GeneralPanel detail={detail} />;
    return <ObservationsPanel detail={detail} />;
  }, [activeTab, detail]);

  if (detailQuery.isLoading) {
    return <SafeAreaView style={styles.safe}><View style={styles.center}><ActivityIndicator color="#C8A064" /><Text style={styles.centerText}>Cargando detalle real...</Text></View></SafeAreaView>;
  }
  if (detailQuery.isError || !detail) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <FontAwesome5 name="exclamation-circle" size={28} color="#BD3B5B" />
          <Text style={styles.centerTitle}>No fue posible cargar el detalle</Text>
          <Text style={styles.centerText}>Revisa la conexión con la API y vuelve a intentar.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => void detailQuery.refetch()}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}><Text style={styles.backLinkText}>Volver a inspecciones</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        <Header detail={detail} />
        <ProgressSummary detail={detail} />
        <TabBar detail={detail} activeTab={activeTab} onChange={setActiveTab} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>{panel}</ScrollView>
        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ECECEC' },
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { minHeight: 88, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E3E3E3', backgroundColor: '#FFFFFF' },
  headerCopy: { flex: 1, paddingRight: 8 },
  inspectionNumber: { fontSize: 13, lineHeight: 16, fontWeight: '700', color: '#001E39' },
  title: { marginTop: 2, fontSize: 17, lineHeight: 21, fontWeight: '700', color: '#2A2A2A' },
  metadataRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 7 },
  criticalChip: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#FFD0DB' },
  criticalChipText: { fontSize: 9, lineHeight: 11, fontWeight: '700', color: '#570B1D' },
  metadata: { flex: 1, fontSize: 10, lineHeight: 14, color: '#001E39' },
  closeButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  progressSummary: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#143049' },
  progressHeading: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  progressPercent: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  progressRail: { height: 5, marginTop: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.15)' },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: '#E0FFD3' },
  statusPills: { marginTop: 7, flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  statusPill: { minHeight: 17, borderRadius: 5, paddingHorizontal: 7, flexDirection: 'row', alignItems: 'center', gap: 3 },
  statusPillText: { fontSize: 9, lineHeight: 11, fontWeight: '600' },
  tabBar: { minHeight: 38, flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E3E3E3', backgroundColor: '#F7F7F7' },
  tab: { flex: 1, minHeight: 38, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#C8A064' },
  tabText: { textAlign: 'center', fontSize: 10, lineHeight: 12, fontWeight: '600', color: '#646464' },
  tabTextActive: { color: '#8E6E3E' },
  scroll: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 20 },
  panel: { paddingHorizontal: 14, paddingTop: 20, gap: 10 },
  criticalityCard: { minHeight: 74, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  criticalityCritical: { backgroundColor: '#FFD0DB', borderColor: '#E87894' },
  criticalityMedium: { backgroundColor: '#FFEAB8', borderColor: '#E1AF3D' },
  criticalityEyebrow: { fontSize: 9, lineHeight: 11, fontWeight: '700', letterSpacing: 0.5, color: '#463100' },
  criticalityValue: { fontSize: 17, lineHeight: 19, fontWeight: '700', color: '#2A2A2A' },
  criticalitySla: { marginTop: 2, fontSize: 10, color: '#463100' },
  sectionHeading: { marginTop: 4, minHeight: 20, flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionHeadingText: { flex: 1, fontSize: 10, lineHeight: 13, fontWeight: '700', letterSpacing: 0.55, color: '#646464' },
  findingCard: { borderWidth: 1.5, borderRadius: 8, padding: 12, backgroundColor: '#FFFFFF' },
  findingTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#E8F6FF' },
  itemChipText: { fontSize: 10, lineHeight: 12, fontWeight: '700', color: '#24588B' },
  findingStatus: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  findingStatusText: { fontSize: 9, lineHeight: 11, fontWeight: '700' },
  findingTitle: { marginTop: 8, fontSize: 12, lineHeight: 17, fontWeight: '500', color: '#131313' },
  infoBox: { marginTop: 8, borderWidth: 1, borderColor: '#E3E3E3', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 9, flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FAFAFA' },
  infoBoxText: { flex: 1, fontSize: 10, lineHeight: 14, fontStyle: 'italic', color: '#777777' },
  infoBoxLabel: { fontWeight: '600' },
  responsibleRow: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  responsibleText: { fontSize: 10, lineHeight: 13, color: '#777777' },
  evidenceRow: { marginTop: 8, flexDirection: 'row', gap: 6 },
  evidenceBox: { flex: 1, height: 88, borderWidth: 1, borderColor: '#E3E3E3', borderRadius: 5, overflow: 'hidden' },
  evidenceHeader: { height: 20, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: '#001E39' },
  evidenceHeaderText: { fontSize: 8, lineHeight: 10, fontWeight: '700', color: '#FFFFFF' },
  evidenceBody: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDF3FC' },
  evidenceImage: { width: '100%', height: '100%' },
  evidenceWaiting: { backgroundColor: '#F7F7F7' },
  evidenceWaitingText: { fontSize: 9, lineHeight: 12, fontStyle: 'italic', color: '#777777' },
  waitingRow: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  waitingText: { fontSize: 9, color: '#777777' },
  dueText: { marginTop: 7, fontSize: 9, color: '#777777' },
  reviewActions: { marginTop: 10, flexDirection: 'row', gap: 6 },
  rejectButton: { minHeight: 36, minWidth: 105, borderWidth: 1.5, borderColor: '#BD3B5B', borderRadius: 7, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#FFFFFF' },
  rejectButtonText: { fontSize: 10, fontWeight: '700', color: '#570B1D' },
  approveButton: { flex: 1, minHeight: 36, borderRadius: 7, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#00B398' },
  approveButtonText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  actionButtonDisabled: { opacity: 0.55 },
  resultCard: { borderWidth: 1, borderColor: '#E3E3E3', borderRadius: 8, padding: 12, backgroundColor: '#F7F7F7' },
  resultProgress: { height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: '#E3E3E3' },
  resultProgressFill: { height: 5, backgroundColor: '#34A853' },
  resultMetrics: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  resultMetric: { width: '48.7%', minHeight: 58, borderRadius: 7, padding: 10 },
  metricGreen: { backgroundColor: '#E0FFD3' },
  metricRed: { backgroundColor: '#FFD0DB' },
  metricGray: { backgroundColor: '#F1F1F1' },
  metricMuted: { backgroundColor: '#E3E3E3' },
  resultMetricValue: { fontSize: 18, lineHeight: 21, fontWeight: '700', color: '#333333' },
  resultMetricLabel: { marginTop: 2, fontSize: 9, lineHeight: 12, color: '#646464' },
  dataNotice: { borderRadius: 7, padding: 11, flexDirection: 'row', gap: 8, backgroundColor: '#E8F6FF' },
  dataNoticeText: { flex: 1, fontSize: 10, lineHeight: 14, color: '#24588B' },
  resultRow: { minHeight: 44, borderWidth: 1, borderColor: '#E3E3E3', borderBottomWidth: 0, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF' },
  resultRowNo: { backgroundColor: '#FFD0DB' },
  resultIndex: { width: 16, fontSize: 9, fontWeight: '700', color: '#ACACAC' },
  resultQuestion: { flex: 1, fontSize: 10, lineHeight: 14, color: '#333333' },
  answerChip: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  answerYes: { backgroundColor: '#E0FFD3' },
  answerNo: { backgroundColor: '#FFD0DB' },
  answerText: { fontSize: 8, fontWeight: '700' },
  answerYesText: { color: '#2A5C16' },
  answerNoText: { color: '#570B1D' },
  timelineRow: { minHeight: 66, flexDirection: 'row' },
  timelineRail: { width: 28, alignItems: 'center' },
  timelineDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: '#6CC24A' },
  timelineDotPending: { backgroundColor: '#C8A064' },
  timelineDotCore: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#001E39' },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#D5D5D5' },
  timelineCopy: { flex: 1, paddingLeft: 8, paddingBottom: 12 },
  timelineTitle: { fontSize: 12, lineHeight: 15, fontWeight: '700', color: '#131313' },
  timelineDate: { marginTop: 2, fontSize: 10, color: '#777777' },
  timelineSummary: { marginTop: 3, fontSize: 10, lineHeight: 14, color: '#777777' },
  timelineEmpty: { marginLeft: 36, fontSize: 10, fontStyle: 'italic', color: '#777777' },
  generalSection: { marginBottom: 8 },
  generalRow: { minHeight: 32, borderBottomWidth: 1, borderBottomColor: '#E3E3E3', paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  generalLabel: { fontSize: 11, color: '#646464' },
  generalValue: { flex: 1, textAlign: 'right', fontSize: 11, lineHeight: 15, fontWeight: '600', color: '#333333' },
  emptyState: { minHeight: 130, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { maxWidth: 260, textAlign: 'center', fontSize: 11, lineHeight: 16, color: '#777777' },
  footer: { minHeight: 70, borderTopWidth: 1, borderTopColor: '#E3E3E3', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'flex-end', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  pdfButton: { minHeight: 42, borderWidth: 1, borderColor: '#CFCFCF', borderRadius: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF' },
  pdfButtonText: { fontSize: 12, fontWeight: '600', color: '#333333' },
  center: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  centerTitle: { marginTop: 12, fontSize: 16, fontWeight: '700', color: '#2A2A2A' },
  centerText: { marginTop: 8, textAlign: 'center', fontSize: 12, lineHeight: 17, color: '#646464' },
  retryButton: { marginTop: 18, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 11, backgroundColor: '#001E39' },
  retryText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  backLink: { marginTop: 12, padding: 8 },
  backLinkText: { fontSize: 11, fontWeight: '600', color: '#24588B' },
});
