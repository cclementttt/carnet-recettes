import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RecipeActionSheet from '../components/RecipeActionSheet';
import { RootStackParamList } from '../navigation/types';
import { deleteRecipe, getRecipeById } from '../storage/recipeStorage';
import { addIngredientsToShoppingList } from '../storage/shoppingListStorage';
import { colors, radius, shadow, spacing } from '../theme';
import { Recipe } from '../types/recipe';
import { confirmAction } from '../utils/confirm';
import { exportRecipeAsPdf } from '../utils/exportRecipe';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'>;

export default function RecipeDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getRecipeById(id).then((r) => setRecipe(r ?? null));
    }, [id])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable style={styles.headerButton} onPress={() => setActionsVisible(true)} hitSlop={8}>
          <Text style={styles.headerButtonText}>•••</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const handleEdit = () => {
    setActionsVisible(false);
    navigation.navigate('EditRecipe', { id });
  };

  const handleExport = async () => {
    setActionsVisible(false);
    if (!recipe) return;
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      await exportRecipeAsPdf(recipe);
    } catch (error) {
      console.error('[export] failed', error);
      Alert.alert('Export impossible', "Une erreur est survenue lors de la génération de la fiche.");
    }
  };

  const handleAddToShoppingList = async () => {
    if (!recipe) return;
    await addIngredientsToShoppingList(recipe.ingredients, recipe.name);
    Alert.alert('Ajoutée', 'Les ingrédients ont été ajoutés à ta liste de courses.');
  };

  const handleDelete = () => {
    if (!recipe) return;
    setActionsVisible(false);
    confirmAction('Supprimer la recette ?', recipe.name, 'Supprimer', async () => {
      await deleteRecipe(recipe.id);
      navigation.goBack();
    });
  };

  if (!recipe) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Recette introuvable.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {recipe.photoUri ? (
          <Image source={{ uri: recipe.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoPlaceholderIcon}>{recipe.icon ?? '🍽️'}</Text>
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{recipe.category}</Text>
          </View>
          <Text style={styles.title}>{recipe.name}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{recipe.ingredients.length}</Text>
              <Text style={styles.statLabel}>
                Ingrédient{recipe.ingredients.length > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{recipe.steps.length}</Text>
              <Text style={styles.statLabel}>
                Étape{recipe.steps.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <Pressable style={styles.shoppingListButton} onPress={handleAddToShoppingList}>
            <Text style={styles.shoppingListButtonIcon}>🛒</Text>
            <Text style={styles.shoppingListButtonText}>Ajouter à la liste de courses</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Ingrédients</Text>
          <View style={styles.card}>
            {recipe.ingredients.map((ingredient, index) => (
              <View
                key={ingredient.id}
                style={[
                  styles.ingredientRow,
                  index === recipe.ingredients.length - 1 && styles.rowLast,
                ]}
              >
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientQuantity}>
                    {[ingredient.quantity, ingredient.unit].filter(Boolean).join(' ')}
                  </Text>
                  {ingredient.quantity || ingredient.unit ? '  ' : ''}
                  {ingredient.name}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Étapes</Text>
          <View style={styles.card}>
            {recipe.steps.map((step, index) => (
              <View
                key={index}
                style={[styles.stepRow, index === recipe.steps.length - 1 && styles.rowLast]}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <RecipeActionSheet
        visible={actionsVisible}
        recipeName={recipe.name}
        onEdit={handleEdit}
        onExport={handleExport}
        onDelete={handleDelete}
        onClose={() => setActionsVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  photo: {
    width: '100%',
    height: 300,
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 64,
  },
  body: {
    padding: spacing.xl,
    marginTop: -spacing.xl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.background,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadow.soft,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  shoppingListButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadow.fab,
  },
  shoppingListButtonIcon: {
    fontSize: 16,
  },
  shoppingListButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryMuted,
    marginRight: spacing.md,
  },
  ingredientText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 21,
  },
  ingredientQuantity: {
    fontWeight: '700',
    color: colors.primary,
  },
  stepRow: {
    flexDirection: 'row',
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  stepText: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  headerButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
});
