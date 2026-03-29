/**
 * Secde (sajdah) ayeti işareti — ۩ sembolü ile gösterilir.
 * Secde ayetlerinin yanında küçük bir aksan renkli işaret olarak görünür.
 */

import { useTranslation } from "~/hooks/useTranslation";

interface SajdahMarkerProps {
  /** Size in px (default 16) */
  size?: number;
}

export function SajdahMarker({ size = 16 }: SajdahMarkerProps) {
  const { t } = useTranslation();

  return (
    <span
      className="inline-flex items-center justify-center text-[var(--color-accent)] align-middle"
      title={t.reader.sajdah}
      aria-label={t.reader.sajdah}
      style={{ fontSize: `${size}px`, lineHeight: 1 }}
    >
      ۩
    </span>
  );
}
