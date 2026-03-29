/**
 * Script: Guide path'lerden stroke centerline verilerini yeniden oluştur.
 *
 * Amiri font guide path'lerinin bounding box merkezini bulup, mevcut stroke
 * verilerini bu merkeze göre ölçekler ve kaydırır.
 *
 * Kullanım: npx tsx scripts/align-strokes.ts
 */

import { LETTER_GUIDE_PATHS } from "../src/lib/letter-guide-paths";
import { LETTER_STROKES, type LetterStrokeData } from "../src/lib/letter-strokes";

const VIEWBOX = 280;

// Parse SVG path to extract all coordinate pairs (rough bbox)
function parseBBox(d: string): { minX: number; minY: number; maxX: number; maxY: number } {
  const nums = d.match(/[-+]?\d+\.?\d*/g)?.map(Number) ?? [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY };
}

function strokeBBox(data: LetterStrokeData) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of data.strokes) {
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  return { minX, minY, maxX, maxY };
}

// Check alignment for each letter
for (const [id, guide] of Object.entries(LETTER_GUIDE_PATHS)) {
  const stroke = LETTER_STROKES[id];
  if (!stroke) {
    console.log(`❌ ${id}: No stroke data`);
    continue;
  }

  const gBox = parseBBox(guide.guidePath);
  const sBox = strokeBBox(stroke);

  const gCx = (gBox.minX + gBox.maxX) / 2;
  const gCy = (gBox.minY + gBox.maxY) / 2;
  const gW = gBox.maxX - gBox.minX;
  const gH = gBox.maxY - gBox.minY;

  const sCx = (sBox.minX + sBox.maxX) / 2;
  const sCy = (sBox.minY + sBox.maxY) / 2;
  const sW = sBox.maxX - sBox.minX;
  const sH = sBox.maxY - sBox.minY;

  const dx = Math.abs(gCx - sCx);
  const dy = Math.abs(gCy - sCy);
  const scaleX = gW > 0 ? sW / gW : 1;
  const scaleY = gH > 0 ? sH / gH : 1;

  const misaligned = dx > 15 || dy > 15 || Math.abs(scaleX - 1) > 0.3 || Math.abs(scaleY - 1) > 0.3;

  if (misaligned) {
    console.log(`⚠️  ${id}: center offset (${dx.toFixed(0)}, ${dy.toFixed(0)}) scale (${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`);
    console.log(`   guide center: (${gCx.toFixed(0)}, ${gCy.toFixed(0)}) size: ${gW.toFixed(0)}×${gH.toFixed(0)}`);
    console.log(`   stroke center: (${sCx.toFixed(0)}, ${sCy.toFixed(0)}) size: ${sW.toFixed(0)}×${sH.toFixed(0)}`);
  } else {
    console.log(`✅ ${id}: OK`);
  }

  // Check dot alignment
  if (guide.dotCenters && guide.dotCenters.length > 0) {
    const dots = stroke.strokes.filter(s => s.type === "dot");
    for (let i = 0; i < guide.dotCenters.length && i < dots.length; i++) {
      const gc = guide.dotCenters[i];
      const sc = dots[i].points[0];
      const dd = Math.sqrt((gc.x - sc.x) ** 2 + (gc.y - sc.y) ** 2);
      if (dd > 15) {
        console.log(`   🔴 dot ${i}: guide (${gc.x.toFixed(0)}, ${gc.y.toFixed(0)}) vs stroke (${sc.x.toFixed(0)}, ${sc.y.toFixed(0)}) — dist ${dd.toFixed(0)}`);
      }
    }
  }
}
