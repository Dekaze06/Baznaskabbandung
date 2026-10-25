const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let totalSaved = 0;
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await convertDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
        const baseName = path.basename(entry.name, ext);
        const webpPath = path.join(dirPath, `${baseName}.webp`);

        const originalSize = fs.statSync(fullPath).size;

        await sharp(fullPath)
          .webp({ quality: 84, effort: 5 })
          .toFile(webpPath);

        const newSize = fs.statSync(webpPath).size;
        const saved = originalSize - newSize;
        totalSaved += saved;
        count++;

        const pct = ((saved / originalSize) * 100).toFixed(1);
        console.log(`[CONVERTED] ${entry.name} (${(originalSize / 1024).toFixed(1)} KB) -> ${baseName}.webp (${(newSize / 1024).toFixed(1)} KB) | -${pct}%`);
      }
    }
  }

  return { count, totalSaved };
}

async function main() {
  const imagesDir = path.join(__dirname, '..', 'public', 'images');
  console.log(`Starting WebP conversion in: ${imagesDir}`);
  const result = await convertDirectory(imagesDir);
  console.log(`\nSuccessfully converted ${result.count} images!`);
  console.log(`Total storage/bandwidth saved: ${(result.totalSaved / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(err => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
