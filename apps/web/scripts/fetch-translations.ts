/**
 * Quran.com API'den mealleri çeker ve JSON dosyası olarak kaydeder.
 *
 * Kullanım: npx tsx scripts/fetch-translations.ts
 */

import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const OUT_DIR = resolve(import.meta.dirname, "../public/translations");
const API_BASE = "https://api.quran.com/api/v4";
const DELAY_MS = 250;

interface QDCResponse {
  translations: Array<{ resource_id: number; text: string; verse_key?: string }>;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Çekilecek mealler ──────────────────────────────────

const TRANSLATIONS_TO_FETCH = [
  // Büyük Müslüman nüfus dilleri
  { id: 54,  slug: "junagarhi-ur",     name: "Maulana Muhammad Junagarhi",     lang: "ur" },
  { id: 122, slug: "azizul-haque-hi",  name: "Maulana Azizul Haque al-Umari",  lang: "hi" },
  { id: 213, slug: "zakaria-bn",       name: "Dr. Abu Bakr Muhammad Zakaria",   lang: "bn" },
  { id: 134, slug: "kfqpc-id-v2",      name: "King Fahad Quran Complex",        lang: "id" },
  { id: 80,  slug: "karakunnu-ml",     name: "Muhammad Karakunnu",              lang: "ml" },

  // Komşu diller
  { id: 75,  slug: "musayev-az",       name: "Alikhan Musayev",                 lang: "az" },
  { id: 126, slug: "korkut-bs",        name: "Besim Korkut",                    lang: "bs" },
  { id: 45,  slug: "kuliev-ru-v2",     name: "Elmir Kuliev",                    lang: "ru" },
  { id: 36,  slug: "korean-ko",        name: "Korean Translation",              lang: "ko" },
  { id: 35,  slug: "mita-ja",          name: "Ryoichi Mita",                    lang: "ja" },
  { id: 48,  slug: "bernstrom-sv",     name: "Knut Bernström",                  lang: "sv" },
  { id: 41,  slug: "norwegian-no",     name: "Norwegian Translation",           lang: "no" },
  { id: 42,  slug: "bielawski-pl",     name: "Józef Bielawski",                 lang: "pl" },
  { id: 217, slug: "yaqubovic-uk",     name: "Dr. Mikhailo Yaqubovic",          lang: "uk" },

  // İngilizce popüler mealler
  { id: 85,  slug: "haleem-en",        name: "M.A.S. Abdel Haleem",             lang: "en" },
  { id: 22,  slug: "yusufali-en",      name: "Abdullah Yusuf Ali",              lang: "en" },
  { id: 84,  slug: "usmani-en",        name: "Mufti Taqi Usmani",              lang: "en" },
  { id: 149, slug: "bridges-en",       name: "Bridges (Fadel Soliman)",         lang: "en" },
  { id: 203, slug: "hilali-khan-en",   name: "Al-Hilali & Khan",               lang: "en" },
];

async function fetchTranslation(translationId: number, slug: string, name: string) {
  const outPath = resolve(OUT_DIR, `${slug}.json`);

  // Zaten varsa atla
  if (existsSync(outPath)) {
    console.log(`  ⏭  ${slug} zaten mevcut, atlanıyor.`);
    return;
  }

  console.log(`\n📥 ${name} (ID=${translationId})...`);

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

      if (surah % 30 === 0) {
        process.stdout.write(`  📖 ${surah}/114`);
        process.stdout.write(`  (${totalFetched} ayet)\n`);
      }
    } catch (err) {
      console.error(`  ❌ Surah ${surah}: ${err}`);
    }

    await sleep(DELAY_MS);
  }

  if (totalFetched < 6000) {
    console.log(`  ⚠️  ${totalFetched} ayet — eksik, atlanıyor.`);
    return;
  }

  writeFileSync(outPath, JSON.stringify({ id: slug, name, verses }, null, 0), "utf-8");
  console.log(`  ✅ ${totalFetched} ayet kaydedildi.`);
}

async function main() {
  console.log("🕌 Quran.com'dan mealler çekiliyor...");
  console.log(`   ${TRANSLATIONS_TO_FETCH.length} meal planlandı\n`);

  for (const t of TRANSLATIONS_TO_FETCH) {
    await fetchTranslation(t.id, t.slug, t.name);
  }

  // import-translations.ts'e eklenecek slug → language mapping'i göster
  console.log("\n\n📋 import-translations.ts'e ekle:\n");
  for (const t of TRANSLATIONS_TO_FETCH) {
    console.log(`  "${t.slug}": "${t.lang}",`);
  }

  console.log("\nPRIORITY_SLUGS'a ekle:\n");
  const byLang: Record<string, string[]> = {};
  for (const t of TRANSLATIONS_TO_FETCH) {
    (byLang[t.lang] ??= []).push(`"${t.slug}"`);
  }
  for (const [lang, slugs] of Object.entries(byLang)) {
    console.log(`  ${slugs.join(", ")}, // ${lang.toUpperCase()}`);
  }

  console.log("\n✅ Tamamlandı! Şimdi:\n  1. import-translations.ts'e mapping ekle\n  2. npx pnpm@9 import:translations çalıştır");
}

main();
