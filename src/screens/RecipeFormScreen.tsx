import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AddCategoryModal from '../components/AddCategoryModal';
import IconPickerModal from '../components/IconPickerModal';
import UnitPicker from '../components/UnitPicker';
import { RootStackParamList } from '../navigation/types';
import { addCategory, getCategories } from '../storage/categoryStorage';
import { addRecipe, getRecipeById, updateRecipe } from '../storage/recipeStorage';
import { colors, radius, shadow, spacing } from '../theme';
import { Category, Ingredient } from '../types/recipe';

type Props = NativeStackScreenProps<RootStackParamList, 'AddRecipe' | 'EditRecipe'>;

function emptyIngredient(): Ingredient {
  return { id: uuidv4(), name: '', quantity: '', unit: 'g' };
}

export default function RecipeFormScreen({ navigation, route }: Props) {
  const editId = route.params && 'id' in route.params ? route.params.id : undefined;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Plat');
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [stepsText, setStepsText] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [icon, setIcon] = useState<string | null>(null);
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Modifier la recette' : 'Nouvelle recette' });
    if (!editId) return;
    getRecipeById(editId).then((recipe) => {
      if (!recipe) return;
      setName(recipe.name);
      setCategory(recipe.category);
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [emptyIngredient()]);
      setStepsText(recipe.steps.join('\n'));
      setPhotoUri(recipe.photoUri);
      setIcon(recipe.icon);
      setLoading(false);
    });
  }, [editId]);

  const handleAddCategory = async (newCategory: string) => {
    const updated = await addCategory(newCategory);
    setCategories(updated);
    setCategory(newCategory);
    setCategoryModalVisible(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission requise', "Autorise l'accès aux photos pour ajouter une image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setIcon(null);
    }
  };

  const handleSelectIcon = (selected: string) => {
    setIcon(selected);
    setPhotoUri(null);
  };

  const updateIngredient = (id: string, patch: Partial<Ingredient>) => {
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, ...patch } : ing)));
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [...prev, emptyIngredient()]);
  };

  const removeIngredientRow = (id: string) => {
    setIngredients((prev) => (prev.length > 1 ? prev.filter((ing) => ing.id !== id) : prev));
  };

  const handleSave = async () => {
    const cleanedIngredients = ingredients
      .map((ing) => ({ ...ing, name: ing.name.trim() }))
      .filter((ing) => ing.name.length > 0);
    const steps = stepsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (!name.trim()) {
      Alert.alert('Nom manquant', 'Donne un nom à ta recette.');
      return;
    }
    if (cleanedIngredients.length === 0) {
      Alert.alert('Ingrédients manquants', 'Ajoute au moins un ingrédient.');
      return;
    }
    if (steps.length === 0) {
      Alert.alert('Étapes manquantes', 'Ajoute au moins une étape.');
      return;
    }

    const input = {
      name: name.trim(),
      category,
      ingredients: cleanedIngredients,
      steps,
      photoUri,
      icon,
    };

    setSaving(true);
    try {
      if (editId) {
        await updateRecipe(editId, input);
      } else {
        await addRecipe(input);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={styles.photoPicker}
          onPress={icon ? () => setIconPickerVisible(true) : pickImage}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : icon ? (
            <Text style={styles.iconPreview}>{icon}</Text>
          ) : (
            <>
              <Text style={styles.photoPickerIcon}>📷</Text>
              <Text style={styles.photoPickerText}>Ajouter une photo</Text>
            </>
          )}
        </Pressable>
        <View style={styles.photoActionsRow}>
          <Pressable style={styles.photoActionButton} onPress={pickImage}>
            <Text style={styles.photoActionButtonText}>📷 Photo</Text>
          </Pressable>
          <Pressable style={styles.photoActionButton} onPress={() => setIconPickerVisible(true)}>
            <Text style={styles.photoActionButtonText}>🍪 Picto</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Nom de la recette</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex : Tarte aux pommes"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Section</Text>
        <View style={styles.categoryRow}>
          {categories.map((c) => (
            <Pressable
              key={c}
              style={[styles.categoryChip, category === c && styles.categoryChipActive]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.categoryChip, styles.categoryChipAdd]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.categoryChipAddText}>+ Nouvelle section</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Ingrédients</Text>
        <View style={styles.card}>
          {ingredients.map((ingredient, index) => (
            <View
              key={ingredient.id}
              style={[styles.ingredientRow, index === ingredients.length - 1 && styles.ingredientRowLast]}
            >
              <TextInput
                style={[styles.inputFlat, styles.ingredientName]}
                value={ingredient.name}
                onChangeText={(text) => updateIngredient(ingredient.id, { name: text })}
                placeholder="Ingrédient"
                placeholderTextColor={colors.textMuted}
              />
              <TextInput
                style={[styles.inputFlat, styles.ingredientQuantity]}
                value={ingredient.quantity}
                onChangeText={(text) => updateIngredient(ingredient.id, { quantity: text })}
                placeholder="Qté"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
              <UnitPicker
                value={ingredient.unit}
                onChange={(unit) => updateIngredient(ingredient.id, { unit })}
              />
              <Pressable
                style={styles.removeButton}
                onPress={() => removeIngredientRow(ingredient.id)}
                disabled={ingredients.length === 1}
              >
                <Text style={[styles.removeButtonText, ingredients.length === 1 && styles.removeButtonDisabled]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
        <Pressable style={styles.addIngredientButton} onPress={addIngredientRow}>
          <Text style={styles.addIngredientButtonText}>+ Ajouter un ingrédient</Text>
        </Pressable>

        <Text style={styles.label}>Étapes (une par ligne)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={stepsText}
          onChangeText={setStepsText}
          placeholder={'Préchauffer le four à 180°C\nÉtaler la pâte\nDisposer les pommes'}
          placeholderTextColor={colors.textMuted}
          multiline
          onFocus={() => {
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
          }}
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </Pressable>
      </ScrollView>

      <AddCategoryModal
        visible={categoryModalVisible}
        onSubmit={handleAddCategory}
        onClose={() => setCategoryModalVisible(false)}
      />

      <IconPickerModal
        visible={iconPickerVisible}
        onSelect={handleSelectIcon}
        onClose={() => setIconPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    padding: spacing.lg,
    paddingBottom: 60,
  },
  photoPicker: {
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  photoPickerIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  photoPickerText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  iconPreview: {
    fontSize: 64,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  photoActionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  photoActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: spacing.xl,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  categoryChipAdd: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  categoryChipAddText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  inputFlat: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  ingredientName: {
    flex: 3,
    minWidth: 0,
  },
  ingredientQuantity: {
    width: 55,
    flexShrink: 0,
  },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButtonDisabled: {
    color: colors.border,
  },
  addIngredientButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  addIngredientButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadow.card,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
