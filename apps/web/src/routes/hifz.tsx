/**
 * Hıfz (Ezber Takibi) — /hifz
 * Discover altından erişilen tam sayfa ezber durumu.
 */

import { createFileRoute } from "@tanstack/react-router";
import { HifzStatus } from "~/components/profile/HifzStatus";

export const Route = createFileRoute("/hifz")({
  component: HifzPage,
});

function HifzPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-4 pb-24">
      <HifzStatus />
    </div>
  );
}
