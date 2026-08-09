import { AiRecipeSuggestion } from '../services/geminiRecipeSearch';

export type RootStackParamList = {
  RecipeList: undefined;
  RecipeDetail: { id: string };
  AddRecipe: undefined;
  EditRecipe: { id: string };
  AiRecipePreview: { suggestion: AiRecipeSuggestion };
  ShoppingList: undefined;
};
