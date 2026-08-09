import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { RootStackParamList } from '../navigation/types';
import { AiProvider, AiRecipeSuggestion } from '../services/geminiRecipeSearch';
import { searchRecipePhoto } from '../services/pexelsPhotoSearch';
import { addCategory } from '../storage/categoryStorage';
import { addRecipe, recipeExistsByName } from '../storage/recipeStorage';

export function useAiRecipeResults(onRecipeAdded: () => void) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AiRecipeSuggestion[]>([]);
  const [addedIndexes, setAddedIndexes] = useState<Set<number>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [provider, setProvider] = useState<AiProvider>('gemini');

  const runSearch = async (fetchSuggestions: (provider: AiProvider) => Promise<AiRecipeSuggestion[]>) => {
    setLoading(true);
    setError(null);
    setAddedIndexes(new Set());
    try {
      const suggestions = await fetchSuggestions(provider);
      setResults(suggestions);

      const [photos, existingFlags] = await Promise.all([
        Promise.all(suggestions.map((suggestion) => searchRecipePhoto(suggestion.photoQuery))),
        Promise.all(suggestions.map((suggestion) => recipeExistsByName(suggestion.name))),
      ]);
      setResults(suggestions.map((suggestion, index) => ({ ...suggestion, photoUri: photos[index] })));
      setAddedIndexes(new Set(existingFlags.flatMap((exists, index) => (exists ? [index] : []))));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[ai-search] failed:', message);
      if (message === 'MISSING_API_KEY' || message === 'MISSING_GROQ_API_KEY') {
        setError(
          `Aucune clé API ${provider === 'gemini' ? 'Gemini' : 'Groq'} configurée. Ajoute-la dans le fichier .env.local du projet, puis redémarre le serveur Expo.`
        );
      } else if (message.startsWith('GEMINI_ERROR: 429')) {
        setError("Quota gratuit Gemini épuisé pour aujourd'hui. Réessaie demain, ou bascule sur Groq.");
      } else {
        setError(`La recherche via ${provider === 'gemini' ? 'Gemini' : 'Groq'} a échoué. Réessaie, ou change d'IA.`);
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (suggestion: AiRecipeSuggestion, index: number) => {
    if (await recipeExistsByName(suggestion.name)) {
      setAddedIndexes((prev) => new Set(prev).add(index));
      Alert.alert('Déjà ajoutée', 'Cette recette est déjà dans ton carnet.');
      return;
    }
    await addCategory(suggestion.category);
    await addRecipe({
      name: suggestion.name,
      category: suggestion.category,
      ingredients: suggestion.ingredients.map((ingredient) => ({ ...ingredient, id: uuidv4() })),
      steps: suggestion.steps,
      photoUri: suggestion.photoUri ?? null,
      icon: null,
    });
    setAddedIndexes((prev) => new Set(prev).add(index));
    onRecipeAdded();
  };

  const selectedSuggestion = selectedIndex !== null ? results[selectedIndex] : null;

  return {
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
  };
}
