import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Props = {
  visible: boolean;
  recipeName: string;
  onEdit: () => void;
  onExport: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export default function RecipeActionSheet({
  visible,
  recipeName,
  onEdit,
  onExport,
  onDelete,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title} numberOfLines={1}>
            {recipeName}
          </Text>

          <Pressable style={styles.option} onPress={onEdit}>
            <Text style={styles.optionText}>✏️  Modifier</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={onExport}>
            <Text style={styles.optionText}>📄  Exporter en fiche PDF</Text>
          </Pressable>

          <Pressable style={styles.option} onPress={onDelete}>
            <Text style={[styles.optionText, styles.dangerText]}>🗑️  Supprimer</Text>
          </Pressable>

          <Pressable style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
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
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  option: {
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dangerText: {
    color: colors.danger,
  },
  cancel: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  cancelText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
