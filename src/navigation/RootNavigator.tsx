import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AiRecipePreviewScreen from '../screens/AiRecipePreviewScreen';
import RecipeFormScreen from '../screens/RecipeFormScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import { colors } from '../theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RecipeList"
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="RecipeList" component={RecipeListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="AddRecipe" component={RecipeFormScreen} options={{ title: 'Nouvelle recette' }} />
        <Stack.Screen name="EditRecipe" component={RecipeFormScreen} options={{ title: 'Modifier la recette' }} />
        <Stack.Screen
          name="AiRecipePreview"
          component={AiRecipePreviewScreen}
          options={{ title: 'Aperçu' }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{ title: 'Liste de courses' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
