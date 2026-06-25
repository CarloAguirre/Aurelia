import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../shared/theme/tokens';
import { useMobileSession } from '../auth/mobileSession.store';

function Card({ id, title, meta, top }: { id: string; title: string; meta: string; top: string }) {
  return (
    <View style={styles.card}>
      <View style={[styles.top, { backgroundColor: top }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHead}><Text style={styles.cardId}>{id}</Text><Text style={styles.pill}>Hallazgo</Text></View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.meta}>{meta}</Text>
        <View style={styles.warn}><Text style={styles.warnText}>2 Abiertas</Text><Text style={styles.warnText}>Medio</Text></View>
        <View style={styles.ok}><Text style={styles.okText}>1 Cerrada</Text><Text style={styles.okText}>Alto</Text></View>
      </View>
    </View>
  );
}

export function InspectionsHomeScreen() {
  const user = useMobileSession((state) => state.user);
  const name = user?.fullName ?? 'Karen Opazo S.';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <View style={styles.status}><Text style={styles.time}>9:41</Text><FontAwesome5 name="bars" size={16} color={colors.white} /></View>
            <Text style={styles.logo}>AURELIA</Text>
            <Text style={styles.hello}>Hola,</Text>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.role}><Text style={styles.roleText}>Inspector · Admin GF HSE</Text></View>
          </View>
          <View style={styles.metrics}>
            <View style={styles.metric}><Text style={styles.metricNumber}>XX</Text><Text style={styles.metricLabel}>Total 2026</Text></View>
            <View style={styles.metric}><Text style={styles.metricNumberGold}>XX</Text><Text style={styles.metricLabel}>Abiertas</Text></View>
            <View style={styles.metric}><Text style={styles.metricNumberRed}>X</Text><Text style={styles.metricLabel}>SLA vencidos</Text></View>
            <View style={styles.metric}><Text style={styles.metricNumberGreen}>XX%</Text><Text style={styles.metricLabel}>Obs. cerradas</Text></View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.filter}><Text style={styles.filterText}>Filtrar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.newButton} onPress={() => router.push('/inspection/start')}><Text style={styles.newText}>Nueva inspección</Text></TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollInner}>
            <View style={styles.draft}><Text style={styles.draftTitle}>Formularios inconclusos</Text><Text style={styles.draftText}>Continúa donde lo dejaste · guardados localmente</Text></View>
            <Card id="#369" title="Servicios Generales · GARDE CORPS" meta="Campamento Antiguo · 23 días" top="#c4365a" />
            <Card id="#389" title="Servicios Generales · RESITER" meta="PTAS · 9 días" top="#e8a820" />
            <Card id="#357" title="Planta Procesos · SOMACOR" meta="Módulo C · 18 días" top="#c4365a" />
          </ScrollView>
          <View style={styles.tabs}><Text style={styles.tabActive}>Gestión de inspecciones</Text><Text style={styles.tabMuted}>Historial</Text></View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navyDark }, screen: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { backgroundColor: colors.navyDark, paddingHorizontal: 20, paddingBottom: 20 }, status: { height: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, time: { color: colors.white, fontSize: 12, fontWeight: fontWeight.semibold }, logo: { color: colors.white, fontSize: 22, fontWeight: fontWeight.bold, letterSpacing: 2.2, marginTop: 6 }, hello: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 16 }, name: { color: colors.white, fontSize: 22, fontWeight: fontWeight.bold, marginTop: 2 }, role: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(200,160,100,0.4)', backgroundColor: 'rgba(200,160,100,0.2)', paddingHorizontal: 11, paddingVertical: 4 }, roleText: { color: colors.gold, fontSize: 11, fontWeight: fontWeight.semibold },
  metrics: { height: 70, backgroundColor: colors.white, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border }, metric: { flex: 1, alignItems: 'center', justifyContent: 'center' }, metricNumber: { color: colors.primary, fontSize: 18, fontWeight: fontWeight.bold }, metricNumberGold: { color: '#463100', fontSize: 18, fontWeight: fontWeight.bold }, metricNumberRed: { color: '#bd3b5b', fontSize: 18, fontWeight: fontWeight.bold }, metricNumberGreen: { color: '#2a5c16', fontSize: 18, fontWeight: fontWeight.bold }, metricLabel: { color: colors.muted, fontSize: 9, textAlign: 'center' },
  actions: { backgroundColor: colors.white, padding: 14, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border }, filter: { height: 36, borderWidth: 1.5, borderColor: colors.borderMid, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }, filterText: { color: colors.body, fontSize: 12, fontWeight: fontWeight.semibold }, newButton: { height: 52, borderRadius: 14, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' }, newText: { color: colors.white, fontSize: 15, fontWeight: fontWeight.bold },
  scroll: { flex: 1 }, scrollInner: { padding: 14, gap: 10 }, draft: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14 }, draftTitle: { color: colors.primary, fontSize: 15, fontWeight: fontWeight.bold }, draftText: { color: colors.muted, fontSize: 12, marginTop: 2 }, card: { backgroundColor: colors.white, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden' }, top: { height: 3 }, cardBody: { padding: 14 }, cardHead: { flexDirection: 'row', justifyContent: 'space-between' }, cardId: { color: colors.blueLink, fontSize: 12, fontWeight: fontWeight.bold }, pill: { backgroundColor: '#e6f3ff', color: '#0d3862', fontSize: 10, fontWeight: fontWeight.bold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }, cardTitle: { color: colors.primary, fontSize: 13, fontWeight: fontWeight.bold, marginTop: 6 }, meta: { color: colors.muted, fontSize: 11, marginTop: 3 }, warn: { marginTop: 10, backgroundColor: '#ffeab8', borderRadius: 7, padding: 6, flexDirection: 'row', justifyContent: 'space-between' }, warnText: { color: '#463100', fontSize: 11, fontWeight: fontWeight.semibold }, ok: { marginTop: 5, backgroundColor: '#e0ffd3', borderRadius: 7, padding: 6, flexDirection: 'row', justifyContent: 'space-between' }, okText: { color: '#2a5c16', fontSize: 11, fontWeight: fontWeight.semibold },
  tabs: { height: 84, backgroundColor: colors.navyDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }, tabActive: { color: colors.teal, fontSize: 13, fontWeight: fontWeight.semibold }, tabMuted: { color: 'rgba(255,255,255,0.44)', fontSize: 13 },
});
