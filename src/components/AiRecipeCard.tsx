import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';
import { AiRecipeSuggestion } from '../services/geminiRecipeSearch';

type Props = {
  suggestion: AiRecipeSuggestion;
  onPress: () => void;
  added: boolean;
};

export default function AiRecipeCard({ suggestion, onPress, added }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={onPress}
    >
      {suggestion.photoUri ? (
        <Image source={{ uri: suggestion.photoUri }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoPlaceholder]}>
          <Text style={styles.photoIcon}>🍽️</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.category}>{suggestion.category}</Text>
        <Text style={styles.name} numberOfLines={2}>
          {suggestion.name}
        </Text>
        {added && <Text style={styles.addedBadge}>Ajoutée à mes recettes ✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  pressed: {
    opacity: 0.9,
  },
  photo: {
    width: '100%',
    height: 140,
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 40,
  },
  info: {
    padding: spacing.lg,
  },
  category: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
