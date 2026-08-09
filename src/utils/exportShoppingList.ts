import { ShoppingListItem } from '../types/shoppingList';
import { escapeHtml, exportHtmlAsPdf } from './pdfExport';

function buildHtml(items: ShoppingListItem[]): string {
  const groups = new Map<string, ShoppingListItem[]>();
  for (const item of items) {
    const group = groups.get(item.recipeName) ?? [];
    group.push(item);
    groups.set(item.recipeName, group);
  }

  const sectionsHtml = Array.from(groups.entries())
    .map(([recipeName, groupItems]) => {
      const itemsHtml = groupItems
        .map((item) => {
          const quantity = [item.quantity, item.unit].filter(Boolean).join(' ');
          return `<li class="${item.checked ? 'checked' : ''}">
            <span class="box">${item.checked ? '☑' : '☐'}</span>
            <strong>${escapeHtml(quantity)}</strong> ${escapeHtml(item.name)}
          </li>`;
        })
        .join('');
      return `<h2>${escapeHtml(recipeName)}</h2><ul>${itemsHtml}</ul>`;
    })
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #2B2420; padding: 32px; }
          h1 { font-size: 26px; margin: 0 0 24px; }
          h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #8B8077; margin-top: 24px; margin-bottom: 8px; }
          ul { list-style: none; padding: 0; margin: 0; }
          li { font-size: 15px; line-height: 1.6; padding: 4px 0; }
          li.checked { color: #8B8077; text-decoration: line-through; }
          .box { display: inline-block; width: 20px; }
        </style>
      </head>
      <body>
        <h1>Liste de courses</h1>
        ${sectionsHtml}
      </body>
    </html>
  `;
}

export async function exportShoppingListAsPdf(items: ShoppingListItem[]): Promise<void> {
  await exportHtmlAsPdf(buildHtml(items), 'liste-de-courses', 'Liste de courses');
}
