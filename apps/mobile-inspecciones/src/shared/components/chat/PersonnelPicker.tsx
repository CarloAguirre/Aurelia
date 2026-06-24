import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';
import type { UserResponse } from '../../services/api/users.api';

interface Props {
  users: UserResponse[];
  onConfirm: (selected: UserResponse[]) => void;
  confirmed?: boolean;
}

export function PersonnelPicker({ users, onConfirm, confirmed = false }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    if (confirmed) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const selected = users.filter((u) => selectedIds.has(u.id));
    onConfirm(selected);
  }

  const count = selectedIds.size;

  return (
    <View style={[styles.container, styles.marginLeft]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Personal presente</Text>
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </View>
      <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {users.map((user) => {
          const isSelected = selectedIds.has(user.id);
          return (
            <TouchableOpacity
              key={user.id}
              onPress={() => toggle(user.id)}
              disabled={confirmed}
              style={[styles.row, isSelected && styles.rowSelected]}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                  {user.firstName[0]}{user.lastName[0]}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{user.fullName}</Text>
                {user.position ? (
                  <Text style={styles.position}>{user.position}</Text>
                ) : null}
              </View>
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {!confirmed && (
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={count === 0}
          style={[styles.confirmBtn, count === 0 && styles.confirmBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmBtnText}>
            Confirmar {count > 0 ? `(${count})` : ''}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  marginLeft: { marginLeft: 33 },
  container: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.borderMid,
    borderRadius: radius.md + 2,
    overflow: 'hidden',
    maxHeight: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    color: colors.muted,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.teal,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 9, fontWeight: fontWeight.bold, color: colors.white },
  list: { maxHeight: 220 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowSelected: { backgroundColor: colors.tealSurf },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.blueSurf,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarSelected: { backgroundColor: colors.teal },
  avatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.blueTxt },
  avatarTextSelected: { color: colors.white },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  position: { fontSize: fontSize.xs, color: colors.muted, marginTop: 1 },
  check: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderMid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkSelected: { borderColor: colors.teal, backgroundColor: colors.teal },
  checkMark: { fontSize: 9, color: colors.white, fontWeight: fontWeight.bold },
  confirmBtn: {
    margin: spacing.sm + 2,
    height: 36,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.white },
});
