import { Recipe } from '../types/recipe';
import { escapeHtml, exportHtmlAsPdf } from './pdfExport';

function buildHtml(recipe: Recipe): string {
  const ingredientsHtml = recipe.ingredients
    .map((ingredient) => {
      const quantity = [ingredient.quantity, ingredient.unit].filter(Boolean).join(' ');
      return `<li><strong>${escapeHtml(quantity)}</strong> ${escapeHtml(ingredient.name)}</li>`;
    })
    .join('');

  const stepsHtml = recipe.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');

  const photoHtml = recipe.photoUri
    ? `<img src="${recipe.photoUri}" class="photo" />`
    : '';

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #2B2420; padding: 32px; }
          .category { color: #E2683D; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
          h1 { font-size: 28px; margin: 4px 0 20px; }
          .photo { width: 100%; max-height: 280px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; }
          h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #8B8077; margin-top: 28px; margin-bottom: 10px; }
          ul, ol { padding-left: 20px; margin: 0; }
          li { margin-bottom: 8px; font-size: 15px; line-height: 1.4; }
        </style>
      </head>
      <body>
        <div class="category">${escapeHtml(recipe.category)}</div>
        <h1>${escapeHtml(recipe.name)}</h1>
        ${photoHtml}
        <h2>Ingrédients</h2>
        <ul>${ingredientsHtml}</ul>
        <h2>Étapes</h2>
        <ol>${stepsHtml}</ol>
      </body>
    </html>
  `;
}

export async function exportRecipeAsPdf(recipe: Recipe): Promise<void> {
  await exportHtmlAsPdf(buildHtml(recipe), recipe.name, recipe.name);
}
