/**
 * Shorthand surah route — /33 → /surah/al-ahzab
 */

import { createFileRoute, redirect, notFound } from "@tanstack/react-router";
import { surahSlug } from "~/lib/surah-slugs";

export const Route = createFileRoute("/$surahId")({
  beforeLoad: ({ params }) => {
    // Only handle pure numeric IDs (1-114)
    if (!/^\d+$/.test(params.surahId)) {
      throw notFound();
    }

    const surahId = parseInt(params.surahId, 10);

    if (surahId < 1 || surahId > 114) {
      throw notFound();
    }

    throw redirect({
      to: "/surah/$surahSlug",
      params: { surahSlug: surahSlug(surahId) },
      search: { ayah: undefined },
    });
  },
});
