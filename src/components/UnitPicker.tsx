import { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { Unit, UNITS } from '../types/recipe';

type Props = {
  value: Unit;
  onChange: (unit: Unit) => void;
};

const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  kg: 'kg',
  mL: 'mL',
  L: 'L',
  'càs': 'càs',
  'càc': 'càc',
  'pièce': 'pièce',
  'pincée': 'pincée',
  '': 'Sans unité',
};

export default function UnitPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (unit: Unit) => {
    onChange(unit);
    setOpen(false);
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.trigger}>
        <select
          value={value}
          onChange={(e: any) => onChange(e.target.value as Unit)}
          style={selectStyle}
        >
          {UNITS.map((unit) => (
            <option key={unit || 'none'} value={unit}>
              {UNIT_LABELS[unit] ?? unit}
            </option>
          ))}
        </select>
      </View>
    );
  }

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText}>{value === '' ? '—' : value}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={UNITS}
              keyExtractor={(item) => item || 'none'}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={[styles.optionText, item === value && styles.optionTextActive]}>
                    {item === '' ? 'Sans unité' : item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  background: 'transparent',
  border: 'none',
  fontSize: 14,
  fontWeight: '500',
  color: colors.text,
  textAlign: 'center',
  width: '100%',
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
};

const styles = StyleSheet.create({
  trigger: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  triggerText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,16,12,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingVertical: spacing.sm,
    maxHeight: 320,
  },
  option: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
