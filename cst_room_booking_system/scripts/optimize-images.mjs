// scripts/optimize-images.mjs
//
// Normalizes every raster image under /public so the source file size never
// determines what ships. Resizes anything wider than MAX_WIDTH and re-encodes
// oversized files. Idempotent: files already within limits are skipped, so it
// is safe to run on every dev/build and will NOT progressively degrade quality.
//
// Run manually:  npm run optimize:images
// Runs automatically via the "predev" / "prebuild" hooks in package.json.

import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC_DIR = fileURLToPath(new URL('../public', import.meta.url));

// Tunables — any image breaching either limit gets rewritten.
const MAX_WIDTH = 1920;          // px; downscale anything wider
const MAX_BYTES = 500 * 1024;    // 500 KB; recompress anything heavier
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;          // sharp maps this to a palette/effort heuristic
const WEBP_QUALITY = 80;

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && RASTER_EXT.has(extname(entry.name).toLowerCase())) {
      yield full;
    }
  }
}

function formatBytes(bytes) {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(2)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;
}

async function optimize(file) {
  const { size: originalSize } = await stat(file);
  const input = await readFile(file);
  const image = sharp(input, { failOn: 'none' });
  const meta = await image.metadata();

  const tooWide = (meta.width ?? 0) > MAX_WIDTH;
  const tooHeavy = originalSize > MAX_BYTES;
  if (!tooWide && !tooHeavy) return null; // already web-ready — leave it alone

  let pipeline = image.rotate(); // respect EXIF orientation, then strip metadata
  if (tooWide) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const ext = extname(file).toLowerCase();
  if (ext === '.png') {
    pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }

  const output = await pipeline.toBuffer();

  // Guard: never write a result that's larger than the original.
  if (output.length >= originalSize && !tooWide) return null;

  await writeFile(file, output);
  return { originalSize, newSize: output.length };
}

async function main() {
  let scanned = 0;
  let changed = 0;
  let saved = 0;

  for await (const file of walk(PUBLIC_DIR)) {
    scanned++;
    try {
      const result = await optimize(file);
      if (result) {
        changed++;
        saved += result.originalSize - result.newSize;
        const rel = file.slice(PUBLIC_DIR.length + 1).replace(/\\/g, '/');
        console.log(
          `  ✓ ${rel}: ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)}`
        );
      }
    } catch (err) {
      console.warn(`  ! skipped ${file}: ${err.message}`);
    }
  }

  console.log(
    `\nimage-optimize: scanned ${scanned}, optimized ${changed}, saved ${formatBytes(saved)}.`
  );
}

main().catch((err) => {
  console.error('image-optimize failed:', err);
  process.exit(1);
});