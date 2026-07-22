import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, fontWeight } from '../../theme/tokens';
import { useMobileInspectionAssignmentScope } from '../../stores/mobileInspectionAssignmentScope.store';
import type { CompanyResponse } from '../../services/api/organization.api';

interface CompanySuggestionCardProps {
  company: CompanyResponse;
  reason: string;
  disabled?: boolean;
  onConfirm: () => void;
  onChooseOther: () => void;
}

export function CompanySuggestionCard(props: CompanySuggestionCardProps) {
  const canSelectCompany = useMobileInspectionAssignmentScope((state) => state.canSelectCompany);
  const assignedCompanyId = useMobileInspectionAssignmentScope((state) => state.companyId);
  const assignedCompanyName = useMobileInspectionAssignmentScope((state) => state.companyName);
  const confirmedRef = React.useRef(false);
  const disabled = props.disabled ?? false;
  const locked = !canSelectCompany && Boolean(assignedCompanyId);
  const fallback = props.reason === 'Recomendación basada en historial operativo de la faena.';

  React.useEffect(() => {
    if (!locked || disabled || confirmedRef.current || props.company.id !== assignedCompanyId) return;
    confirmedRef.current = true;
    props.onConfirm();
  }, [assignedCompanyId, disabled, locked, props]);

  if (locked) {
    return (
      <View style={styles.lockedCard}>
        <Text style={styles.lockedLabel}>Empresa responsable</Text>
        <View style={styles.lockedField}>
          <Text style={styles.lockedValue}>{assignedCompanyName ?? props.company.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.sparkle}>✦</Text>
        <Text style={styles.headerText}>Empresa sugerida por AurelIA</Text>
        {fallback ? <Text style={styles.fallbackBadge}>Base</Text> : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Empresa responsable</Text>
        <Text style={styles.companyName}>{props.company.name}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={disabled}
          onPress={props.onChooseOther}
          style={[styles.secondaryButton, disabled && styles.disabled]}
        >
          <Text style={styles.secondaryText}>☷ Elegir otra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={disabled}
          onPress={props.onConfirm}
          style={[styles.primaryButton, disabled && styles.disabled]}
        >
          <Text style={styles.primaryText}>✓ Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    marginLeft: 33,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderColor: '#C8A064',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  lockedCard: {
    marginBottom: 10,
    marginLeft: 33,
    marginRight: 12,
    padding: 12,
    backgroundColor: colors.white,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    borderWidth: 1,
  },
  lockedLabel: {
    color: '#131313',
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  lockedField: {
    height: 50,
    marginTop: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#F6FAFF',
    borderColor: '#24588B',
    borderRadius: 10,
    borderWidth: 1.5,
  },
  lockedValue: {
    color: '#131313',
    fontSize: 13,
    fontWeight: fontWeight.semibold,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FAE8C8',
  },
  sparkle: {
    color: '#8E6E3E',
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  headerText: {
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
    color: '#646464',
    fontSize: 9,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  companyName: {
    marginTop: 4,
    color: '#131313',
    fontSize: 16,
    fontWeight: fontWeight.bold,
  },
  actions: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButton: {
    height: 36,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderColor: '#D1D1D1',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  secondaryText: {
    color: '#333333',
    fontSize: 12,
    fontWeight: fontWeight.semibold,
  },
  primaryButton: {
    height: 36,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B398',
    borderRadius: 8,
  },
  primaryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
  disabled: {
    opacity: 0.5,
  },
});