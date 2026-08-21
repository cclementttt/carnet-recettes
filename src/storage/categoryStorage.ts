import kvStore from './kvStore';

const STORAGE_KEY = 'categories';
const DEFAULT_CATEGORIES = ['Entrée', 'Plat', 'Dessert', 'Autre'];

export async function getCategories(): Promise<string[]> {
  const raw = await kvStore.getItem(STORAGE_KEY);
  if (!raw) {
    await kvStore.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
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
  await kvStore.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteCategory(name: string): Promise<string[]> {
  const categories = await getCategories();
  const updated = categories.filter((c) => c !== name);
  await kvStore.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
