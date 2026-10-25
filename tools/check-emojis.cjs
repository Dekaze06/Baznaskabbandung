const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') walk(full, fileList);
    } else if (f.endsWith('.astro') || f.endsWith('.js') || f.endsWith('.mjs')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const files = walk(path.join(ROOT, 'src'));
let found = false;
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  if (emojiRegex.test(txt)) {
    console.log(`[EMOJI FOUND] in ${f}`);
    found = true;
  }
}
if (!found) {
  console.log('Zero-Emoji Policy verified: 100% clean of emoticons across all Astro files!');
}
