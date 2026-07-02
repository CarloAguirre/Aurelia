import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQueries } from '@tanstack/react-query';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { InspectionFindingResponse, InspectionResponse } from '@aurelia/contracts';
import { InspectionFindingSeverity, InspectionFindingStatus, InspectionStatus } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { useAutoSyncPendingOperations } from '../../shared/hooks/useAutoSyncPendingOperations';
import { useMobileSession } from '../auth/mobileSession.store';
import { useInspectionHomeSummary, useMobileInspections } from './hooks/useInspectionHomeData';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionFlowStore } from './manualInspectionFlow.store';
import { getManualInspectionDraftById } from './manualInspectionDrafts.storage';
import { useManualInspectionDrafts } from './hooks/useManualInspectionDrafts';
import { fetchInspectionFindings } from '../../shared/services/inspections.api';
import BellIcon from '../../../assets/icons/home-bell.svg';
import FilterIcon from '../../../assets/icons/home-filter.svg';
import PlusIcon from '../../../assets/icons/home-plus.svg';
import ShieldIcon from '../../../assets/icons/home-shield.svg';
import FindingIcon from '../../../assets/icons/home-finding.svg';
import LogoMobile from '../../../assets/icons/logo_mobile.svg';

type Tone = 'red' | 'orange' | 'gold' | 'green' | 'gray';

type CardRowProps = {
  label: string;
  tag?: string;
  tone: Tone;
  icon: 'open' | 'closed' | 'rejected' | 'executed';
};

type SeverityBucket = {
  count: number;
  topSeverity: InspectionFindingSeverity | null;
};

type FindingSummary = {
  executed: SeverityBucket;
  open: SeverityBucket;
  closed: SeverityBucket;
  rejected: SeverityBucket;
  total: number;
};

function Metric({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function FooterGradient() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="footerGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="2.24%" stopColor="#002659" />
          <Stop offset="100%" stopColor="#004a3a" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#footerGradient)" />
    </Svg>
  );
}

function StatusGlyph({ icon, tone }: { icon: CardRowProps['icon']; tone: Tone }) {
  const palette = tonePalette[tone];
  const name = icon === 'closed' ? 'check-circle' : icon === 'rejected' ? 'times-circle' : icon === 'executed' ? 'check-circle' : 'clock';
  return <FontAwesome5 name={name} size={10} color={palette.fg} solid />;
}

function SeverityBadge({ label, tone }: { label: string; tone: Tone }) {
  const palette = tonePalette[tone];
  return (
    <View style={[styles.severityBadge, { backgroundColor: palette.badgeBg }]}> 
      <Text style={[styles.severityText, { color: palette.badgeFg }]}>{label}</Text>
    </View>
  );
}

function CardRow({ label, tag, tone, icon }: CardRowProps) {
  const palette = tonePalette[tone];
  return (
    <View style={[styles.cardRow, { backgroundColor: palette.bg }]}> 
      <View style={styles.cardRowLeft}>
        <StatusGlyph icon={icon} tone={tone} />
        <Text style={[styles.cardRowText, { color: palette.fg }]}>{label}</Text>
      </View>
      {tag ? <SeverityBadge label={tag} tone={tone} /> : null}
    </View>
  );
}

function TypeChip({ label }: { label: string }) {
  const isChecklist = label.toLowerCase().includes('checklist');
  return (
    <View style={[styles.typeChip, isChecklist ? styles.typeChipTeal : styles.typeChipBlue]}>
      {isChecklist ? <FontAwesome5 name="clipboard-check" size={9} color="#006153" /> : <FindingIcon width={12} height={9} />}
      <Text style={[styles.typeChipText, isChecklist ? styles.typeChipTextTeal : styles.typeChipTextBlue]}>{label}</Text>
    </View>
  );
}

function StatusChip({ status }: { status: InspectionStatus }) {
  const tone = getInspectionTone(status);
  const palette = tonePalette[tone];
  return (
    <View style={[styles.statusChip, { backgroundColor: palette.bg }]}> 
      <StatusGlyph icon={status === InspectionStatus.CLOSED ? 'closed' : 'open'} tone={tone} />
      <Text style={[styles.statusChipText, { color: palette.fg }]}>{inspectionStatusLabel[status]}</Text>
    </View>
  );
}

