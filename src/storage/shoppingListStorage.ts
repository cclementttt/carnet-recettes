import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { Ingredient } from '../types/recipe';
import { ShoppingListItem } from '../types/shoppingList';

const STORAGE_KEY = 'shoppingList';

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const items: ShoppingListItem[] = JSON.parse(raw);
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function addIngredientsToShoppingList(
  ingredients: Ingredient[],
  recipeName: string
): Promise<void> {
  const items = await getShoppingList();
  const newItems: ShoppingListItem[] = ingredients.map((ingredient) => ({
    id: uuidv4(),
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    recipeName,
    checked: false,
    createdAt: Date.now(),
  }));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...items, ...newItems]));
}

export async function addManualItem(name: string): Promise<void> {
  const items = await getShoppingList();
  const newItem: ShoppingListItem = {
    id: uuidv4(),
    name,
    quantity: '',
    unit: '',
    recipeName: 'Ajout manuel',
    checked: false,
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...items, newItem]));
}

export async function toggleShoppingItem(id: string): Promise<void> {
  const items = await getShoppingList();
  const updated = items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function removeShoppingItem(id: string): Promise<void> {
  const items = await getShoppingList();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter((item) => item.id !== id)));
}

export async function clearCheckedItems(): Promise<void> {
  const items = await getShoppingList();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items.filter((item) => !item.checked)));
}

export async function clearShoppingList(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
