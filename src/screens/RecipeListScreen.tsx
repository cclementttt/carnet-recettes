import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AiSearchSection from '../components/AiSearchSection';
import LeftoversSearchSection from '../components/LeftoversSearchSection';
import RecipeActionSheet from '../components/RecipeActionSheet';
import RecipeListItem from '../components/RecipeListItem';
import { RootStackParamList } from '../navigation/types';
import { getCategories } from '../storage/categoryStorage';
import { deleteRecipe, getRecipes } from '../storage/recipeStorage';
import { colors, radius, shadow, spacing } from '../theme';
import { Recipe } from '../types/recipe';
import { confirmAction } from '../utils/confirm';
import { exportRecipeAsPdf } from '../utils/exportRecipe';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeList'>;
type Mode = 'mine' | 'ai' | 'leftovers';

export default function RecipeListScreen({ navigation }: Props) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<Mode>('mine');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);

  const loadRecipes = useCallback(async () => {
    const [data, categoryList] = await Promise.all([getRecipes(), getCategories()]);
    setRecipes(data);
    setCategories(categoryList);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  const sections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = recipes.filter((recipe) => {
      if (!normalized) return true;
      const inName = recipe.name.toLowerCase().includes(normalized);
      const inIngredients = recipe.ingredients.some((ingredient) =>
        ingredient.name.toLowerCase().includes(normalized)
      );
      return inName || inIngredients;
    });

    const usedCategories = Array.from(new Set(filtered.map((r) => r.category)));
    const orderedCategories = [
      ...categories.filter((c) => usedCategories.includes(c)),
      ...usedCategories.filter((c) => !categories.includes(c)),
    ];

    return orderedCategories
      .map((category) => ({
        title: category,
        data: filtered
          .filter((r) => r.category === category)
          .sort((a, b) => a.name.localeCompare(b.name, 'fr')),
      }))
      .filter((section) => section.data.length > 0);
  }, [recipes, categories, query]);

  const handleEdit = () => {
    if (!activeRecipe) return;
    const id = activeRecipe.id;
    setActiveRecipe(null);
    navigation.navigate('EditRecipe', { id });
  };

  const handleExport = async () => {
    if (!activeRecipe) return;
    const recipe = activeRecipe;
    setActiveRecipe(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      await exportRecipeAsPdf(recipe);
    } catch (error) {
      console.error('[export] failed', error);
      Alert.alert('Export impossible', "Une erreur est survenue lors de la génération de la fiche.");
    }
  };

  const handleDelete = () => {
    if (!activeRecipe) return;
    const recipe = activeRecipe;
    setActiveRecipe(null);
    confirmAction('Supprimer la recette ?', recipe.name, 'Supprimer', async () => {
      await deleteRecipe(recipe.id);
      loadRecipes();
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Mes recettes</Text>
          {recipes.length > 0 && (
            <Text style={styles.recipeCount}>
              {recipes.length} recette{recipes.length > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate('ShoppingList')}>
          <Text style={styles.cartButtonIcon}>🛒</Text>
        </Pressable>
      </View>

      <View style={styles.modeRow}>
        {([
          { key: 'mine' as Mode, label: 'Mes recettes', icon: '📖' },
          { key: 'ai' as Mode, label: 'Recherche IA', icon: '✨' },
          { key: 'leftovers' as Mode, label: 'Anti-gaspi', icon: '♻️' },
        ]).map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.modeButton, mode === tab.key && styles.modeButtonActive]}
            onPress={() => setMode(tab.key)}
          >
            <Text style={styles.modeButtonIcon}>{tab.icon}</Text>
            <Text style={[styles.modeButtonText, mode === tab.key && styles.modeButtonTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'mine' ? (
        <>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.search}
              placeholder="Rechercher..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              clearButtonMode="while-editing"
            />
          </View>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <RecipeListItem
                recipe={item}
                onPress={() => navigation.navigate('RecipeDetail', { id: item.id })}
                onLongPress={() => setActiveRecipe(item)}
              />
            )}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderLine} />
                <Text style={styles.sectionHeader}>{section.title}</Text>
                <View style={styles.sectionHeaderLine} />
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <View style={styles.emptyIconWrapper}>
                  <Text style={styles.emptyIcon}>{recipes.length === 0 ? '👨‍🍳' : '🔍'}</Text>
                </View>
                <Text style={styles.emptyTitle}>
                  {recipes.length === 0 ? 'Ton carnet est vide' : 'Aucun résultat'}
                </Text>
                <Text style={styles.emptyText}>
                  {recipes.length === 0
                    ? 'Appuie sur + pour ajouter ta première recette !'
                    : 'Essaie un autre mot-clé.'}
                </Text>
              </View>
            }
          />
        </>
      ) : mode === 'ai' ? (
        <AiSearchSection onRecipeAdded={loadRecipes} />
      ) : (
        <LeftoversSearchSection onRecipeAdded={loadRecipes} />
      )}

      <Pressable style={styles.fab} onPress={() => navigation.navigate('AddRecipe')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <RecipeActionSheet
        visible={!!activeRecipe}
        recipeName={activeRecipe?.name ?? ''}
        onEdit={handleEdit}
        onExport={handleExport}
        onDelete={handleDelete}
        onClose={() => setActiveRecipe(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  recipeCount: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  cartButtonIcon: {
    fontSize: 22,
  },
  modeRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  modeButtonActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  modeButtonIcon: {
    fontSize: 12,
  },
  modeButtonText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    opacity: 0.6,
  },
  search: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    fontSize: 15,
    color: colors.text,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 120,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  empty: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 50,
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xxl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
