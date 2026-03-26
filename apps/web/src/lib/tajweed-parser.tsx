/**
 * Tecvidli HTML metnini React elementlerine dönüştürür.
 *
 * API formatı: <tajweed class=RULE_NAME>harfler</tajweed>  (iç içe olabilir)
 * Çıktı:       <span className="tajweed-RULE_NAME">harfler</span>
 */

import type { ReactNode } from "react";

const OPEN_TAG = "<tajweed class=";
const CLOSE_TAG = "</tajweed>";

/**
 * Tecvidli HTML string'ini React elementlerine parse eder.
 * İç içe (nested) tag'ları destekler.
 * showTajweed=false ise sadece düz metni döner (renksiz).
 */
export function parseTajweed(html: string, showTajweed: boolean): ReactNode[] {
  if (!showTajweed) {
    return [html.replace(/<\/?tajweed[^>]*>/g, "")];
  }

  let pos = 0;
  let key = 0;

  function parseNodes(until?: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let textStart = pos;

    while (pos < html.length) {
      // Kapanış tag'ı kontrolü
      if (until && html.startsWith(until, pos)) {
        if (pos > textStart) nodes.push(html.slice(textStart, pos));
        pos += until.length;
        return nodes;
      }

      // Açılış tag'ı kontrolü
      if (html.startsWith(OPEN_TAG, pos)) {
        if (pos > textStart) nodes.push(html.slice(textStart, pos));
        const classStart = pos + OPEN_TAG.length;
        const gt = html.indexOf(">", classStart);
        if (gt === -1) { pos++; continue; }
        const rule = html.slice(classStart, gt);
        pos = gt + 1;
        const children = parseNodes(CLOSE_TAG);
        nodes.push(
          <span key={key++} className={`tajweed-${rule}`}>
            {children}
          </span>,
        );
        textStart = pos;
        continue;
      }

      pos++;
    }

    if (pos > textStart) nodes.push(html.slice(textStart, pos));
    return nodes;
  }

  return parseNodes();
}
