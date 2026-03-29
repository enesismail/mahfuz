/**
 * Okuma ilerleme çubuğu — sayfa/sure okuma görünümlerinde
 * kullanıcının ne kadar kaydırdığını gösteren ince çubuk.
 *
 * Sayfanın üstünde sabit, 100px kaydırıldıktan sonra görünür.
 */

import { useEffect, useState, useRef } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
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

        setVisible(scrollTop > 100);
        rafRef.current = 0;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-[2.5px] bg-[var(--color-accent)] transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
