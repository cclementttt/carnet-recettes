import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAiRecipeResults } from '../hooks/useAiRecipeResults';
import { searchRecipesWithAi } from '../services/geminiRecipeSearch';
import { colors, radius, spacing } from '../theme';
import AiProviderSelector from './AiProviderSelector';
import AiResultsPanel from './AiResultsPanel';

type Props = {
  onRecipeAdded: () => void;
};

export default function AiSearchSection({ onRecipeAdded }: Props) {
  const [query, setQuery] = useState('');
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
    if (!query.trim() || loading) return;
    runSearch((p) => searchRecipesWithAi(query.trim(), p));
  };

  return (
    <View style={styles.container}>
      <AiProviderSelector provider={provider} onChange={setProvider} />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Ex : pâtes courgettes, dessert sans four..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchButtonText}>{loading ? '...' : 'Chercher'}</Text>
        </Pressable>
      </View>

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
        emptyHint="Décris une envie (ingrédient, type de plat...) et l'IA te proposera des idées de recettes à ajouter à ton carnet."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
