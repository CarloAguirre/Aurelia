import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, fontWeight } from '../../theme/tokens';

interface SlaConfirmWidgetProps {
  initialDays: number;
  observationNumber?: number;
  resolved?: boolean;
  onSave: (days: number) => void;
}

export function SlaConfirmWidget({ initialDays, resolved = false, onSave }: SlaConfirmWidgetProps) {
  const [days, setDays] = React.useState(String(initialDays));

  React.useEffect(() => {
    setDays(String(initialDays));
  }, [initialDays]);

  const numericDays = Number(days);
  const valid = Number.isFinite(numericDays) && numericDays > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Confirma el SLA</Text>
      <View style={styles.row}>
        <TextInput
          editable={!resolved}
          keyboardType="number-pad"
          onChangeText={(value) => setDays(value.replace(/\D/g, '').slice(0, 3))}
          selectionColor="#24588B"
          style={styles.input}
          value={days}
        />
        <Text style={styles.daysLabel}>días</Text>
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={resolved || !valid}
          onPress={() => onSave(numericDays)}
          style={[styles.saveButton, (resolved || !valid) && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveText}>Guardar observación</Text>
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
    padding: 12,
    backgroundColor: colors.white,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    color: '#131313',
    fontSize: 13,
    fontWeight: fontWeight.bold,
  },
  row: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    width: 90,
    height: 40,
    paddingHorizontal: 10,
    color: '#131313',
    fontSize: 13,
    fontWeight: fontWeight.bold,
    backgroundColor: '#F6FAFF',
    borderColor: '#D1D1D1',
    borderRadius: 10,
    borderWidth: 1.5,
  },
  daysLabel: {
    color: '#646464',
    fontSize: 12,
  },
  saveButton: {
    height: 40,
    marginLeft: 'auto',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C8A064',
    borderRadius: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fontWeight.bold,
  },
});
