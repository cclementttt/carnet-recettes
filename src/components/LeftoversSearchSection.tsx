import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAiRecipeResults } from '../hooks/useAiRecipeResults';
import { searchRecipesFromLeftovers } from '../services/geminiRecipeSearch';
import { colors, radius, spacing } from '../theme';
import AiProviderSelector from './AiProviderSelector';
import AiResultsPanel from './AiResultsPanel';

type Props = {
  onRecipeAdded: () => void;
};

export default function LeftoversSearchSection({ onRecipeAdded }: Props) {
  const [ingredientsText, setIngredientsText] = useState('');
  const {
    navigation,
    loading,
    error,
    results,
    addedIndexes,
    selectedIndex,
    setSelectedIndex,
    provider,
    setProvider,
    runSearch,
    handleAdd,
    selectedSuggestion,
  } = useAiRecipeResults(onRecipeAdded);

  const handleSearch = () => {
    if (!ingredientsText.trim() || loading) return;
    runSearch((p) => searchRecipesFromLeftovers(ingredientsText.trim(), p));
  };

  return (
    <View style={styles.container}>
      <AiProviderSelector provider={provider} onChange={setProvider} />

      <Text style={styles.label}>Ce que tu as chez toi</Text>
      <TextInput
        style={styles.input}
        placeholder={'Ex : 3 œufs, des courgettes, du riz, un reste de poulet...'}
        placeholderTextColor={colors.textMuted}
        value={ingredientsText}
        onChangeText={setIngredientsText}
        multiline
      />
      <Pressable style={styles.searchButton} onPress={handleSearch} disabled={loading}>
        <Text style={styles.searchButtonText}>
          {loading ? 'Recherche...' : 'Trouver des recettes'}
        </Text>
      </Pressable>

      <AiResultsPanel
        loading={loading}
        error={error}
        results={results}
        addedIndexes={addedIndexes}
        selectedIndex={selectedIndex}
        selectedSuggestion={selectedSuggestion}
        onSelect={setSelectedIndex}
        onAdd={handleAdd}
        onConsult={(suggestion) => navigation.navigate('AiRecipePreview', { suggestion })}
        emptyHint="Liste les ingrédients que tu as chez toi et l'IA te proposera des recettes pour les utiliser, sans gaspillage."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 80,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  searchButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
