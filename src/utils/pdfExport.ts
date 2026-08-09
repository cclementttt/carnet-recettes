import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export function slugifyFileName(name: string): string {
  const withoutDiacritics = name.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const slug = withoutDiacritics.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'document';
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function exportHtmlAsPdf(html: string, fileNameBase: string, dialogTitle: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const fileName = `${slugifyFileName(fileNameBase)}.pdf`;
  const destination = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: destination });

  await Sharing.shareAsync(destination, {
    mimeType: 'application/pdf',
    dialogTitle,
    UTI: 'com.adobe.pdf',
  });
}
