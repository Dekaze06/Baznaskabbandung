const fs = require('fs');
const path = require('path');

function replaceInDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.astro') || entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.css'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('.jpg') || content.includes('.jpeg')) {
        const updated = content
          .replace(/\/images\/([a-zA-Z0-9_-]+)\.jpg/g, '/images/$1.webp')
          .replace(/\/images\/([a-zA-Z0-9_-]+)\.jpeg/g, '/images/$1.webp');

        if (updated !== content) {
          fs.writeFileSync(fullPath, updated, 'utf8');
          console.log(`[UPDATED REFERENCES] ${path.relative(process.cwd(), fullPath)}`);
        }
      }
    }
  }
}

const srcDir = path.join(__dirname, '..', 'src');
console.log(`Updating image references to .webp in: ${srcDir}`);
replaceInDir(srcDir);
console.log('Finished updating references.');
