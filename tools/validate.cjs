const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist' && f !== 'archive') walk(full, fileList);
    } else if (f.endsWith('.astro')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const astroFiles = walk(path.join(ROOT, 'src'));
let hasError = false;

for (const filePath of astroFiles) {
  const relPath = path.relative(ROOT, filePath);
  const code = fs.readFileSync(filePath, 'utf8');
  const tags = ['div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'form', 'table', 'tbody', 'thead', 'tr'];
  const diffs = {};
  for (const t of tags) {
    const open = (code.match(new RegExp(`<${t}\\b`, 'gi')) || []).length;
    const close = (code.match(new RegExp(`</${t}>`, 'gi')) || []).length;
    if (open !== close) {
      diffs[t] = { open, close, diff: open - close };
    }
  }
  if (Object.keys(diffs).length > 0) {
    console.log(`[MISMATCH] ${relPath}:`, JSON.stringify(diffs));
    hasError = true;
  } else {
    console.log(`[OK] ${relPath}`);
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log(`\nValidated ${astroFiles.length} Astro files successfully. All HTML tags balanced!`);
}