function InspectionCard({ inspection, index, findingSummary }: { inspection: InspectionResponse; index: number; findingSummary: FindingSummary | null }) {
  const tone = getInspectionTone(inspection.status);
  const displayId = `#${String(index + 1).padStart(3, '0')}`;
  const locationMeta = inspection.scheduledAt ? `Programada · ${formatDate(inspection.scheduledAt)}` : 'Sin fecha programada';
  const rows = buildCardRows(inspection, findingSummary);

  return (
    <View style={styles.card}>
      <View style={[styles.topLine, { backgroundColor: tonePalette[tone].line }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardTop}>
          <Text style={styles.id}>{displayId}</Text>
          <View style={styles.pills}>
            <TypeChip label={inspection.templateId ? 'Checklist' : 'Hallazgo'} />
            <StatusChip status={inspection.status} />
          </View>
        </View>
        <Text style={styles.cardTitle}>{inspection.title}</Text>
        <View style={styles.meta}>
          <FontAwesome5 name="map-marker-alt" size={10} color="#aaa" />
          <Text style={styles.metaText}>{locationMeta}</Text>
        </View>
        {rows.map((row) => (
          <CardRow key={`${inspection.id}-${row.label}-${row.icon}`} label={row.label} tag={row.tag} tone={row.tone} icon={row.icon} />
        ))}
      </View>
    </View>
  );
}

function DraftBox({ title, detail, progress, currentStep, onPress }: { title: string; detail: string; progress: number; currentStep: number; onPress: () => void }) {
  const safeProgress = Math.max(5, Math.min(progress, 100));
  return (
    <View style={styles.drafts}>
      <View style={styles.draftHeader}>
        <View>
          <Text style={styles.draftTitle}>Formularios inconclusos</Text>
          <Text style={styles.draftSub}>Continúa donde lo dejaste · guardados localmente</Text>
        </View>
        <View style={styles.redDot} />
      </View>
      <TouchableOpacity style={styles.draftBody} onPress={onPress}>
        <View style={styles.draftIcon}>
          <FontAwesome5 name="file-signature" size={18} color="#463100" />
        </View>
        <View style={styles.draftCopy}>
          <Text style={styles.draftName}>{title}</Text>
          <Text style={styles.draftMeta}>{detail}</Text>
          <View style={styles.progressWrap}>
            <View style={styles.progressRail}>
              <View style={[styles.progressFill, { width: `${safeProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{safeProgress}%</Text>
          </View>
        </View>
        <Text style={styles.chev}>›</Text>
        <View style={styles.step}>
          <Text style={styles.stepText}>Paso {currentStep}/5</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function StateCard({ title, detail, action, onPress, loading }: { title: string; detail: string; action?: string; onPress?: () => void; loading?: boolean }) {
  return (
    <View style={styles.stateCard}>
      {loading ? <ActivityIndicator color={colors.gold} /> : null}
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDetail}>{detail}</Text>
      {action && onPress ? (
        <TouchableOpacity style={styles.stateButton} onPress={onPress}>
          <Text style={styles.stateButtonText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function InspectionsHomeFigmaScreen() {
  useAutoSyncPendingOperations();
  const user = useMobileSession((state) => state.user);
  const hydrateDraft = useManualInspectionDraft((state) => state.hydrate);
  const hydrateFlow = useManualInspectionFlowStore((state) => state.hydrateFlow);
  const summaryQuery = useInspectionHomeSummary();
  const inspectionsQuery = useMobileInspections();
  const draftsQuery = useManualInspectionDrafts();
  const summary = summaryQuery.data;
  const inspections = inspectionsQuery.data ?? [];
  const visibleInspections = useMemo(
    () => inspections.filter((inspection) => inspection.status !== InspectionStatus.DRAFT),
    [inspections],
  );
  const drafts = draftsQuery.data ?? [];
  const findingsQueries = useQueries({
    queries: visibleInspections.map((inspection) => ({
      queryKey: ['mobile-inspecciones', 'inspection-findings', inspection.id],
      queryFn: async () => {
        try {
          return await fetchInspectionFindings(inspection.id);
        } catch {
          return [] as InspectionFindingResponse[];
        }
      },
      staleTime: 60_000,
      enabled: Boolean(inspection.id),
    })),
  });
  const isLoading = summaryQuery.isLoading || inspectionsQuery.isLoading;
  const isError = summaryQuery.isError || inspectionsQuery.isError;
  const inspectionsById = useMemo(() => {
    const map = new Map<string, FindingSummary>();
    for (let i = 0; i < visibleInspections.length; i += 1) {
      const findings = findingsQueries[i]?.data;
      if (findings && findings.length > 0) map.set(visibleInspections[i].id, summarizeFindings(findings));
    }
    return map;
  }, [visibleInspections, findingsQueries]);
  const prioritizedInspections = useMemo(() => {
    return [...visibleInspections].sort((left, right) => compareInspectionPriority(left, right, inspectionsById));
  }, [visibleInspections, inspectionsById]);
  const openInspections = prioritizedInspections.filter((inspection) => inspection.status !== InspectionStatus.CLOSED && inspection.status !== InspectionStatus.CANCELLED).length;
  const closedRate = prioritizedInspections.length === 0 ? '0%' : `${Math.round((prioritizedInspections.filter((inspection) => inspection.status === InspectionStatus.CLOSED).length / prioritizedInspections.length) * 100)}%`;
  const roleLabel = normalizeRoleLabel(user?.roles?.[0] ?? 'Inspector');
  const orgLabel = buildOrgLabel(user?.companyName ?? null, user?.areaName ?? null);
  const profileBadge = orgLabel ? `${roleLabel} · ${orgLabel}` : roleLabel;
  const canWriteInspections = (user?.permissions ?? []).includes('inspections:write');

  function refetch() {
    summaryQuery.refetch();
    inspectionsQuery.refetch();
    draftsQuery.refetch();
  }

  async function resumeDraft(draftId: string) {
    if (!canWriteInspections) {
      Alert.alert('Sin permiso', 'Tu perfil no tiene permiso para crear o continuar inspecciones.');
      return;
    }
    const persisted = await getManualInspectionDraftById(draftId);
    if (!persisted) return;
    hydrateDraft(persisted.draft);

    if ((persisted.draftMode ?? 'manual') === 'chat') {
      router.push('/inspection/chat');
      return;
    }

    hydrateFlow(persisted.currentStep);
    if (persisted.currentStep >= 4) {
      router.push('/inspection/manual/summary');
      return;
    }
    if (persisted.currentStep === 3) {
      router.push('/inspection/manual/observations');
      return;
    }
    if (persisted.currentStep === 2) {
      router.push('/inspection/manual/type');
      return;
    }
    router.push('/inspection/manual/identification');
  }

  function openNewInspection() {
    if (!canWriteInspections) {
      Alert.alert('Sin permiso', 'Tu perfil no tiene permiso para crear inspecciones.');
      return;
    }
    router.push('/inspection/start');
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <LogoMobile width={137} height={45} />
              <TouchableOpacity style={styles.bell}>
                <BellIcon width={20} height={16} />
              </TouchableOpacity>
            </View>
            <Text style={styles.hello}>Hola,</Text>
            <Text style={styles.name}>{user?.fullName ?? 'Karen Opazo S.'}</Text>
            <View style={styles.role}>
              <ShieldIcon width={13} height={10} />
              <Text style={styles.roleText}>{profileBadge}</Text>
            </View>
          </View>
          <View style={styles.metrics}>
            <Metric value={String(prioritizedInspections.length)} label="Total 2026" color={colors.primary} />
            <View style={styles.divider} />
            <Metric value={String(openInspections)} label="Abiertas" color="#463100" />
            <View style={styles.divider} />
            <Metric value={String(summary?.findings.overdue ?? 0)} label="SLA vencidos" color="#bd3b5b" />
            <View style={styles.divider} />
            <Metric value={closedRate} label="Obs. cerradas" color="#2a5c16" />
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.filter}>
              <FilterIcon width={15} height={12} />
              <Text style={styles.filterText}>Filtrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.newButton, !canWriteInspections && styles.newButtonDisabled]} onPress={openNewInspection}>
              <PlusIcon width={19} height={15} />
              <Text style={styles.newText}> Nueva inspección</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {drafts.map((draftRecord) => <DraftBox key={draftRecord.draftId} title={`${draftRecord.draft.findingTypeLabel ?? draftRecord.draft.inspectionTypeLabel} · ${draftRecord.draft.areaName ?? 'Sin área'}`} detail={[draftRecord.draft.areaName, draftRecord.draft.sectorName, draftRecord.draft.findingCompanyName].filter(Boolean).join(' · ') || draftRecord.updatedAt} progress={draftRecord.progressPercentage} currentStep={draftRecord.currentStep} onPress={() => { void resumeDraft(draftRecord.draftId); }} />)}
            {isLoading ? (
              <StateCard loading title="Cargando inspecciones" detail="Obteniendo resumen y listado desde la API." />
            ) : isError ? (
              <StateCard title="No se pudo cargar la gestión" detail="Revisa la conexión con la API o vuelve a intentar." action="Reintentar" onPress={refetch} />
            ) : prioritizedInspections.length === 0 ? (
              <StateCard title="Sin inspecciones registradas" detail="Cuando se creen inspecciones desde terreno aparecerán en esta lista." action="Nueva inspección" onPress={openNewInspection} />
            ) : (
              prioritizedInspections.slice(0, 8).map((inspection, index) => <InspectionCard key={inspection.id} inspection={inspection} index={index} findingSummary={inspectionsById.get(inspection.id) ?? null} />)
            )}
          </ScrollView>
          <View style={styles.tabs}>
            <FooterGradient />
            <View style={styles.tabActive}>
              <View style={styles.tabCount}>
                <Text style={styles.tabCountText}>{summary?.findings.open ?? 0}</Text>
              </View>
              <Text style={styles.tabActiveText}>Gestión de inspecciones</Text>
              <View style={styles.tabLine} />
            </View>
            <View style={styles.tabInactive}>
              <View style={styles.tabDot} />
              <Text style={styles.tabText}>Historial</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function normalizeRoleLabel(value: string): string {
  return value.replace(/_/g, ' ').trim().toUpperCase();
}

function extractAcronym(value: string | null): string {
  if (!value) return '';
  const words = value
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((word) => word[0].toUpperCase()).join('');
}

function buildOrgLabel(companyName: string | null, areaName: string | null): string {
  const companyAcronym = extractAcronym(companyName);
  const rawAreaAcronym = extractAcronym(areaName);
  const areaAcronym = rawAreaAcronym === 'MA' ? 'HSE' : rawAreaAcronym;
  if (companyAcronym && areaAcronym) return `${companyAcronym} ${areaAcronym}`;
  return companyAcronym || areaAcronym;
}

function severityOrder(severity: InspectionFindingSeverity | null): number {
  if (severity === InspectionFindingSeverity.CRITICAL) return 4;
  if (severity === InspectionFindingSeverity.HIGH) return 3;
  if (severity === InspectionFindingSeverity.MEDIUM) return 2;
  if (severity === InspectionFindingSeverity.LOW) return 1;
  return 0;
}

function severityLabel(severity: InspectionFindingSeverity | null): string | undefined {
  if (severity === InspectionFindingSeverity.CRITICAL) return 'Crítico';
  if (severity === InspectionFindingSeverity.HIGH) return 'Alto';
  if (severity === InspectionFindingSeverity.MEDIUM) return 'Medio';
  if (severity === InspectionFindingSeverity.LOW) return 'Bajo';
  return undefined;
}

function pluralLabel(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function incrementBucket(bucket: SeverityBucket, severity: InspectionFindingSeverity): void {
  bucket.count += 1;
  if (severityOrder(severity) > severityOrder(bucket.topSeverity)) bucket.topSeverity = severity;
}

function summarizeFindings(findings: InspectionFindingResponse[]): FindingSummary {
  const summary: FindingSummary = {
    executed: { count: 0, topSeverity: null },
    open: { count: 0, topSeverity: null },
    closed: { count: 0, topSeverity: null },
    rejected: { count: 0, topSeverity: null },
    total: findings.length,
  };

  for (const finding of findings) {
    if (finding.status === InspectionFindingStatus.IN_PROGRESS) {
      incrementBucket(summary.executed, finding.severity);
      continue;
    }
    if (finding.status === InspectionFindingStatus.OPEN) {
      incrementBucket(summary.open, finding.severity);
      continue;
    }
    if (finding.status === InspectionFindingStatus.CLOSED) {
      incrementBucket(summary.closed, finding.severity);
      continue;
    }
    incrementBucket(summary.rejected, finding.severity);
  }

  return summary;
}

function toneForSeverity(severity: InspectionFindingSeverity | null, fallback: Tone): Tone {
  if (severity === InspectionFindingSeverity.CRITICAL) return 'red';
  if (severity === InspectionFindingSeverity.HIGH || severity === InspectionFindingSeverity.MEDIUM) return 'gold';
  if (severity === InspectionFindingSeverity.LOW) return 'green';
  return fallback;
}

function buildCardRows(inspection: InspectionResponse, summary: FindingSummary | null): CardRowProps[] {
  if (!summary || summary.total === 0) {
    const closedFindings = Math.max(inspection.findingsCount - inspection.openFindingsCount, 0);
    return [
      {
        label: pluralLabel(inspection.openFindingsCount, 'abierta', 'abiertas'),
        tag: inspection.openFindingsCount > 0 ? 'Alto' : undefined,
        tone: inspection.openFindingsCount > 0 ? 'gold' : 'green',
        icon: 'open',
      },
      {
        label: pluralLabel(closedFindings, 'cerrada', 'cerradas'),
        tag: undefined,
        tone: 'green',
        icon: 'closed',
      },
      {
        label: `${inspection.findingsCount} totales`,
        tag: 'Observaciones',
        tone: 'gray',
        icon: 'rejected',
      },
    ];
  }

  const rows: CardRowProps[] = [];
  if (summary.executed.count > 0) {
    rows.push({
      label: pluralLabel(summary.executed.count, 'ejecutada', 'ejecutadas'),
      tag: severityLabel(summary.executed.topSeverity),
      tone: toneForSeverity(summary.executed.topSeverity, 'gold'),
      icon: 'executed',
    });
  }
  if (summary.open.count > 0) {
    rows.push({
      label: pluralLabel(summary.open.count, 'abierta', 'abiertas'),
      tag: severityLabel(summary.open.topSeverity),
      tone: toneForSeverity(summary.open.topSeverity, 'gold'),
      icon: 'open',
    });
  }
  if (summary.closed.count > 0) {
    rows.push({
      label: pluralLabel(summary.closed.count, 'cerrada', 'cerradas'),
      tone: 'green',
      icon: 'closed',
    });
  }
  if (summary.rejected.count > 0) {
    rows.push({
      label: pluralLabel(summary.rejected.count, 'rechazada', 'rechazadas'),
      tag: severityLabel(summary.rejected.topSeverity),
      tone: 'gray',
      icon: 'rejected',
    });
  }
  return rows;
}

function parseDateValue(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function derivePriority(inspection: InspectionResponse, summary: FindingSummary | undefined): { bucket: number; severity: number; createdAt: number } {
  const createdAt = parseDateValue(inspection.createdAt);
  if (summary) {
    if (summary.executed.count > 0) {
      return { bucket: 1, severity: severityOrder(summary.executed.topSeverity), createdAt };
    }
    if (summary.open.count > 0) {
      return { bucket: 2, severity: severityOrder(summary.open.topSeverity), createdAt };
    }
    return { bucket: 3, severity: severityOrder(summary.closed.topSeverity), createdAt };
  }

  if (inspection.status === InspectionStatus.RETURNED || inspection.status === InspectionStatus.UNDER_REVIEW || inspection.status === InspectionStatus.SUBMITTED) {
    return { bucket: 1, severity: 3, createdAt };
  }
  if (inspection.status === InspectionStatus.CLOSED || inspection.status === InspectionStatus.CANCELLED) {
    return { bucket: 3, severity: 0, createdAt };
  }
  if (inspection.openFindingsCount > 0) {
    return { bucket: 2, severity: 2, createdAt };
  }
  return { bucket: 3, severity: 0, createdAt };
}

function compareInspectionPriority(left: InspectionResponse, right: InspectionResponse, summaries: Map<string, FindingSummary>): number {
  const leftPriority = derivePriority(left, summaries.get(left.id));
  const rightPriority = derivePriority(right, summaries.get(right.id));

  if (leftPriority.bucket !== rightPriority.bucket) return leftPriority.bucket - rightPriority.bucket;
  if (leftPriority.severity !== rightPriority.severity) return rightPriority.severity - leftPriority.severity;

  if (leftPriority.bucket === 3) {
    return rightPriority.createdAt - leftPriority.createdAt;
  }

  return leftPriority.createdAt - rightPriority.createdAt;
}

function getInspectionTone(status: InspectionStatus): Tone {
  if (status === InspectionStatus.CLOSED) return 'green';
  if (status === InspectionStatus.CANCELLED) return 'gray';
  if (status === InspectionStatus.RETURNED) return 'red';
  return 'gold';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(new Date(value));
}

const inspectionStatusLabel: Record<InspectionStatus, string> = {
  [InspectionStatus.DRAFT]: 'Borrador',
  [InspectionStatus.SCHEDULED]: 'Programada',
  [InspectionStatus.IN_PROGRESS]: 'En progreso',
  [InspectionStatus.SUBMITTED]: 'Enviada',
  [InspectionStatus.UNDER_REVIEW]: 'En revisión',
  [InspectionStatus.RETURNED]: 'Devuelta',
  [InspectionStatus.CLOSED]: 'Cerrada',
  [InspectionStatus.CANCELLED]: 'Cancelada',
};

const tonePalette: Record<Tone, { bg: string; fg: string; line: string; badgeBg: string; badgeFg: string }> = {
  red: { bg: '#ffd0db', fg: '#570b1d', line: '#c4365a', badgeBg: '#c4365a', badgeFg: '#fff' },
  orange: { bg: '#ffe1cd', fg: '#532a0e', line: '#e8a820', badgeBg: '#e8a820', badgeFg: '#fff' },
  gold: { bg: '#ffeab8', fg: '#463100', line: '#e8a820', badgeBg: '#e8a820', badgeFg: '#fff' },
  green: { bg: '#e0ffd3', fg: '#2a5c16', line: '#2a5c16', badgeBg: '#e8a820', badgeFg: '#fff' },
  gray: { bg: '#f7f7f7', fg: '#646464', line: '#8a8a8a', badgeBg: '#c4365a', badgeFg: '#fff' },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark },
  screen: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: colors.navyDark, paddingHorizontal: 20, paddingTop: 26, paddingBottom: 20 },
  brandRow: { height: 51, flexDirection: 'row', alignItems: 'center' },
  bell: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  hello: { marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  name: { marginTop: 2, color: colors.white, fontSize: 22, lineHeight: 26.4, fontWeight: fontWeight.bold },
  role: { marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(200,160,100,0.4)', backgroundColor: 'rgba(200,160,100,0.2)', paddingHorizontal: 11, paddingVertical: 4 },
  roleText: { color: colors.gold, fontSize: 11, fontWeight: fontWeight.semibold },
  metrics: { height: 70, backgroundColor: colors.white, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 18, fontWeight: fontWeight.bold },
  metricLabel: { marginTop: 2, color: colors.muted, fontSize: 9, textAlign: 'center' },
  divider: { width: 1, marginVertical: 14, backgroundColor: colors.border },
  actions: { backgroundColor: colors.white, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 11, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  filter: { height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: colors.borderMid, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  filterText: { color: colors.body, fontSize: 12, fontWeight: fontWeight.semibold },
  newButton: { height: 52, borderRadius: 14, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: colors.gold, shadowOpacity: 0.3, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  newButtonDisabled: { opacity: 0.55 },
  newText: { color: colors.white, fontSize: 15, fontWeight: fontWeight.bold },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  drafts: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  draftHeader: { padding: 14, flexDirection: 'row', justifyContent: 'space-between' },
  draftTitle: { color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold },
  draftSub: { marginTop: 2, color: colors.muted, fontSize: 11 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#c4365a' },
  draftBody: { borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', minHeight: 76, paddingHorizontal: 12, gap: 10 },
  draftIcon: { width: 46, height: 46, borderRadius: 10, backgroundColor: '#ffeab8', alignItems: 'center', justifyContent: 'center' },
  draftCopy: { flex: 1 },
  draftName: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold },
  draftMeta: { marginTop: 2, color: colors.muted, fontSize: 11 },
  progressWrap: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressRail: { flex: 1, height: 5, borderRadius: 5, backgroundColor: colors.border },
  progressFill: { height: 5, borderRadius: 5, backgroundColor: colors.gold },
  progressText: { color: colors.muted, fontSize: 10, fontWeight: fontWeight.bold },
  chev: { color: colors.muted, fontSize: 24 },
  step: { position: 'absolute', top: 8, right: 10, borderRadius: 9, backgroundColor: '#f7f7f7', paddingHorizontal: 6, paddingVertical: 2 },
  stepText: { color: colors.muted, fontSize: 9, fontWeight: fontWeight.bold },
  card: { borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  topLine: { height: 4 },
  cardInner: { padding: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  id: { color: colors.muted, fontSize: 11, fontWeight: fontWeight.bold },
  pills: { flexDirection: 'row', gap: 5 },
  typeChip: { height: 21, borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6 },
  typeChipTeal: { backgroundColor: '#d6fff8' },
  typeChipBlue: { backgroundColor: '#e6f3ff' },
  typeChipText: { fontSize: 9, fontWeight: fontWeight.bold },
  typeChipTextTeal: { color: '#006153' },
  typeChipTextBlue: { color: '#24588b' },
  statusChip: { height: 21, borderRadius: 7, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  statusChipText: { fontSize: 9, fontWeight: fontWeight.bold },
  cardTitle: { marginTop: 8, color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold },
  meta: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.muted, fontSize: 11 },
  cardRow: { marginTop: 7, minHeight: 26, borderRadius: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  cardRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardRowText: { fontSize: 11, fontWeight: fontWeight.bold },
  severityBadge: { height: 18, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 6 },
  severityText: { fontSize: 9, fontWeight: fontWeight.bold },
  stateCard: { minHeight: 150, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', padding: 16 },
  stateTitle: { marginTop: 8, color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold, textAlign: 'center' },
  stateDetail: { marginTop: 4, color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  stateButton: { marginTop: 14, height: 38, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  stateButtonText: { color: colors.white, fontSize: 12, fontWeight: fontWeight.bold },
  tabs: { height: 84, position: 'relative', backgroundColor: colors.navyDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', overflow: 'hidden', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  tabActive: { alignItems: 'center', justifyContent: 'center', flex: 1, borderRadius: 8, backgroundColor: 'rgba(0,179,152,0.1)', paddingTop: 4, paddingBottom: 2 },
  tabCount: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#c4365a', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  tabCountText: { color: colors.white, fontSize: 11, fontWeight: fontWeight.bold },
  tabActiveText: { marginTop: 4, color: colors.teal, fontSize: 13, fontWeight: fontWeight.bold },
  tabLine: { marginTop: 5, width: '88%', height: 2, borderRadius: 2, backgroundColor: colors.teal },
  tabInactive: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 8 },
  tabDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: 'rgba(255,255,255,0.45)' },
  tabText: { marginTop: 8, color: 'rgba(255,255,255,0.58)', fontSize: 13 },
});
