import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  InspectionAnswerValue,
  type InspectionDetailChecklistItemResponse,
  type InspectionDetailChecklistResultResponse,
} from '@aurelia/contracts';
import { colors, fontWeight } from '../../shared/theme/tokens';

function answerLabel(value: string | null | undefined) {
  if (value === InspectionAnswerValue.COMPLIANT) return 'SÍ';
  if (value === InspectionAnswerValue.NOT_COMPLIANT) return 'NO';
  if (value === InspectionAnswerValue.NOT_APPLICABLE) return 'N/A';
  if (value === InspectionAnswerValue.PARTIAL) return 'PARCIAL';
  if (value === InspectionAnswerValue.NOT_OBSERVED) return 'N/O';
  return '—';
}

function answerTone(value: string | null | undefined) {
  if (value === InspectionAnswerValue.NOT_COMPLIANT) return { backgroundColor: '#ffd0db', color: '#570b1d' };
  if (value === InspectionAnswerValue.PARTIAL) return { backgroundColor: '#ffeab8', color: '#463100' };
  if (value === InspectionAnswerValue.NOT_APPLICABLE || value === InspectionAnswerValue.NOT_OBSERVED) {
    return { backgroundColor: '#f1f1f1', color: '#646464' };
  }
  if (value === InspectionAnswerValue.COMPLIANT) return { backgroundColor: '#e0ffd3', color: '#2a5c16' };
  return { backgroundColor: '#f1f1f1', color: '#8a8a8a' };
}

function SummaryMetric({ value, label, color, last = false }: { value: number; label: string; color: string; last?: boolean }) {
  return (
    <View style={[styles.metric, !last && styles.metricBorder]}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color }]}>{label}</Text>
    </View>
  );
}

function ResultItem({ item, index }: { item: InspectionDetailChecklistItemResponse; index: number }) {
  const value = item.answer?.value ?? null;
  const tone = answerTone(value);
  const isNo = value === InspectionAnswerValue.NOT_COMPLIANT;
  const comment = item.answer?.text ?? item.answer?.notes ?? '';
  return (
    <View style={[styles.item, isNo && styles.itemNo]}>
      <Text style={[styles.itemNumber, isNo && styles.itemNumberNo]}>{index + 1}</Text>
      <View style={styles.itemCopy}>
        <Text style={[styles.question, isNo && styles.questionNo]}>{item.question}</Text>
        {comment.trim() ? <Text style={styles.comment}>Comentario:{'\n'}{comment}</Text> : null}
      </View>
      <View style={[styles.answer, { backgroundColor: tone.backgroundColor }]}>
        <Text style={[styles.answerText, { color: tone.color }]}>{answerLabel(value)}</Text>
      </View>
    </View>
  );
}

export function MobileInspectionChecklistResultPanel({ result }: { result: InspectionDetailChecklistResultResponse | null }) {
  if (!result) {
    return <View style={styles.empty}><Text style={styles.emptyText}>No hay resultado de checklist disponible.</Text></View>;
  }
  const items = result.sections.flatMap((section) => section.items);
  const neutral = result.summary.notApplicable + result.summary.notObserved + result.summary.unanswered;
  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <SummaryMetric value={result.summary.compliant} label="✓ SÍ" color="#2a5c16" />
        <SummaryMetric value={result.summary.notCompliant} label="× NO" color="#570b1d" />
        <SummaryMetric value={neutral} label="N/A" color="#646464" last />
      </View>
      <View style={styles.detailHeader}>
        <Text style={styles.detailIcon}>☷</Text>
        <Text style={styles.detailTitle}>DETALLE ÍTEM A ÍTEM</Text>
      </View>
      <View style={styles.items}>
        {items.length ? items.map((item, index) => <ResultItem key={item.checklistItemId} item={item} index={index} />) : <Text style={styles.emptyText}>No hay ítems de checklist para mostrar.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.white },
  summary: { height: 70, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  metric: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metricBorder: { borderRightWidth: 1, borderRightColor: colors.border },
  metricValue: { fontSize: 18, lineHeight: 22, fontWeight: fontWeight.bold },
  metricLabel: { marginTop: 2, fontSize: 11, lineHeight: 13 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingTop: 20, paddingBottom: 10 },
  detailIcon: { color: '#24588b', fontSize: 14 },
  detailTitle: { color: colors.muted, fontSize: 11, letterSpacing: 0.55, fontWeight: fontWeight.bold },
  items: { borderTopWidth: 1, borderTopColor: colors.border, borderBottomWidth: 1, borderBottomColor: colors.border },
  item: { minHeight: 52, flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
  itemNo: { backgroundColor: '#ffd0db' },
  itemNumber: { paddingTop: 2, color: colors.placeholder, fontSize: 10, fontWeight: fontWeight.bold },
  itemNumberNo: { color: '#bd3b5b' },
  itemCopy: { flex: 1 },
  question: { color: colors.body, fontSize: 12, lineHeight: 17 },
  questionNo: { color: '#570b1d', fontWeight: fontWeight.semibold },
  comment: { marginTop: 8, color: colors.body, fontSize: 12, lineHeight: 17, fontWeight: fontWeight.semibold },
  answer: { minHeight: 18, borderRadius: 6, justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 2 },
  answerText: { fontSize: 10, fontWeight: fontWeight.bold },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.white },
  emptyText: { paddingVertical: 24, color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: fontWeight.semibold },
});
