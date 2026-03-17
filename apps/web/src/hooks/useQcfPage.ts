import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_KEYS } from "~/lib/query-keys";

// --- Types ---

export interface QcfWord {
  id: number;
  position: number;
  text_uthmani: string;
  code_v2: string;
  line_number: number;
  verse_key: string;
  char_type_name: "word" | "end" | "pause";
}

export interface QcfVerse {
  id: number;
  verse_key: string;
  verse_number: number;
  words: QcfWord[];
}

export interface QcfPageData {
  pageNumber: number;
  verses: QcfVerse[];
  lines: Map<number, QcfWord[]>; // lineNumber → words
}

// --- Font loading ---

const loadedFonts = new Set<number>();

export async function loadQcfFont(pageNumber: number): Promise<void> {
  if (loadedFonts.has(pageNumber)) return;
  const fontFamily = `QCF_P${String(pageNumber).padStart(3, "0")}`;
  const url = `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${pageNumber}.woff2`;
  const face = new FontFace(fontFamily, `url(${url})`, {
    display: "swap",
    style: "normal",
    weight: "normal",
  });
  const loaded = await face.load();
  document.fonts.add(loaded);
  loadedFonts.add(pageNumber);
}

export function getQcfFontFamily(pageNumber: number): string {
  return `QCF_P${String(pageNumber).padStart(3, "0")}`;
}

// --- API fetch ---

async function fetchQcfPage(pageNumber: number): Promise<QcfPageData> {
  const res = await fetch(
    `https://api.quran.com/api/v4/verses/by_page/${pageNumber}?words=true&word_fields=code_v2,line_number&per_page=50&mushaf=1`,
  );
  if (!res.ok) throw new Error(`QCF API error: ${res.status}`);
  const json = await res.json();

  const verses: QcfVerse[] = json.verses.map((v: any) => ({
    id: v.id,
    verse_key: v.verse_key,
    verse_number: v.verse_number,
    words: v.words.map((w: any) => ({
      id: w.id,
      position: w.position,
      text_uthmani: w.text_uthmani ?? "",
      code_v2: w.code_v2 ?? "",
      line_number: w.line_number ?? 1,
      verse_key: v.verse_key,
      char_type_name: w.char_type_name ?? "word",
    })),
  }));

  // Group all words by line_number
  const lines = new Map<number, QcfWord[]>();
  for (const verse of verses) {
    for (const word of verse.words) {
      const lineWords = lines.get(word.line_number) ?? [];
      lineWords.push(word);
      lines.set(word.line_number, lineWords);
    }
  }

  return { pageNumber, verses, lines };
}

// --- Query options ---

export function qcfPageQueryOptions(pageNumber: number) {
  return queryOptions({
    queryKey: QUERY_KEYS.qcfPage(pageNumber),
    queryFn: () => fetchQcfPage(pageNumber),
    staleTime: Infinity,
  });
}

// --- Preload adjacent pages ---

export function useQcfPreload(pageNumber: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Preload adjacent pages
    const pages = [pageNumber - 1, pageNumber + 1].filter(
      (p) => p >= 1 && p <= 604,
    );
    for (const p of pages) {
      queryClient.prefetchQuery(qcfPageQueryOptions(p));
      loadQcfFont(p).catch(() => {});
    }
  }, [pageNumber, queryClient]);
}
