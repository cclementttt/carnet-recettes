import { FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { RECIPE_ICONS } from '../types/recipe';

type Props = {
  visible: boolean;
  onSelect: (icon: string) => void;
  onClose: () => void;
};

export default function IconPickerModal({ visible, onSelect, onClose }: Props) {
  if (!visible) return null;

  const grid = (
    <>
      <Text style={styles.title}>Choisir un picto</Text>
      {Platform.OS === 'web' ? (
        <ScrollView style={styles.webScroll}>
          <View style={styles.webGrid}>
            {RECIPE_ICONS.map((item) => (
              <Pressable
                key={item}
                style={styles.cell}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <View style={styles.cellInner}>
                  <Text style={styles.icon}>{item}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={RECIPE_ICONS}
          keyExtractor={(item) => item}
          numColumns={8}
          renderItem={({ item }) => (
            <Pressable
              style={styles.cell}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <View style={styles.cellInner}>
                <Text style={styles.icon}>{item}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
      <Pressable style={styles.cancel} onPress={onClose}>
        <Text style={styles.cancelText}>Annuler</Text>
      </Pressable>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <>
        <Pressable style={styles.webOverlay} onPress={onClose} />
        <View style={styles.webSheet}>{grid}</View>
      </>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {grid}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20,16,12,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  webOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,16,12,0.4)',
    zIndex: 998,
  },
  webSheet: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    zIndex: 999,
    maxHeight: '70%',
  },
  webScroll: {
    maxHeight: 400,
  },
  webGrid: {
    flexDirection: 'row' as any,
    flexWrap: 'wrap' as any,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cell: {
    width: '12.5%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellInner: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  icon: {
    fontSize: 22,
  },
  cancel: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
