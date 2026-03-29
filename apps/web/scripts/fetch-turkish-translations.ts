/**
 * Quran.com API'den ek Türkçe mealleri çeker ve JSON dosyası olarak kaydeder.
 *
 * Kullanım: npx tsx scripts/fetch-turkish-translations.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve(import.meta.dirname, "../public/translations");
const API_BASE = "https://api.quran.com/api/v4";
const DELAY_MS = 300;

interface QDCTranslation {
  resource_id: number;
  text: string;
  verse_key?: string;
}

interface QDCResponse {
  translations: QDCTranslation[];
  pagination?: { total_pages: number; current_page: number };
}

// Quran.com'daki Türkçe mealler (mevcut olmayanlar)
const TRANSLATIONS_TO_FETCH = [
  { id: 210, slug: "dar-al-salam-tr", name: "Dar Al-Salam Center" },
  { id: 124, slug: "muslim-shahin-tr", name: "Muslim Shahin" },
  { id: 112, slug: "shaban-britch-tr", name: "Shaban Britch" },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchTranslation(translationId: number, slug: string, name: string) {
  console.log(`\n📥 Fetching: ${name} (ID=${translationId})...`);

  const verses: Record<string, string> = {};
  let totalFetched = 0;

  for (let surah = 1; surah <= 114; surah++) {
    const url = `${API_BASE}/quran/translations/${translationId}?chapter_number=${surah}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  ❌ Surah ${surah}: HTTP ${res.status}`);
        continue;
      }

      const data: QDCResponse = await res.json();
      let ayahNum = 1;
      for (const t of data.translations) {
        const key = t.verse_key || `${surah}:${ayahNum}`;
        // HTML tag'larını temizle
        const cleanText = t.text
          .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        verses[key] = cleanText;
        ayahNum++;
      }

      totalFetched += data.translations.length;

      if (surah % 20 === 0) {
        console.log(`  📖 ${surah}/114 sure tamamlandı (${totalFetched} ayet)`);
      }
    } catch (err) {
      console.error(`  ❌ Surah ${surah}: ${err}`);
    }

    await sleep(DELAY_MS);
  }

  if (totalFetched < 6000) {
    console.log(`  ⚠️  Yalnızca ${totalFetched} ayet alındı — atlanıyor.`);
    return;
  }

  const output = { id: slug, name, verses };
  const outPath = resolve(OUT_DIR, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(output, null, 0), "utf-8");
  console.log(`  ✅ ${totalFetched} ayet → ${outPath}`);
}

async function main() {
  console.log("🕌 Quran.com'dan Türkçe mealler çekiliyor...\n");

  for (const t of TRANSLATIONS_TO_FETCH) {
    await fetchTranslation(t.id, t.slug, t.name);
  }

  console.log("\n✅ Tamamlandı!");
  console.log("Şimdi çalıştır: npx pnpm@9 import:translations");
}

main();
