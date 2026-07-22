import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontWeight } from '../../theme/tokens';
import { SparklesMark } from '../icons/SparklesMark';

interface AiProposalCardProps {
  suggestion: string;
  fallback?: boolean;
  onAccept: () => void;
  onEdit: () => void;
  accepted?: boolean;
}

export function AiProposalCard({
  suggestion,
  fallback = false,
  onAccept,
  onEdit,
  accepted = false,
}: AiProposalCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SparklesMark size={11} color="#8E6E3E" />
        <Text style={styles.headerTitle}>Medida sugerida por AurelIA</Text>
        {fallback ? <Text style={styles.fallbackBadge}>Base</Text> : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Medida correctiva</Text>
        <Text style={styles.suggestion}>{suggestion}</Text>
        <Text style={styles.metaText}>↝ Basada en historial 2023–2026 · Gold Fields Salares Norte</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.75} disabled={accepted} onPress={onEdit} style={[styles.editBtn, accepted && styles.disabledBtn]}>
          <FontAwesome5 name="pen" size={10} color={accepted ? '#ACACAC' : '#333333'} />
          <Text style={[styles.editBtnText, accepted && styles.disabledText]}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.75} disabled={accepted} onPress={onAccept} style={[styles.acceptBtn, accepted && styles.disabledBtn]}>
          <FontAwesome5 name="check" size={10} color={colors.white} />
          <Text style={styles.acceptBtnText}>Aceptar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginLeft: 33,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderColor: '#C8A064',
    borderRadius: 12,
    borderWidth: 1.5,
    shadowColor: '#C8A064',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FDF3E3',
    borderBottomColor: 'rgba(200,160,100,0.20)',
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    color: '#8E6E3E',
    fontSize: 11,
    fontWeight: fontWeight.bold,
  },
  fallbackBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: '#8E6E3E',
    fontSize: 10,
    fontWeight: fontWeight.bold,
    backgroundColor: colors.white,
    borderRadius: 999,
  },
  body: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    marginBottom: 4,
    color: '#646464',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  suggestion: {
    color: '#131313',
    fontSize: 12,
    fontWeight: fontWeight.medium,
    lineHeight: 18,
  },
  metaText: {
    marginTop: 8,
    paddingTop: 7,
    color: '#646464',
    fontSize: 10,
    lineHeight: 13,
    borderTopColor: '#E3E3E3',
    borderTopWidth: 1,
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    height: 36,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.white,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  editBtnText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
  acceptBtn: {
    height: 36,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#00B398',
    borderRadius: 8,
  },
  acceptBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  disabledBtn: { opacity: 0.5 },
  disabledText: { color: '#ACACAC' },
});
