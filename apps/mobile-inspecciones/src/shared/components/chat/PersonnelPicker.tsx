import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, radius, fontSize, fontWeight } from '../../theme/tokens';
import { SparklesMark } from '../icons/SparklesMark';
import type { UserResponse } from '../../services/api/users.api';

interface Props {
  users: UserResponse[];
  onConfirm: (selected: UserResponse[]) => void;
  confirmed?: boolean;
  suggestedUserId?: string | null;
}

function userSubtitle(user: UserResponse): string {
  const companyName = user.companies?.[0]?.name ?? null;
  if (companyName && user.position) return `${companyName} · ${user.position}`;
  if (companyName) return companyName;
  if (user.position) return user.position;
  return 'Responsable';
}

export function PersonnelPicker({ users, onConfirm, confirmed = false, suggestedUserId = null }: Props) {
  const effectiveSuggestedUserId = useMemo(() => suggestedUserId ?? users[0]?.id ?? null, [suggestedUserId, users]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(effectiveSuggestedUserId ? [effectiveSuggestedUserId] : []),
  );

  useEffect(() => {
    setSelectedIds(new Set(effectiveSuggestedUserId ? [effectiveSuggestedUserId] : []));
  }, [effectiveSuggestedUserId]);

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
    <View style={styles.marginLeft}>
      <View style={styles.listShell}>
        <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {users.map((user) => {
          const isSelected = selectedIds.has(user.id);
          const isSuggested = user.id === effectiveSuggestedUserId;
          return (
            <TouchableOpacity
              key={user.id}
              onPress={() => toggle(user.id)}
              disabled={confirmed}
              style={[styles.row, isSelected && styles.rowSelected, isSuggested && styles.rowSuggested]}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, isSuggested && styles.avatarSuggested]}>
                <Text style={[styles.avatarText, isSuggested && styles.avatarTextSuggested]}>
                  {user.firstName[0]}{user.lastName[0]}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{user.fullName}</Text>
                <Text style={styles.position}>{userSubtitle(user)}</Text>
              </View>
              {isSuggested ? (
                <View style={styles.suggestedTag}>
                  <SparklesMark size={10} color={colors.goldDark} />
                  <Text style={styles.suggestedTagText}>Sugerido</Text>
                </View>
              ) : (
                <View style={styles.spacer} />
              )}
              <View style={[styles.check, isSelected && styles.checkSelected]}>
                {isSelected && <FontAwesome5 name="check" size={9} color={colors.white} solid />}
              </View>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
      </View>
      {!confirmed && (
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={count === 0}
          style={[styles.confirmBtn, count === 0 && styles.confirmBtnDisabled]}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="arrow-right" size={12} color={colors.white} solid />
          <Text style={styles.confirmBtnText}>Confirmar y ver resumen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  marginLeft: { marginLeft: 33 },
  listShell: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.borderMid,
    borderRadius: radius.md + 2,
    overflow: 'hidden',
    maxHeight: 280,
  },
  list: { maxHeight: 220 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowSelected: { backgroundColor: colors.tealSurf },
  rowSuggested: {
    borderColor: colors.teal,
    borderWidth: 1.5,
    marginHorizontal: 1,
    marginVertical: 1,
    borderRadius: radius.md,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.blueSurf,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarSuggested: {
    backgroundColor: colors.gold,
  },
  avatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.blueTxt },
  avatarTextSuggested: { color: colors.navy },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  position: { fontSize: fontSize.xs, color: colors.muted, marginTop: 1 },
  suggestedTag: {
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FDF3E3',
    marginRight: 2,
  },
  suggestedTagText: {
    color: colors.goldDark,
    fontSize: 9,
    fontWeight: fontWeight.bold,
  },
  spacer: {
    width: 54,
  },
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
  confirmBtn: {
    margin: spacing.sm + 2,
    height: 36,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  confirmBtnDisabled: { opacity: 0.45 },
  confirmBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.white },
});
