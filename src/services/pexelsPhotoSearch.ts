export async function searchRecipePhoto(query: string): Promise<string | undefined> {
  const apiKey = process.env.EXPO_PUBLIC_PEXELS_API_KEY;
  if (!apiKey) return undefined;

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)} food&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    if (!response.ok) return undefined;

    const data = await response.json();
    return data.photos?.[0]?.src?.large as string | undefined;
  } catch {
    return undefined;
  }
}
