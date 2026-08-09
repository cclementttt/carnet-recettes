import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { addCategory } from '../storage/categoryStorage';
import { addRecipe, recipeExistsByName } from '../storage/recipeStorage';
import { colors, radius, shadow, spacing } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AiRecipePreview'>;

export default function AiRecipePreviewScreen({ route, navigation }: Props) {
  const { suggestion } = route.params;
  const [added, setAdded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    recipeExistsByName(suggestion.name).then(setAdded);
  }, [suggestion.name]);

  const handleAdd = async () => {
    if (added || saving) return;
    setSaving(true);
    try {
      if (await recipeExistsByName(suggestion.name)) {
        setAdded(true);
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
      setAdded(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {suggestion.photoUri ? (
          <Image source={{ uri: suggestion.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoIcon}>🍽️</Text>
          </View>
        )}

        <Text style={styles.category}>{suggestion.category}</Text>
        <Text style={styles.title}>{suggestion.name}</Text>

        <Text style={styles.sectionTitle}>Ingrédients</Text>
        <View style={styles.card}>
          {suggestion.ingredients.map((ingredient, index) => (
            <Text key={index} style={styles.line}>
              • {[ingredient.quantity, ingredient.unit].filter(Boolean).join(' ')}{' '}
              {ingredient.name}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Étapes</Text>
        <View style={styles.card}>
          {suggestion.steps.map((step, index) => (
            <Text key={index} style={styles.line}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.addButton, added && styles.addButtonDone]}
          onPress={handleAdd}
          disabled={added || saving}
        >
          <Text style={[styles.addButtonText, added && styles.addButtonTextDone]}>
            {added ? 'Ajoutée à mes recettes ✓' : saving ? 'Ajout en cours...' : 'Ajouter à mes recettes'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  photoPlaceholder: {
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 48,
  },
  category: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  line: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  addButtonDone: {
    backgroundColor: colors.surfaceMuted,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  addButtonTextDone: {
    color: colors.textMuted,
  },
});
