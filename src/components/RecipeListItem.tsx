import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';
import { Recipe } from '../types/recipe';

type Props = {
  recipe: Recipe;
  onPress: () => void;
  onLongPress: () => void;
};

export default function RecipeListItem({ recipe, onPress, onLongPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const animateOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6 }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.container}
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress();
        }}
        delayLongPress={350}
      >
        {recipe.photoUri ? (
          <Image source={{ uri: recipe.photoUri }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <Text style={styles.placeholderText}>{recipe.icon ?? '🍽️'}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {recipe.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>
                {recipe.ingredients.length} ingr.
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>
                {recipe.steps.length} étape{recipe.steps.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.chevronWrapper}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm + 2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 30,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  metaBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  metaText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  chevronWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  chevron: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: -1,
  },
});
