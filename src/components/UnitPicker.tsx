import { useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { createPortal } from 'react-dom';
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
        {open && createPortal(
          <>
            <div style={overlayStyle} onClick={() => setOpen(false)} />
            <div style={{ ...dropdownStyle, top: pos.top, right: pos.right }}>
              {UNITS.map((unit) => (
                <div
                  key={unit || 'none'}
                  style={optionStyle}
                  onClick={() => handleSelect(unit)}
                >
                  <span style={unit === value ? activeTextStyle : textStyle}>
                    {unit === '' ? '—' : unit}
                  </span>
                </div>
              ))}
            </div>
          </>,
          document.body
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

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'transparent',
  zIndex: 99998,
};

const dropdownStyle: React.CSSProperties = {
  position: 'fixed',
  backgroundColor: colors.surface,
  borderRadius: 8,
  padding: '4px 0',
  zIndex: 99999,
  minWidth: 120,
  maxHeight: 280,
  overflowY: 'auto',
  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  border: `1px solid ${colors.border}`,
};

const optionStyle: React.CSSProperties = {
  padding: '10px 16px',
  cursor: 'pointer',
};

const textStyle: React.CSSProperties = {
  fontSize: 15,
  color: colors.text,
};

const activeTextStyle: React.CSSProperties = {
  fontSize: 15,
  color: colors.primary,
  fontWeight: '700',
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
