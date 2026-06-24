import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, fontSize } from '../../theme/tokens';

interface Props {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = 'Escribe aquí o usa los controles…', disabled = false }: Props) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleSubmit(_: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
    handleSend();
  }

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + spacing.xs }]}> 
      <View style={styles.row}>
        <TouchableOpacity style={styles.voiceBtn} activeOpacity={0.7}>
          <Text style={styles.voiceIcon}>♩</Text>
        </TouchableOpacity>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={styles.input}
          multiline
          blurOnSubmit
          returnKeyType="send"
          editable={!disabled}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          style={[styles.sendBtn, (!text.trim() || disabled) && styles.sendBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.homeIndicatorBar}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  voiceBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  voiceIcon: { fontSize: 16, color: colors.muted, lineHeight: 18 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: colors.borderMid,
    borderRadius: radius.full,
    fontFamily: 'System',
    fontSize: fontSize.base,
    color: colors.primary,
    backgroundColor: colors.surface,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendIcon: { fontSize: 15, color: colors.navy, lineHeight: 17 },
  homeIndicatorBar: {
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderMid,
  },
});
