import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import type { InspectionResponse } from '@aurelia/contracts';
import { InspectionStatus } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { GoldFieldsAureliaLogo } from '../../shared/components/brand/GoldFieldsAureliaLogo';
import { useMobileSession } from '../auth/mobileSession.store';
import { useInspectionFlow } from './useInspectionFlow';
import { useInspectionHomeSummary, useMobileInspections } from './hooks/useInspectionHomeData';
import BellIcon from '../../../assets/icons/home-bell.svg';
import FilterIcon from '../../../assets/icons/home-filter.svg';
import PlusIcon from '../../../assets/icons/home-plus.svg';
import ShieldIcon from '../../../assets/icons/home-shield.svg';
import FindingIcon from '../../../assets/icons/home-finding.svg';

type Tone = 'red' | 'gold' | 'green' | 'gray';

function Metric({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SmallRow({ label, tag, tone }: { label: string; tag?: string; tone: Tone }) {
  const palette = tonePalette[tone];
  return (
    <View style={[styles.smallRow, { backgroundColor: palette.bg }]}> 
      <Text style={[styles.smallRowText, { color: palette.fg }]}>{label}</Text>
      {tag ? <Text style={[styles.smallRowTag, { color: palette.fg }]}>{tag}</Text> : null}
    </View>
  );
}

function InspectionCard({ inspection, index }: { inspection: InspectionResponse; index: number }) {
  const tone = getInspectionTone(inspection.status);
  const closedFindings = Math.max(inspection.findingsCount - inspection.openFindingsCount, 0);
  const displayId = `#${String(index + 1).padStart(3, '0')}`;
  const locationMeta = inspection.scheduledAt ? `Programada - ${formatDate(inspection.scheduledAt)}` : 'Sin fecha programada';

  return (
    <View style={styles.card}>
      <View style={[styles.topLine, { backgroundColor: tonePalette[tone].line }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardTop}>
          <Text style={styles.id}>{displayId}</Text>
          <View style={styles.pills}>
            <View style={styles.pillBlue}>
              <FindingIcon width={12} height={9} />
              <Text style={styles.pillBlueText}>Inspección</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: tonePalette[tone].bg }]}> 
              <Text style={[styles.statusPillText, { color: tonePalette[tone].fg }]}>● {inspectionStatusLabel[inspection.status]}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.cardTitle}>{inspection.title}</Text>
        <View style={styles.meta}>
          <FontAwesome5 name="map-marker-alt" size={10} color="#aaa" />
          <Text style={styles.metaText}>{locationMeta}</Text>
        </View>
        <SmallRow label={`${inspection.openFindingsCount} abiertas`} tag="Hallazgos" tone={inspection.openFindingsCount > 0 ? 'gold' : 'green'} />
        <SmallRow label={`${closedFindings} cerradas`} tag="Verificadas" tone="green" />
        <SmallRow label={`${inspection.findingsCount} totales`} tag="Observaciones" tone="gray" />
      </View>
    </View>
  );
}

