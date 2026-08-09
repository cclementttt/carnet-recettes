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
    Alert.alert('Supprimer la recette ?', recipe.name, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(recipe.id);
          loadRecipes();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Mes recettes</Text>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate('ShoppingList')}>
          <Text style={styles.cartButtonIcon}>🛒</Text>
        </Pressable>
      </View>

      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, mode === 'mine' && styles.modeButtonActive]}
          onPress={() => setMode('mine')}
        >
          <Text style={[styles.modeButtonText, mode === 'mine' && styles.modeButtonTextActive]}>
            Mes recettes
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'ai' && styles.modeButtonActive]}
          onPress={() => setMode('ai')}
        >
          <Text style={[styles.modeButtonText, mode === 'ai' && styles.modeButtonTextActive]}>
            Recherche IA
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, mode === 'leftovers' && styles.modeButtonActive]}
          onPress={() => setMode('leftovers')}
        >
          <Text style={[styles.modeButtonText, mode === 'leftovers' && styles.modeButtonTextActive]}>
            Anti-gaspi
          </Text>
        </Pressable>
      </View>

      {mode === 'mine' ? (
        <>
          <TextInput
            style={styles.search}
            placeholder="Rechercher une recette ou un ingrédient..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            clearButtonMode="while-editing"
          />
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
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>
                  {recipes.length === 0
                    ? 'Aucune recette pour le moment. Ajoute la première !'
                    : 'Aucune recette ne correspond à ta recherche.'}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonIcon: {
    fontSize: 20,
  },
  modeRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  modeButtonText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  search: {
    margin: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 58,
    height: 58,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.fab,
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 32,
  },
});
