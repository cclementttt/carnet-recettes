import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { AiRecipeSuggestion } from '../services/geminiRecipeSearch';
import AiRecipeCard from './AiRecipeCard';
import AiRecipeDetailModal from './AiRecipeDetailModal';

type Props = {
  loading: boolean;
  error: string | null;
  results: AiRecipeSuggestion[];
  addedIndexes: Set<number>;
  selectedIndex: number | null;
  selectedSuggestion: AiRecipeSuggestion | null;
  onSelect: (index: number | null) => void;
  onAdd: (suggestion: AiRecipeSuggestion, index: number) => void;
  onConsult: (suggestion: AiRecipeSuggestion) => void;
  emptyHint: string;
};

export default function AiResultsPanel({
  loading,
  error,
  results,
  addedIndexes,
  selectedIndex,
  selectedSuggestion,
  onSelect,
  onAdd,
  onConsult,
  emptyHint,
}: Props) {
  return (
    <>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && results.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.hintText}>{emptyHint}</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <AiRecipeCard
            suggestion={item}
            onPress={() => onSelect(index)}
            added={addedIndexes.has(index)}
          />
        )}
      />

      <AiRecipeDetailModal
        suggestion={selectedSuggestion}
        added={selectedIndex !== null && addedIndexes.has(selectedIndex)}
        onAdd={() => {
          if (selectedIndex !== null && selectedSuggestion) onAdd(selectedSuggestion, selectedIndex);
        }}
        onConsult={() => {
          if (selectedSuggestion) onConsult(selectedSuggestion);
          onSelect(null);
        }}
        onClose={() => onSelect(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    paddingTop: 40,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
});
