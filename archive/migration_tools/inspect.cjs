const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const adm = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

function inspect(name, html) {
  console.log('=== ' + name + ' ===');
  const sections = [...html.matchAll(/<section id="(view-[^"]+)"/g)].map(m => m[1]);
  console.log('Sections:', sections);
  const dialogs = [...html.matchAll(/<div[^>]*?(id="[^"]+")[^>]*?(role="dialog"|class="[^"]*modal[^"]*")[^>]*?>/gi)].map(m => m[1]);
  console.log('Dialogs/Modals:', dialogs);
  const toasts = [...html.matchAll(/<div id="([^"]*toast[^"]*)"/gi)].map(m => m[1]);
  console.log('Toasts:', toasts);
}

inspect('index.html', idx);
inspect('admin.html', adm);
