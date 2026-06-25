import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { GoldFieldsAureliaLogo } from '../../shared/components/brand/GoldFieldsAureliaLogo';
import BellIcon from '../../../assets/icons/home-bell.svg';
import FilterIcon from '../../../assets/icons/home-filter.svg';
import PlusIcon from '../../../assets/icons/home-plus.svg';
import ShieldIcon from '../../../assets/icons/home-shield.svg';
import FindingIcon from '../../../assets/icons/home-finding.svg';

function Metric({ value, label, color }: { value: string; label: string; color: string }) {
  return <View style={styles.metric}><Text style={[styles.metricValue, { color }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function Card({ id, title, meta, top }: { id: string; title: string; meta: string; top: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.topLine, { backgroundColor: top }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardTop}><Text style={styles.id}>{id}</Text><View style={styles.pills}><View style={styles.pillBlue}><FindingIcon width={12} height={9} /><Text style={styles.pillBlueText}>Hallazgo</Text></View><View style={styles.pillRed}><Text style={styles.pillRedText}>● Ejecutada · Crítico</Text></View></View></View>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.meta}><FontAwesome5 name="map-marker-alt" size={10} color="#aaa" /><Text style={styles.metaText}>{meta}</Text></View>
        <View style={styles.redRow}><Text style={styles.redText}>1 Ejecutada</Text><Text style={styles.redText}>Crítico</Text></View>
        <View style={styles.goldRow}><Text style={styles.goldText}>2 Abiertas</Text><Text style={styles.goldText}>Alto   Medio</Text></View>
        <View style={styles.greenRow}><Text style={styles.greenText}>1 Cerrada</Text><Text style={styles.greenText}>Alto</Text></View>
      </View>
    </View>
  );
}

export function InspectionsHomeFigmaScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <View style={styles.status}><Text style={styles.time}>9:41</Text><FontAwesome5 name="signal" size={15} color={colors.white} /></View>
            <View style={styles.brandRow}><GoldFieldsAureliaLogo width={137} height={45} variant="white" /><TouchableOpacity style={styles.bell}><BellIcon width={20} height={16} /></TouchableOpacity></View>
            <Text style={styles.hello}>Hola,</Text><Text style={styles.name}>Karen Opazo S.</Text>
            <View style={styles.role}><ShieldIcon width={13} height={10} /><Text style={styles.roleText}>Inspector · Admin GF HSE</Text></View>
          </View>
          <View style={styles.metrics}><Metric value="XX" label="Total 2026" color={colors.primary} /><View style={styles.divider} /><Metric value="XX" label="Abiertas" color="#463100" /><View style={styles.divider} /><Metric value="X" label="SLA vencidos" color="#bd3b5b" /><View style={styles.divider} /><Metric value="XX%" label="Obs. cerradas" color="#2a5c16" /></View>
          <View style={styles.actions}><TouchableOpacity style={styles.filter}><FilterIcon width={15} height={12} /><Text style={styles.filterText}>Filtrar</Text></TouchableOpacity><TouchableOpacity style={styles.newButton} onPress={() => router.push('/inspection/start')}><PlusIcon width={19} height={15} /><Text style={styles.newText}> Nueva inspección</Text></TouchableOpacity></View>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            <View style={styles.drafts}><View style={styles.draftHeader}><View><Text style={styles.draftTitle}>Formularios inconclusos</Text><Text style={styles.draftSub}>Continúa donde lo dejaste · guardados localmente</Text></View><View style={styles.redDot} /></View><TouchableOpacity style={styles.draftBody} onPress={() => router.push('/inspection/manual/identification')}><View style={styles.draftIcon}><FontAwesome5 name="file-signature" size={18} color="#463100" /></View><View style={styles.draftCopy}><Text style={styles.draftName}>Hallazgo · Planta Procesos</Text><Text style={styles.draftMeta}>Planta Procesos · Módulo C · STRACON · Ayer 16:54</Text><View style={styles.progressWrap}><View style={styles.progressRail}><View style={styles.progressFill} /></View><Text style={styles.progressText}>40%</Text></View></View><Text style={styles.chev}>›</Text><View style={styles.step}><Text style={styles.stepText}>Paso 2/5</Text></View></TouchableOpacity></View>
            <Card id="#369" title="Servicios Generales · GARDE CORPS" meta="Campamento Antiguo · 23 días" top="#c4365a" />
            <Card id="#389" title="Servicios Generales · RESITER" meta="PTAS · 9 días" top="#e8a820" />
            <Card id="#357" title="Planta Procesos · SOMACOR" meta="Módulo C · 18 días" top="#c4365a" />
            <Card id="#395" title="Planta Procesos · AGGREKO" meta="Módulo C · 4 días" top={colors.gold} />
          </ScrollView>
          <View style={styles.tabs}><View style={styles.tabActive}><View style={styles.tabCount}><Text style={styles.tabCountText}>7</Text></View><Text style={styles.tabActiveText}>Gestión de inspecciones</Text><View style={styles.tabLine} /></View><View style={styles.tabInactive}><Text style={styles.tabDot}>•</Text><Text style={styles.tabText}>Historial</Text></View></View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark }, screen: { flex: 1, backgroundColor: '#f7f7f7' }, header: { backgroundColor: colors.navyDark, paddingHorizontal: 20, paddingBottom: 20 }, status: { height: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, time: { color: colors.white, fontSize: 12, fontWeight: fontWeight.semibold }, brandRow: { height: 51, marginTop: 6, flexDirection: 'row', alignItems: 'center' }, bell: { marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }, hello: { marginTop: 16, color: 'rgba(255,255,255,0.5)', fontSize: 13 }, name: { marginTop: 2, color: colors.white, fontSize: 22, fontWeight: fontWeight.bold }, role: { marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(200,160,100,0.4)', backgroundColor: 'rgba(200,160,100,0.2)', paddingHorizontal: 11, paddingVertical: 4 }, roleText: { color: colors.gold, fontSize: 11, fontWeight: fontWeight.semibold }, metrics: { height: 70, backgroundColor: colors.white, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }, metric: { flex: 1, alignItems: 'center', justifyContent: 'center' }, metricValue: { fontSize: 18, fontWeight: fontWeight.bold }, metricLabel: { marginTop: 2, color: colors.muted, fontSize: 9, textAlign: 'center' }, divider: { width: 1, marginVertical: 14, backgroundColor: colors.border }, actions: { backgroundColor: colors.white, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border }, filter: { height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: colors.borderMid, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, filterText: { color: colors.body, fontSize: 12, fontWeight: fontWeight.semibold }, newButton: { height: 52, borderRadius: 14, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, newText: { color: colors.white, fontSize: 15, fontWeight: fontWeight.bold }, list: { flex: 1 }, listContent: { padding: 14, gap: 10 }, drafts: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }, draftHeader: { padding: 14, flexDirection: 'row', justifyContent: 'space-between' }, draftTitle: { color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold }, draftSub: { color: colors.muted, fontSize: 12, marginTop: 2 }, redDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#c4365a' }, draftBody: { borderTopWidth: 1.5, borderTopColor: colors.border, paddingHorizontal: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 12 }, draftIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#ffeab8', alignItems: 'center', justifyContent: 'center' }, draftCopy: { flex: 1 }, draftName: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold }, draftMeta: { color: colors.muted, fontSize: 11, marginTop: 3 }, progressWrap: { marginTop: 9, flexDirection: 'row', alignItems: 'center', gap: 8 }, progressRail: { width: 181, height: 4, borderRadius: 2, backgroundColor: colors.border }, progressFill: { width: 72, height: 4, borderRadius: 2, backgroundColor: colors.gold }, progressText: { color: colors.goldDark, fontSize: 10, fontWeight: fontWeight.bold }, chev: { color: colors.muted, fontSize: 30 }, step: { position: 'absolute', right: 20, top: 15, height: 18, borderRadius: 6, borderWidth: 1, borderColor: '#e8c86a', backgroundColor: '#ffeab8', paddingHorizontal: 7, justifyContent: 'center' }, stepText: { color: '#463100', fontSize: 10, fontWeight: fontWeight.bold }, card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden' }, topLine: { height: 3 }, cardInner: { padding: 14 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, id: { color: colors.blueLink, fontSize: 12, fontWeight: fontWeight.bold }, pills: { flexDirection: 'row', gap: 8 }, pillBlue: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#e6f3ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }, pillRed: { backgroundColor: '#ffd0db', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }, pillBlueText: { color: '#0d3862', fontSize: 10, fontWeight: fontWeight.bold }, pillRedText: { color: '#570b1d', fontSize: 10, fontWeight: fontWeight.bold }, cardTitle: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold, marginTop: 8 }, meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }, metaText: { color: colors.muted, fontSize: 11 }, redRow: { marginTop: 10, backgroundColor: '#ffd0db', borderRadius: 7, minHeight: 23, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, goldRow: { marginTop: 5, backgroundColor: '#ffeab8', borderRadius: 7, minHeight: 23, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, greenRow: { marginTop: 5, backgroundColor: '#dfffce', borderRadius: 7, minHeight: 23, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, redText: { color: '#570b1d', fontSize: 11, fontWeight: fontWeight.semibold }, goldText: { color: '#463100', fontSize: 11, fontWeight: fontWeight.semibold }, greenText: { color: '#2a5c16', fontSize: 11, fontWeight: fontWeight.semibold }, tabs: { height: 84, backgroundColor: colors.navyDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28 }, tabActive: { flex: 1, alignItems: 'center', gap: 6, borderRadius: 6, backgroundColor: 'rgba(0,179,152,0.09)', paddingTop: 5 }, tabInactive: { flex: 1, alignItems: 'center', gap: 6 }, tabCount: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#c4365a', alignItems: 'center', justifyContent: 'center' }, tabCountText: { color: colors.white, fontSize: 9, fontWeight: fontWeight.bold }, tabActiveText: { color: colors.teal, fontSize: 13, fontWeight: fontWeight.semibold }, tabText: { color: 'rgba(255,255,255,0.44)', fontSize: 13 }, tabDot: { color: 'rgba(255,255,255,0.2)', fontSize: 20 }, tabLine: { width: '90%', height: 1.5, backgroundColor: colors.teal, borderRadius: 2 },
});
