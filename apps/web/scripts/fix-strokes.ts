/**
 * Tüm harflerin stroke waypoint'lerini guide path bounding box'ına
 * göre yeniden ölçekleyip hizalar. Sonucu doğrudan letter-strokes.ts'e yazar.
 *
 * npx tsx scripts/fix-strokes.ts
 */

import * as fs from "fs";
import * as path from "path";
import { LETTER_GUIDE_PATHS } from "../src/lib/letter-guide-paths";
import { LETTER_STROKES, type LetterStrokeData } from "../src/lib/letter-strokes";

function parseBBox(d: string) {
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

// Transform all strokes
const MARGIN = 0.82; // stroke centerline ~82% of guide outline
const fixed: Record<string, LetterStrokeData> = {};
let changes = 0;

for (const [id, stroke] of Object.entries(LETTER_STROKES)) {
  const guide = LETTER_GUIDE_PATHS[id];
  if (!guide) {
    fixed[id] = stroke;
    continue;
  }

  const g = parseBBox(guide.guidePath);
  const s = strokeBBox(stroke);

  const gW = g.maxX - g.minX, gH = g.maxY - g.minY;
  const sW = s.maxX - s.minX, sH = s.maxY - s.minY;

  if (sW === 0 || sH === 0 || gW === 0 || gH === 0) {
    fixed[id] = stroke;
    continue;
  }

  const scaleX = (gW * MARGIN) / sW;
  const scaleY = (gH * MARGIN) / sH;

  const gCx = (g.minX + g.maxX) / 2;
  const gCy = (g.minY + g.maxY) / 2;
  const sCx = (s.minX + s.maxX) / 2;
  const sCy = (s.minY + s.maxY) / 2;

  const needsFix = Math.abs(scaleX - 1) > 0.12 || Math.abs(scaleY - 1) > 0.12 ||
                   Math.abs(gCx - sCx) > 8 || Math.abs(gCy - sCy) > 8;

  if (!needsFix) {
    fixed[id] = stroke;
    continue;
  }

  changes++;
  console.log(`🔧 ${id}: scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}) translate(${(gCx - sCx).toFixed(1)}, ${(gCy - sCy).toFixed(1)})`);

  // Transform all points: scale around stroke center, then translate to guide center
  const newStrokes = stroke.strokes.map(st => ({
    type: st.type,
    points: st.points.map(p => ({
      x: Math.round(((p.x - sCx) * scaleX + gCx) * 10) / 10,
      y: Math.round(((p.y - sCy) * scaleY + gCy) * 10) / 10,
    })),
  }));

  fixed[id] = { strokes: newStrokes };
}

console.log(`\n${changes} letters transformed.`);

// Write back
const outPath = path.join(import.meta.dirname!, "../src/lib/letter-strokes.ts");
const original = fs.readFileSync(outPath, "utf-8");

// Find the LETTER_STROKES object and replace its content
const startMarker = "export const LETTER_STROKES: Record<string, LetterStrokeData> = {";
const startIdx = original.indexOf(startMarker);
if (startIdx === -1) {
  console.error("Could not find LETTER_STROKES in file");
  process.exit(1);
}

// Find matching closing brace
let braceCount = 0;
let endIdx = startIdx + startMarker.length;
for (let i = endIdx; i < original.length; i++) {
  if (original[i] === "{") braceCount++;
  if (original[i] === "}") {
    if (braceCount === 0) {
      endIdx = i + 1;
      // Check for trailing semicolon
      if (original[i + 1] === ";") endIdx = i + 2;
      break;
    }
    braceCount--;
  }
}

// Generate new content
const letterEntries = Object.entries(fixed).map(([id, data]) => {
  const strokesStr = data.strokes.map(s => {
    const pts = s.points.map(p => `          { x: ${p.x}, y: ${p.y} }`).join(",\n");
    return `      {\n        type: "${s.type}",\n        points: [\n${pts},\n        ],\n      }`;
  }).join(",\n");
  return `  // ${id}\n  ${id}: {\n    strokes: [\n${strokesStr},\n    ],\n  }`;
}).join(",\n");

const newContent = original.substring(0, startIdx) +
  `export const LETTER_STROKES: Record<string, LetterStrokeData> = {\n${letterEntries},\n};\n`;

fs.writeFileSync(outPath, newContent, "utf-8");
console.log("✅ letter-strokes.ts updated.");
