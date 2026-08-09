import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '../theme';
import { AiRecipeSuggestion } from '../services/geminiRecipeSearch';

type Props = {
  suggestion: AiRecipeSuggestion | null;
  added: boolean;
  onAdd: () => void;
  onConsult: () => void;
  onClose: () => void;
};

export default function AiRecipeDetailModal({
  suggestion,
  added,
  onAdd,
  onConsult,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={!!suggestion}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        {suggestion && (
          <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
              <Text style={styles.category}>{suggestion.category}</Text>
              <Text style={styles.title}>{suggestion.name}</Text>

              <Text style={styles.sectionTitle}>Ingrédients</Text>
              <View style={styles.card}>
                {suggestion.ingredients.map((ingredient, index) => (
                  <Text key={index} style={styles.line}>
                    • {[ingredient.quantity, ingredient.unit].filter(Boolean).join(' ')}{' '}
                    {ingredient.name}
                  </Text>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Étapes</Text>
              <View style={styles.card}>
                {suggestion.steps.map((step, index) => (
                  <Text key={index} style={styles.line}>
                    {index + 1}. {step}
                  </Text>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.actions, { paddingBottom: spacing.sm + insets.bottom }]}>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Fermer</Text>
              </Pressable>
              <Pressable style={styles.consultButton} onPress={onConsult}>
                <Text style={styles.consultButtonText}>Consulter</Text>
              </Pressable>
              <Pressable
                style={[styles.addButton, added && styles.addButtonDone]}
                onPress={onAdd}
                disabled={added}
              >
                <Text style={[styles.addButtonText, added && styles.addButtonTextDone]}>
                  {added ? 'Ajoutée ✓' : 'Ajouter'}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  category: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  line: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  consultButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
  },
  consultButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
  addButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  addButtonDone: {
    backgroundColor: colors.surfaceMuted,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  addButtonTextDone: {
    color: colors.textMuted,
  },
});