function DraftBox({ title, detail, progress }: { title: string; detail: string; progress: number }) {
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
      <TouchableOpacity style={styles.draftBody} onPress={() => router.push('/inspection/manual/identification')}>
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
          <Text style={styles.stepText}>En progreso</Text>
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
  const user = useMobileSession((state) => state.user);
  const draftAreaName = useInspectionFlow((state) => state.areaName);
  const draftSectorName = useInspectionFlow((state) => state.sectorName);
  const draftTypeName = useInspectionFlow((state) => state.inspectionTypeName);
  const draftCompanyName = useInspectionFlow((state) => state.companyName);
  const draftProgressStep = useInspectionFlow((state) => state.progressStep);
  const summaryQuery = useInspectionHomeSummary();
  const inspectionsQuery = useMobileInspections();
  const summary = summaryQuery.data;
  const inspections = inspectionsQuery.data ?? [];
  const isLoading = summaryQuery.isLoading || inspectionsQuery.isLoading;
  const isError = summaryQuery.isError || inspectionsQuery.isError;
  const hasDraft = Boolean(draftAreaName || draftSectorName || draftTypeName || draftCompanyName || draftProgressStep > 0);
  const openInspections = summary ? getOpenInspections(summary.inspections.byStatus) : 0;
  const closedRate = summary ? `${summary.inspections.closedRate}%` : '0%';
  const roleLabel = user?.roles?.[0] ?? 'Inspector';
  const draftTitle = `${draftTypeName ?? 'Inspección'} · ${draftAreaName ?? 'Sin área'}`;
  const draftDetail = [draftAreaName, draftSectorName, draftCompanyName].filter(Boolean).join(' · ') || 'Datos parciales guardados en este dispositivo';
  const draftProgress = Math.max(20, draftProgressStep * 20);

  function refetch() {
    summaryQuery.refetch();
    inspectionsQuery.refetch();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <View style={styles.status}>
              <Text style={styles.time}>9:41</Text>
              <FontAwesome5 name="signal" size={15} color={colors.white} />
            </View>
            <View style={styles.brandRow}>
              <GoldFieldsAureliaLogo width={137} height={45} variant="white" />
              <TouchableOpacity style={styles.bell}>
                <BellIcon width={20} height={16} />
              </TouchableOpacity>
            </View>
            <Text style={styles.hello}>Hola,</Text>
            <Text style={styles.name}>{user?.fullName ?? 'Karen Opazo S.'}</Text>
            <View style={styles.role}>
              <ShieldIcon width={13} height={10} />
              <Text style={styles.roleText}>{roleLabel} · Admin GF HSE</Text>
            </View>
          </View>
          <View style={styles.metrics}>
            <Metric value={String(summary?.inspections.total ?? 0)} label="Total 2026" color={colors.primary} />
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
            <TouchableOpacity style={styles.newButton} onPress={() => router.push('/inspection/start')}>
              <PlusIcon width={19} height={15} />
              <Text style={styles.newText}> Nueva inspección</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {hasDraft ? <DraftBox title={draftTitle} detail={draftDetail} progress={draftProgress} /> : null}
            {isLoading ? (
              <StateCard loading title="Cargando inspecciones" detail="Obteniendo resumen y listado desde la API." />
            ) : isError ? (
              <StateCard title="No se pudo cargar la gestión" detail="Revisa la conexión con la API o vuelve a intentar." action="Reintentar" onPress={refetch} />
            ) : inspections.length === 0 ? (
              <StateCard title="Sin inspecciones registradas" detail="Cuando se creen inspecciones desde terreno aparecerán en esta lista." action="Nueva inspección" onPress={() => router.push('/inspection/start')} />
            ) : (
              inspections.slice(0, 8).map((inspection, index) => <InspectionCard key={inspection.id} inspection={inspection} index={index} />)
            )}
          </ScrollView>
          <View style={styles.tabs}>
            <View style={styles.tabActive}>
              <View style={styles.tabCount}>
                <Text style={styles.tabCountText}>{summary?.findings.open ?? 0}</Text>
              </View>
              <Text style={styles.tabActiveText}>Gestión de inspecciones</Text>
              <View style={styles.tabLine} />
            </View>
            <View style={styles.tabInactive}>
              <Text style={styles.tabDot}>•</Text>
              <Text style={styles.tabText}>Historial</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function getOpenInspections(byStatus: Record<InspectionStatus, number>): number {
  return [
    InspectionStatus.DRAFT,
    InspectionStatus.SCHEDULED,
    InspectionStatus.IN_PROGRESS,
    InspectionStatus.SUBMITTED,
    InspectionStatus.UNDER_REVIEW,
    InspectionStatus.RETURNED,
  ].reduce((total, status) => total + byStatus[status], 0);
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

const tonePalette: Record<Tone, { bg: string; fg: string; line: string }> = {
  red: { bg: '#ffd0db', fg: '#570b1d', line: '#c4365a' },
  gold: { bg: '#ffeab8', fg: '#463100', line: '#e8a820' },
  green: { bg: '#dfffce', fg: '#2a5c16', line: '#2a5c16' },
  gray: { bg: '#f1f1f1', fg: '#646464', line: '#8a8a8a' },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark },
  screen: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: colors.navyDark, paddingHorizontal: 20, paddingBottom: 20 },
  status: { height: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { color: colors.white, fontSize: 12, fontWeight: fontWeight.semibold },
  brandRow: { height: 51, marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  bell: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  hello: { marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  name: { marginTop: 2, color: colors.white, fontSize: 22, fontWeight: fontWeight.bold },
  role: { marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(200,160,100,0.4)', backgroundColor: 'rgba(200,160,100,0.2)', paddingHorizontal: 11, paddingVertical: 4 },
  roleText: { color: colors.gold, fontSize: 11, fontWeight: fontWeight.semibold },
  metrics: { height: 70, backgroundColor: colors.white, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 18, fontWeight: fontWeight.bold },
  metricLabel: { marginTop: 2, color: colors.muted, fontSize: 9, textAlign: 'center' },
  divider: { width: 1, marginVertical: 14, backgroundColor: colors.border },
  actions: { backgroundColor: colors.white, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  filter: { height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: colors.borderMid, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  filterText: { color: colors.body, fontSize: 12, fontWeight: fontWeight.semibold },
  newButton: { height: 52, borderRadius: 14, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  newText: { color: colors.white, fontSize: 15, fontWeight: fontWeight.bold },
  list: { flex: 1 },
  listContent: { padding: 14, gap: 10 },
  drafts: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  draftHeader: { padding: 14, flexDirection: 'row', justifyContent: 'space-between' },
  draftTitle: { color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold },
  draftSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  redDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#c4365a' },
  draftBody: { borderTopWidth: 1.5, borderTopColor: colors.border, paddingHorizontal: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  draftIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#ffeab8', alignItems: 'center', justifyContent: 'center' },
  draftCopy: { flex: 1 },
  draftName: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold },
  draftMeta: { color: colors.muted, fontSize: 11, marginTop: 3 },
  progressWrap: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressRail: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressFill: { height: 4, borderRadius: 2, backgroundColor: colors.gold },
  progressText: { color: colors.goldDark, fontSize: 10, fontWeight: fontWeight.bold },
  chev: { color: colors.muted, fontSize: 30 },
  step: { position: 'absolute', right: 20, top: 15, height: 18, borderRadius: 6, borderWidth: 1, borderColor: '#e8c86a', backgroundColor: '#ffeab8', paddingHorizontal: 7, justifyContent: 'center' },
  stepText: { color: '#463100', fontSize: 10, fontWeight: fontWeight.bold },
  card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden' },
  topLine: { height: 3 },
  cardInner: { padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { color: colors.blueLink, fontSize: 12, fontWeight: fontWeight.bold },
  pills: { flexDirection: 'row', gap: 8 },
  pillBlue: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#e6f3ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  pillBlueText: { color: '#0d3862', fontSize: 10, fontWeight: fontWeight.bold },
  statusPill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  statusPillText: { fontSize: 10, fontWeight: fontWeight.bold },
  cardTitle: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold, marginTop: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  metaText: { color: colors.muted, fontSize: 11 },
  smallRow: { marginTop: 5, borderRadius: 7, minHeight: 23, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smallRowText: { fontSize: 11, fontWeight: fontWeight.semibold },
  smallRowTag: { fontSize: 11, fontWeight: fontWeight.semibold },
  stateCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 18, alignItems: 'center', gap: 8 },
  stateTitle: { color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold, textAlign: 'center' },
  stateDetail: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  stateButton: { marginTop: 6, minHeight: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stateButtonText: { color: colors.white, fontSize: 13, fontWeight: fontWeight.bold },
  tabs: { height: 84, backgroundColor: colors.navyDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 },
  tabActive: { flex: 1, alignItems: 'center', gap: 6, borderRadius: 6, backgroundColor: 'rgba(0,179,152,0.09)', paddingTop: 5 },
  tabInactive: { flex: 1, alignItems: 'center', gap: 6 },
  tabCount: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#c4365a', alignItems: 'center', justifyContent: 'center' },
  tabCountText: { color: colors.white, fontSize: 9, fontWeight: fontWeight.bold },
  tabActiveText: { color: colors.teal, fontSize: 13, fontWeight: fontWeight.semibold },
  tabText: { color: 'rgba(255,255,255,0.44)', fontSize: 13 },
  tabDot: { color: 'rgba(255,255,255,0.2)', fontSize: 20 },
  tabLine: { width: '90%', height: 1.5, backgroundColor: colors.teal, borderRadius: 2 },
});
