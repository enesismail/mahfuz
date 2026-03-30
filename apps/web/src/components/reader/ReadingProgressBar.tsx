/**
 * Okuma ilerleme çubuğu — header'ın alt kenarında.
 * Progress yokken border görevi görür, scroll'da accent bar'a dönüşür.
 */

import { useEffect, useState, useRef } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function onScroll() {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const viewHeight = window.innerHeight;
        const scrollable = docHeight - viewHeight;

        if (scrollable > 0) {
          setProgress(Math.min(100, (scrollTop / scrollable) * 100));
        } else {
          setProgress(0);
        }

        rafRef.current = 0;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="h-[4px] w-full bg-[var(--color-border)]/30">
      <div
        className="h-full rounded-r-full transition-[width] duration-100 ease-linear"
        style={{
          width: `${progress}%`,
          background: "#ff0000",
          boxShadow: "0 2px 12px #ff0000",
        }}
      />
    </div>
  );
}
