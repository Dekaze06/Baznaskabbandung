const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const file = path.join(ROOT, 'src/components/admin/KeuanganPsakView.astro');
const content = fs.readFileSync(file, 'utf8');

// Trace opening and closing div tags with line numbers
const lines = content.split('\n');
const stack = [];

lines.forEach((line, lineIdx) => {
  const lineNum = lineIdx + 1;
  // Match tags on this line
  const tagRe = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g;
  let match;
  while ((match = tagRe.exec(line)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    if (tagName !== 'div') continue;
    if (fullTag.endsWith('/>')) continue;

    if (fullTag.startsWith('</')) {
      if (stack.length === 0) {
        console.log(`Extra close </div> at line ${lineNum}: ${line.trim()}`);
      } else {
        stack.pop();
      }
    } else {
      stack.push({ lineNum, line: line.trim() });
    }
  }
});

console.log('Unclosed divs count:', stack.length);
stack.forEach(item => {
  console.log(`Unclosed <div ...> from line ${item.lineNum}: ${item.line}`);
});
