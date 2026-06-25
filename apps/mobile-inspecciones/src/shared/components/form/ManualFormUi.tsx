import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, fontSize, fontWeight, spacing } from '../../theme/tokens';

interface HeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
}

export function ManualHeader({ title, subtitle, badge }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      {badge ? <View style={styles.headerBadge}><Text style={styles.headerBadgeText}>{badge}</Text></View> : null}
    </View>
  );
}

export function OfflineBanner() {
  return (
    <View style={styles.offlineBanner}>
      <FontAwesome5 name="wifi" size={11} color={colors.gold} />
      <Text style={styles.offlineText}>Sin red · guardando localmente</Text>
    </View>
  );
}

interface StepperProps {
  activeStep: number;
  steps: string[];
}

export function FormStepper({ activeStep, steps }: StepperProps) {
  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperRow}>
        {steps.map((step, index) => {
          const active = index + 1 === activeStep;
          return (
            <View key={step} style={styles.stepItem}>
              {index < steps.length - 1 ? <View style={styles.stepLine} /> : null}
              <View style={[styles.stepCircle, active && styles.stepCircleActive]}>
                <Text style={[styles.stepNumber, active && styles.stepNumberActive]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{step}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.progressRail}><View style={styles.progressFill} /></View>
    </View>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function FormCard({ icon, title, subtitle, children }: CardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

interface FieldBoxProps {
  value: string;
  variant?: 'readonly' | 'input';
  right?: React.ReactNode;
}

export function FieldBox({ value, variant = 'readonly', right }: FieldBoxProps) {
  return (
    <View style={[styles.fieldBox, variant === 'input' && styles.inputBox]}>
      <Text style={styles.fieldValue}>{value}</Text>
      {right}
    </View>
  );
}

export function SelectBox({ value }: { value: string }) {
  return (
    <FieldBox value={value} variant="input" right={<FontAwesome5 name="caret-down" size={14} color={colors.primary} />} />
  );
}

interface FooterProps {
  onCancel: () => void;
  onNext: () => void;
}

export function ManualFooter({ onCancel, onNext }: FooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.cancelButton} activeOpacity={0.75} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.82} onPress={onNext}>
          <Text style={styles.nextText}>Continuar</Text>
          <FontAwesome5 name="arrow-right" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.homeIndicator} />
    </View>
  );
}

export function LocationMapPreview() {
  return (
    <View style={styles.mapBox}>
      <View style={styles.mapLineOne} />
      <View style={styles.mapLineTwo} />
      <View style={styles.mapPin}>
        <FontAwesome5 name="map-marker-alt" size={24} color="#CC315F" />
      </View>
      <View style={styles.mapLabel}><Text style={styles.mapLabelText}>Salares Norte · 4.500 msnm</Text></View>
      <View style={styles.mapAccuracy}><Text style={styles.mapAccuracyText}>± 12.4 m</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 56, backgroundColor: colors.navyDark, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, zIndex: 2 },
  headerText: { flex: 1, paddingHorizontal: 4 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.white },
  headerSubtitle: { marginTop: 1, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.55)' },
  headerBadge: { height: 20, borderRadius: 16, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, marginRight: 4 },
  headerBadgeText: { fontSize: 10, fontWeight: fontWeight.bold, color: colors.navy },
  offlineBanner: { height: 23, backgroundColor: '#2A1A04', borderBottomWidth: 1, borderBottomColor: colors.gold, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16 },
  offlineText: { fontSize: 11, fontWeight: fontWeight.semibold, color: colors.gold },
  stepperWrap: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 9 },
  stepperRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepItem: { width: 83, alignItems: 'center', position: 'relative' },
  stepLine: { position: 'absolute', top: 11, left: 44, width: 73, height: 2, backgroundColor: colors.borderMid },
  stepCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { borderWidth: 2, borderColor: colors.gold },
  stepNumber: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.placeholder },
  stepNumberActive: { color: colors.gold },
  stepLabel: { marginTop: 3, fontSize: 8, color: colors.placeholder },
  stepLabelActive: { fontWeight: fontWeight.semibold, color: colors.goldDark },
  progressRail: { marginTop: 6, height: 2, borderRadius: 2, backgroundColor: colors.border },
  progressFill: { width: 10, height: 2, borderRadius: 2, backgroundColor: colors.goldDark },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 2 },
  cardTitle: { fontSize: 11, fontWeight: fontWeight.bold, color: colors.muted, letterSpacing: 0.66, textTransform: 'uppercase' },
  cardSubtitle: { marginTop: 4, fontSize: 12, lineHeight: 16.8, color: colors.muted },
  cardBody: { marginTop: 10, gap: 10 },
  fieldLabel: { fontSize: 13, fontWeight: fontWeight.bold, color: colors.primary },
  fieldBox: { height: 50, borderRadius: 10, backgroundColor: '#EEEEEE', paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputBox: { backgroundColor: '#F6FAFF', borderWidth: 1.5, borderColor: colors.borderMid },
  fieldValue: { fontSize: 14, fontWeight: fontWeight.medium, color: colors.primary },
  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, paddingHorizontal: 14, alignItems: 'center' },
  footerButtons: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelButton: { height: 50, borderRadius: 14, borderWidth: 2, borderColor: colors.gold, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 14, fontWeight: fontWeight.bold, color: colors.gold },
  nextButton: { flex: 1, height: 50, borderRadius: 14, backgroundColor: colors.gold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: colors.gold, shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  nextText: { fontSize: 14, fontWeight: fontWeight.bold, color: colors.white },
  homeIndicator: { width: 120, height: 4, borderRadius: 2, backgroundColor: colors.borderMid, marginTop: 14, marginBottom: 8 },
  mapBox: { height: 120, borderRadius: 10, borderWidth: 1.5, borderColor: colors.borderMid, backgroundColor: '#1E3A2E', overflow: 'hidden', position: 'relative' },
  mapLineOne: { position: 'absolute', top: 35, left: 59, width: 178, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,200,100,0.4)' },
  mapLineTwo: { position: 'absolute', top: 70, left: 30, width: 118, height: 2, borderRadius: 2, backgroundColor: 'rgba(255,200,100,0.3)' },
  mapPin: { position: 'absolute', top: 31, left: 134, width: 28, height: 27, alignItems: 'center' },
  mapLabel: { position: 'absolute', left: 8, bottom: 11, height: 18, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 8 },
  mapLabelText: { fontSize: 10, fontWeight: fontWeight.semibold, color: colors.white },
  mapAccuracy: { position: 'absolute', right: 8, bottom: 11, height: 18, borderRadius: 4, backgroundColor: 'rgba(0,179,152,0.8)', justifyContent: 'center', paddingHorizontal: 8 },
  mapAccuracyText: { fontSize: 10, fontWeight: fontWeight.semibold, color: colors.white },
});
