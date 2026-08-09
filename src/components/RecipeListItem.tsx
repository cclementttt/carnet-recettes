import * as Haptics from 'expo-haptics';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';
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
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  };
  const animateOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.inner}
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
            <Text style={styles.subtitle}>
              {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.subtitle}>
              {recipe.steps.length} étape{recipe.steps.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    marginRight: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metaDot: {
    fontSize: 13,
    color: colors.textMuted,
    marginHorizontal: 6,
  },
  chevron: {
    fontSize: 22,
    color: colors.border,
    marginLeft: spacing.sm,
  },
});
