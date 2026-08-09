export const UNITS = ['g', 'kg', 'mL', 'L', 'càs', 'càc', 'pièce', 'pincée', ''] as const;
export type Unit = (typeof UNITS)[number];

export type Category = string;

export type Ingredient = {
  id: string;
  name: string;
  quantity: string;
  unit: Unit;
};

export const RECIPE_ICONS = [
  // Plats & repas
  '🍕', '🍔', '🌮', '🌯', '🥙', '🥪', '🍝', '🍜', '🍲', '🥘',
  '🍛', '🍱', '🍣', '🍤', '🥗', '🥫', '🫕', '🥟', '🫔', '🧆',
  // Viandes & poissons
  '🥩', '🍗', '🍖', '🌭', '🥓', '🐟', '🐠', '🦐', '🦞', '🦀',
  '🦑', '🐙', '🦪',
  // Petit-déjeuner & snacks
  '🍳', '🥞', '🧇', '🥐', '🍞', '🥖', '🥯', '🥨', '🧈', '🍿',
  '🥜', '🥚',
  // Desserts & sucreries
  '🍰', '🎂', '🧁', '🍮', '🍩', '🍪', '🍫', '🍬', '🍭', '🥧',
  '🍦', '🍨', '🍧', '🧋',
  // Fruits
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒',
  '🍑', '🥭', '🍍', '🥝', '🥥', '🫒', '🍈', '🍏',
  // Légumes
  '🥑', '🍆', '🍅', '🥒', '🌽', '🥔', '🥕', '🌶️', '🫑', '🥬',
  '🥦', '🧄', '🧅', '🍠', '🫘', '🥗', '🍄', '🫛',
  // Fromages & produits laitiers
  '🧀', '🥛', '🍼', '🫙',
  // Boissons
  '🍷', '🍺', '🍻', '🥂', '🍾', '🥃', '🍸', '🍹', '🧃', '🍵',
  '☕', '🫖', '🥤', '🧉',
  // Cuisine & ustensiles
  '🍽️', '🥄', '🍴', '🔪', '🫗', '🧂', '🍯', '🫚', '🫜',
  // Asiatique & spécialités
  '🍙', '🍘', '🍚', '🍢', '🍥', '🍡', '🥮', '🥠', '🥡',
  // Autres
  '🧊', '🌿', '🌾', '🫧', '🔥', '❄️', '🏠', '👨‍🍳', '👩‍🍳', '📖',
] as const;

export type Recipe = {
  id: string;
  name: string;
  category: Category;
  ingredients: Ingredient[];
  steps: string[];
  photoUri: string | null;
  icon: string | null;
  createdAt: number;
};

export type RecipeInput = Omit<Recipe, 'id' | 'createdAt'>;
