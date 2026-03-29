/**
 * Okuma ilerleme çubuğu — sayfa/sure okuma görünümlerinde
 * kullanıcının ne kadar kaydırdığını gösteren ince çubuk.
 *
 * Sayfanın üstünde sabit, scroll başladığında görünür.
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

  if (progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className="h-[3px] bg-[var(--color-accent)] transition-[width] duration-100 ease-linear rounded-r-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
