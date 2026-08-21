import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Recipe, RecipeInput } from '../types/recipe';
import kvStore from './kvStore';

const STORAGE_KEY = 'recipes';

export async function getRecipes(): Promise<Recipe[]> {
  const raw = await kvStore.getItem(STORAGE_KEY);
  if (!raw) return [];
  const recipes: Recipe[] = JSON.parse(raw);
  return recipes.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const recipes = await getRecipes();
  return recipes.find((r) => r.id === id);
}

export async function recipeExistsByName(name: string): Promise<boolean> {
  const recipes = await getRecipes();
  const normalized = name.trim().toLowerCase();
  return recipes.some((r) => r.name.trim().toLowerCase() === normalized);
}

export async function addRecipe(input: RecipeInput): Promise<Recipe> {
  const recipes = await getRecipes();
  const recipe: Recipe = {
    ...input,
    id: uuidv4(),
    createdAt: Date.now(),
  };
  await kvStore.setItem(STORAGE_KEY, JSON.stringify([...recipes, recipe]));
  return recipe;
}

export async function updateRecipe(id: string, input: RecipeInput): Promise<void> {
  const recipes = await getRecipes();
  const updated = recipes.map((r) => (r.id === id ? { ...r, ...input } : r));
  await kvStore.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getRecipes();
  const filtered = recipes.filter((r) => r.id !== id);
  await kvStore.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
