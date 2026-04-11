/**
 * Reproducible font subset pipeline for Story 1.3.
 *
 * Downloads the current Google Fonts `latin` variable WOFF2 subsets for
 * Inter and Plus Jakarta Sans, then re-subsets them (via HarfBuzz through
 * `subset-font`) to a narrow Latin + common-accent glyph set that covers
 * EN / FR / DE copy. Output lands in `public/fonts/` at stable, non-hashed
 * URLs so we can preload them from `<head>` (AC2 / NFR3).
 *
 * Usage (one-off, not part of the regular build):
 *   npm install --no-save subset-font
 *   node scripts/subset-fonts.mjs
 *
 * We intentionally do NOT wire this into `npm run build`:
 *   1. The fonts rarely change — running subsetting on every build is waste.
 *   2. `subset-font` pulls in a ~25MB HarfBuzz WASM blob we don't want in
 *      production dependencies. Keep it `npm install --no-save` only.
 *
 * If the subset needs to change (extra glyphs, new weights, new scripts),
 * edit the `ranges` table below, re-run this script, and commit both the
 * updated `.woff2` files and the README "Self-hosted fonts" row.
 */
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  let subsetFontMod;
  try {
    subsetFontMod = await import('subset-font');
  } catch {
    console.error(
      '`subset-font` is not installed. Run `npm install --no-save subset-font` first.'
    );
    process.exit(1);
  }
  const subsetFont = subsetFontMod.default || subsetFontMod;

  const repoRoot = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '..'
  );
  const outDir = path.join(repoRoot, 'public', 'fonts');
  fs.mkdirSync(outDir, { recursive: true });

  // Google Fonts' already-weight-variable `latin` subsets. We start from these
  // because Google has already stripped most of the alternates and feature
  // tables that bloat the upstream rsms/inter and tokotype/PlusJakartaSans
  // files, giving a much smaller starting point for re-subsetting.
  const sources = [
    {
      label: 'Inter',
      url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2',
      out: path.join(outDir, 'inter-variable.woff2'),
    },
    {
      label: 'Plus Jakarta Sans',
      url: 'https://fonts.gstatic.com/s/plusjakartasans/v12/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko20yw.woff2',
      out: path.join(outDir, 'plus-jakarta-sans-variable.woff2'),
    },
  ];

  // Glyph set — narrow enough to hit ~30KB per file while still covering
  // English, French, German, and the punctuation/currency we actually use.
  // Re-subsetting from GF's `latin` subset means the only glyphs actually
  // present in the source are Latin-1 Supplement and common punctuation
  // anyway, so this mostly acts as a guard against future source drift.
  const ranges = [
    [0x0020, 0x007e], // Basic Latin (printable ASCII)
    [0x00a0, 0x00ff], // Latin-1 Supplement (covers French + German)
    [0x0131, 0x0131], // ı dotless i
    [0x0152, 0x0153], // Œ œ
    [0x0160, 0x0161], // Š š
    [0x0178, 0x0178], // Ÿ
    [0x017d, 0x017e], // Ž ž
    [0x2013, 0x2014], // – —
    [0x2018, 0x201a], // ' ' ‚
    [0x201c, 0x201e], // " " „
    [0x2020, 0x2022], // † ‡ •
    [0x2026, 0x2026], // …
    [0x2030, 0x2030], // ‰
    [0x2039, 0x203a], // ‹ ›
    [0x20ac, 0x20ac], // €
    [0x2122, 0x2122], // ™
    [0x2190, 0x2193], // ← ↑ → ↓
    [0x2212, 0x2212], // minus
  ];

  let text = '';
  for (const [lo, hi] of ranges) {
    for (let i = lo; i <= hi; i++) text += String.fromCodePoint(i);
  }

  for (const source of sources) {
    console.log(`Fetching ${source.label} from ${source.url}`);
    const res = await fetch(source.url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${res.status}`);
    }
    const inBuf = Buffer.from(await res.arrayBuffer());
    const outBuf = await subsetFont(inBuf, text, {
      targetFormat: 'woff2',
      variationAxes: { wght: { min: 400, max: 800 } },
    });
    fs.writeFileSync(source.out, outBuf);
    console.log(
      `  → ${path.relative(repoRoot, source.out)}  ${inBuf.length} → ${outBuf.length} bytes`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
