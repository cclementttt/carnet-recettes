import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'categories';
const DEFAULT_CATEGORIES = ['Entrée', 'Plat', 'Dessert', 'Autre'];

export async function getCategories(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(raw);
}

export async function addCategory(name: string): Promise<string[]> {
  const categories = await getCategories();
  const trimmed = name.trim();
  if (!trimmed || categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    return categories;
  }
  const updated = [...categories, trimmed];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteCategory(name: string): Promise<string[]> {
  const categories = await getCategories();
  const updated = categories.filter((c) => c !== name);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
