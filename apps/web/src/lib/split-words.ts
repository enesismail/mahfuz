/**
 * Arapça metni kelimelere böler, secavend (vakıf) işaretlerini önceki kelimeye yapıştırır.
 *
 * Mushaf verisinde secavend işaretleri (ۖ ۗ ۘ ۙ ۚ ۛ ۜ — U+06D6…U+06DC)
 * bazen boşlukla ayrılmış bağımsız token olarak gelir.
 * Bu fonksiyon onları önceki kelimeye non-breaking space ile bağlar,
 * böylece tarayıcı kırılma noktası olarak kullanmaz.
 */

/** U+06D6 … U+06DC arası secavend/vakıf işaretleri */
const SECAVEND_RE = /^[\u06D6-\u06DC]+$/;

export function splitWords(text: string): string[] {
  const raw = text.split(/\s+/).filter(Boolean);
  const result: string[] = [];

  for (const token of raw) {
    if (SECAVEND_RE.test(token) && result.length > 0) {
      // Secavend işaretini önceki kelimeye non-breaking space ile bağla
      result[result.length - 1] += "\u00A0" + token;
    } else {
      result.push(token);
    }
  }

  return result;
}
