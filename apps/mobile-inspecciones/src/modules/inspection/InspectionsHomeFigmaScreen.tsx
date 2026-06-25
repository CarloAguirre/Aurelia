import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import type { InspectionResponse } from '@aurelia/contracts';
import { InspectionStatus } from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { useMobileSession } from '../auth/mobileSession.store';
import { useInspectionFlow } from './useInspectionFlow';
import { useInspectionHomeSummary, useMobileInspections } from './hooks/useInspectionHomeData';
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

function InspectionCard({ inspection, index }: { inspection: InspectionResponse; index: number }) {
  const tone = getInspectionTone(inspection.status);
  const closedFindings = Math.max(inspection.findingsCount - inspection.openFindingsCount, 0);
  const displayId = `#${String(index + 1).padStart(3, '0')}`;
  const locationMeta = inspection.scheduledAt ? `Programada · ${formatDate(inspection.scheduledAt)}` : 'Sin fecha programada';

  return (
    <View style={styles.card}>
      <View style={[styles.topLine, { backgroundColor: tonePalette[tone].line }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardTop}>
          <Text style={styles.id}>{displayId}</Text>
          <View style={styles.pills}>
            <TypeChip label="Inspección" />
            <StatusChip status={inspection.status} />
          </View>
        </View>
        <Text style={styles.cardTitle}>{inspection.title}</Text>
        <View style={styles.meta}>
          <FontAwesome5 name="map-marker-alt" size={10} color="#aaa" />
          <Text style={styles.metaText}>{locationMeta}</Text>
        </View>
        <CardRow label={`${inspection.openFindingsCount} abiertas`} tag={inspection.openFindingsCount > 0 ? 'Alto' : undefined} tone={inspection.openFindingsCount > 0 ? 'gold' : 'green'} icon="open" />
        <CardRow label={`${closedFindings} cerradas`} tag={closedFindings > 0 ? 'Alto' : undefined} tone="green" icon="closed" />
        <CardRow label={`${inspection.findingsCount} totales`} tag="Observaciones" tone="gray" icon="rejected" />
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
          <Text style={styles.stepText}>Paso {Math.ceil(safeProgress / 20)}/5</Text>
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
  const draftTitle = hasDraft ? `${draftTypeName ?? 'Hallazgo'} · ${draftAreaName ?? 'Planta Procesos'}` : 'Hallazgo · Planta Procesos';
  const draftDetail = hasDraft ? [draftAreaName, draftSectorName, draftCompanyName].filter(Boolean).join(' · ') : 'Planta Procesos · Módulo C · STRACON · Ayer 16:54';
  const draftProgress = hasDraft ? Math.max(20, draftProgressStep * 20) : 40;

  function refetch() {
    summaryQuery.refetch();
    inspectionsQuery.refetch();
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
            <DraftBox title={draftTitle} detail={draftDetail} progress={draftProgress} />
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
  newText: { color: colors.white, fontSize: 15, fontWeight: fontWeight.bold },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
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
  stepText: { color: '#463100', fontSize: 10, fontWeight: fontWeight.bold, includeFontPadding: false, lineHeight: 10, textAlignVertical: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  topLine: { height: 3 },
  cardInner: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { color: colors.blueLink, fontSize: 12, fontWeight: fontWeight.bold },
  pills: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  typeChip: { height: 17, flexDirection: 'row', gap: 4, alignItems: 'center', borderRadius: 6, paddingHorizontal: 8, paddingTop: 0, paddingBottom: 0 },
  typeChipBlue: { backgroundColor: '#e6f3ff' },
  typeChipTeal: { backgroundColor: '#c5fff6' },
  typeChipText: { fontSize: 10, lineHeight: 10, fontWeight: fontWeight.bold, includeFontPadding: false, textAlignVertical: 'center' },
  typeChipTextBlue: { color: '#0d3862' },
  typeChipTextTeal: { color: '#006153' },
  statusChip: { height: 18, flexDirection: 'row', gap: 4, alignItems: 'center', borderRadius: 6, paddingHorizontal: 8, paddingTop: 0, paddingBottom: 0 },
  statusChipText: { fontSize: 10, lineHeight: 10, fontWeight: fontWeight.bold, includeFontPadding: false, textAlignVertical: 'center' },
  cardTitle: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold, marginTop: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  metaText: { color: colors.muted, fontSize: 11 },
  cardRow: { marginTop: 5, borderRadius: 7, minHeight: 23, paddingHorizontal: 8, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardRowText: { fontSize: 11, fontWeight: fontWeight.semibold },
  severityBadge: { minWidth: 30, height: 13, borderRadius: 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, paddingTop: 0, paddingBottom: 0 },
  severityText: { fontSize: 9, lineHeight: 9, fontWeight: fontWeight.bold, includeFontPadding: false, textAlignVertical: 'center' },
  stateCard: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 18, alignItems: 'center', gap: 8 },
  stateTitle: { color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold, textAlign: 'center' },
  stateDetail: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  stateButton: { marginTop: 6, minHeight: 40, paddingHorizontal: 16, borderRadius: 10, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stateButtonText: { color: colors.white, fontSize: 13, fontWeight: fontWeight.bold },
  tabs: { height: 84, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28, overflow: 'hidden' },
  tabActive: { flex: 1, alignItems: 'center', gap: 7, borderRadius: 6, backgroundColor: 'rgba(0,179,152,0.09)', paddingHorizontal: 10, paddingVertical: 6 },
  tabInactive: { flex: 1, alignItems: 'center', gap: 7, paddingHorizontal: 10, paddingVertical: 6 },
  tabCount: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#c4365a', alignItems: 'center', justifyContent: 'center' },
  tabCountText: { color: colors.white, fontSize: 9, fontWeight: fontWeight.bold },
  tabActiveText: { color: colors.teal, fontSize: 13, fontWeight: fontWeight.semibold },
  tabText: { color: 'rgba(255,255,255,0.44)', fontSize: 13 },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  tabLine: { width: '100%', height: 1.5, backgroundColor: colors.teal, borderRadius: 2 },
});
