import { Ingredient } from '../types/recipe';

export type AiRecipeSuggestion = {
  name: string;
  category: string;
  ingredients: Omit<Ingredient, 'id'>[];
  steps: string[];
  photoQuery: string;
  photoUri?: string;
};

export type AiProvider = 'gemini' | 'groq';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const RECIPE_SHAPE_DESCRIPTION = `
  {
    "name": "Nom de la recette",
    "category": "Entrée" | "Plat" | "Dessert" | "Autre",
    "ingredients": [{ "name": "farine", "quantity": "200", "unit": "g" }],
    "steps": ["Étape 1", "Étape 2"],
    "photoQuery": "short English food photo search term, e.g. 'chocolate chip cookies'"
  }`;

function buildSearchPrompt(query: string): string {
  return `Tu es un assistant culinaire. Propose 2 idées de recettes en lien avec : "${query}".
Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte autour), de la forme :
[${RECIPE_SHAPE_DESCRIPTION}]
Les unités possibles sont : g, kg, mL, L, càs, càc, pièce, pincée, ou une chaîne vide.`;
}

function buildLeftoversPrompt(ingredientsText: string): string {
  return `Tu es un assistant culinaire anti-gaspillage. Voici ce que la personne a chez elle : "${ingredientsText}".
Propose 2 recettes réalisables en utilisant PRINCIPALEMENT ces ingrédients (tu peux supposer qu'elle a aussi sel, poivre, huile, eau). Si une recette nécessite un ingrédient non listé, inclus-le normalement dans la liste d'ingrédients pour que ce soit visible.
Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de texte autour), de la forme :
[${RECIPE_SHAPE_DESCRIPTION}]
Les unités possibles sont : g, kg, mL, L, càs, càc, pièce, pincée, ou une chaîne vide.`;
}

async function callGemini(promptText: string): Promise<AiRecipeSuggestion[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'colle_ta_cle_ici') {
    throw new Error('MISSING_API_KEY');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GEMINI_ERROR: ${response.status} ${text}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('EMPTY_RESPONSE');
  }

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('UNEXPECTED_FORMAT');
  }
  return parsed;
}

async function callGroq(promptText: string): Promise<AiRecipeSuggestion[]> {
  const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('MISSING_GROQ_API_KEY');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: `${promptText}\nUtilise exactement la forme : { "recipes": [...] } (objet avec une clé "recipes" contenant le tableau).`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GROQ_ERROR: ${response.status} ${text}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('EMPTY_RESPONSE');
  }

  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed.recipes)) {
    throw new Error('UNEXPECTED_FORMAT');
  }
  return parsed.recipes;
}

async function callProvider(promptText: string, provider: AiProvider): Promise<AiRecipeSuggestion[]> {
  if (provider === 'groq') {
    return callGroq(promptText);
  }
  return callGemini(promptText);
}

export async function searchRecipesWithAi(
  query: string,
  provider: AiProvider
): Promise<AiRecipeSuggestion[]> {
  return callProvider(buildSearchPrompt(query), provider);
}

export async function searchRecipesFromLeftovers(
  ingredientsText: string,
  provider: AiProvider
): Promise<AiRecipeSuggestion[]> {
  return callProvider(buildLeftoversPrompt(ingredientsText), provider);
}
