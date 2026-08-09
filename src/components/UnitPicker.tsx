import { useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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

export default function UnitPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<View>(null);

  const handleSelect = (unit: Unit) => {
    onChange(unit);
    setOpen(false);
  };

  const handleOpen = () => {
    if (Platform.OS === 'web' && triggerRef.current) {
      const node = triggerRef.current as unknown as HTMLElement;
      const rect = node.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setOpen(true);
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <Pressable ref={triggerRef} style={styles.trigger} onPress={handleOpen}>
          <Text style={styles.triggerText}>{value === '' ? '—' : value}</Text>
        </Pressable>
        {open && (
          <>
            <Pressable style={styles.webOverlay} onPress={() => setOpen(false)} />
            <View style={[styles.webDropdown, { top: pos.top, right: pos.right } as any]}>
              <ScrollView>
                {UNITS.map((unit) => (
                  <Pressable
                    key={unit || 'none'}
                    style={styles.webOption}
                    onPress={() => handleSelect(unit)}
                  >
                    <Text style={[styles.optionText, unit === value && styles.optionTextActive]}>
                      {unit === '' ? '—' : unit}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </>
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
                    {item === '' ? '—' : item}
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
  webOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 9998,
  },
  webDropdown: {
    position: 'fixed' as any,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    zIndex: 9999,
    minWidth: 120,
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  webOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
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
