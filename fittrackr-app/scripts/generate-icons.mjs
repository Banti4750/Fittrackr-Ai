/* eslint-disable no-console */
// Generates branded PNG assets for Expo from inline SVG using sharp.
// Run: node scripts/generate-icons.mjs

import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

const COLORS = {
  bg: '#0A0A0A',
  lime: '#C8FF00',
  white: '#FFFFFF',
  orange: '#FF5C00',
  orangeMuted: '#2A1300',
  border: '#2A2A2A',
};

// "FT" monogram + AI pill — drawn with pure SVG paths/rects so we don't depend
// on any installed system fonts. Designed for a 1024×1024 canvas; gets resized
// by sharp to fit any target dimensions.
function iconSvg({ size = 1024, withBackground = true, transparent = false } = {}) {
  const bg = transparent
    ? ''
    : withBackground
    ? `<rect width="${size}" height="${size}" fill="${COLORS.bg}"/>`
    : '';

  // Use viewBox so geometry stays consistent at any output size.
  // Geometric "FT" monogram (chunky display-style letterforms drawn as rects),
  // sized for ~520px tall inside a 1024 canvas.
  // ── F (lime) ────────────────────────────────────────────────────────────
  // Stem at x=240, top crossbar, mid crossbar
  // ── T (white) ───────────────────────────────────────────────────────────
  // Top crossbar at y=300, stem centered around x=720
  const ft = `
    <!-- F -->
    <rect x="220" y="300" width="90"  height="430" fill="${COLORS.lime}"/>
    <rect x="220" y="300" width="260" height="80"  fill="${COLORS.lime}"/>
    <rect x="220" y="480" width="200" height="70"  fill="${COLORS.lime}"/>
    <!-- T -->
    <rect x="540" y="300" width="280" height="80"  fill="${COLORS.white}"/>
    <rect x="635" y="300" width="90"  height="430" fill="${COLORS.white}"/>
  `;

  // AI pill at the bottom — orange text on orange-muted bg with orange border
  const pill = `
    <g transform="translate(362 790)">
      <rect width="300" height="100" rx="50" ry="50"
            fill="${COLORS.orangeMuted}" stroke="${COLORS.orange}" stroke-width="4"/>
      <!-- A (path) -->
      <path d="M 70 78
               L 100 22
               L 130 22
               L 160 78
               L 138 78
               L 132 65
               L 98 65
               L 92 78 Z
               M 104 50
               L 126 50
               L 115 28 Z"
            fill="${COLORS.orange}"/>
      <!-- I (rect) -->
      <rect x="190" y="22" width="22" height="56" fill="${COLORS.orange}"/>
      <!-- dot below I to make it more readable as letterform -->
      <rect x="180" y="22" width="42" height="10" fill="${COLORS.orange}"/>
      <rect x="180" y="68" width="42" height="10" fill="${COLORS.orange}"/>
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">
  ${bg}
  ${ft}
  ${pill}
</svg>`;
}

// Splash: tall portrait canvas, mark centered, with a subtle vertical
// lime→orange glow gradient like the in-app splash.
function splashSvg({ width = 1242, height = 2436 } = {}) {
  const cx = width / 2;
  const cy = height / 2;
  // The mark itself reuses iconSvg geometry but placed at center of a portrait canvas.
  // We scale a 1024 viewBox into a centered 700px square.
  const markSize = 700;
  const markX = cx - markSize / 2;
  const markY = cy - markSize / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="brandGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="${COLORS.lime}"   stop-opacity="0.10"/>
      <stop offset="50%"  stop-color="#000000"          stop-opacity="0"/>
      <stop offset="100%" stop-color="${COLORS.orange}" stop-opacity="0.10"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${COLORS.bg}"/>
  <rect width="${width}" height="${height}" fill="url(#brandGlow)"/>
  <svg x="${markX}" y="${markY}" width="${markSize}" height="${markSize}" viewBox="0 0 1024 1024">
    ${iconSvg({ withBackground: false }).match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]}
  </svg>
</svg>`;
}

async function renderSvg(svgString, outFile, { width, height, flatten } = {}) {
  let pipe = sharp(Buffer.from(svgString));
  if (width || height) pipe = pipe.resize(width, height, { fit: 'contain' });
  if (flatten) pipe = pipe.flatten({ background: COLORS.bg });
  await pipe.png().toFile(outFile);
  console.log(`  ✓ ${outFile.replace(assetsDir + '\\', '').replace(assetsDir + '/', '')}`);
}

async function main() {
  await mkdir(assetsDir, { recursive: true });

  console.log('Generating brand PNGs…');

  // App icon — opaque, 1024x1024, Apple/Android both want no transparency here.
  const icon = iconSvg({ withBackground: true });
  await writeFile(join(assetsDir, 'icon.svg'), icon, 'utf8');
  await renderSvg(icon, join(assetsDir, 'icon.png'), { width: 1024, height: 1024, flatten: true });

  // Android adaptive icon foreground — transparent, mark centered inside the
  // 66% safe zone (~676px circle), so we shrink the mark to leave padding.
  const adaptive = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <svg x="172" y="172" width="680" height="680" viewBox="0 0 1024 1024">
    ${iconSvg({ withBackground: false }).match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]}
  </svg>
</svg>`;
  await writeFile(join(assetsDir, 'adaptive-icon.svg'), adaptive, 'utf8');
  await renderSvg(adaptive, join(assetsDir, 'adaptive-icon.png'), { width: 1024, height: 1024 });

  // Splash screen — portrait 1242×2436 (iPhone X+), Expo will downscale per device.
  const splash = splashSvg();
  await writeFile(join(assetsDir, 'splash.svg'), splash, 'utf8');
  await renderSvg(splash, join(assetsDir, 'splash.png'), { flatten: true });

  // Favicon for web — same icon, tiny.
  await renderSvg(icon, join(assetsDir, 'favicon.png'), { width: 64, height: 64, flatten: true });

  console.log('\nDone. Wired into app.json so Expo picks them up on next start.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
