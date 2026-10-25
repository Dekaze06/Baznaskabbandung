/**
 * Menggabungkan 7 layar Stitch (folder screens/) menjadi satu index.html SPA.
 *
 * - Tiap layar menjadi <section class="spa-view"> di dalam shell (tools/shell.html).
 * - Default home = Layar 6: Beranda & Transparansi (Public Landing Page).
 * - Semua link internal/CTA (Hitung Zakat, Lacak Mustahik, Executive Center, dll.)
 *   dipetakan ke route hash yang valid (#transparansi, #kalkulator, #mustahik, dll.).
 * - Token warna Tailwind yang berkonflik di-rename unik per layar (-s1..-s7).
 * - Script asli tiap layar dipakai apa adanya, dibungkus IIFE aman.
 *
 * Jalankan: node tools/merge-screens.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SCREENS_DIR = path.join(ROOT, 'screens');

// Urutan screens: Layar 6 (Beranda Landing Page) dijadikan urutan PERTAMA (Home default)!
const SCREENS = [
  { n: 6, route: 'transparansi', file: '6_beranda_transparansi_db004234a4794ac094f805abff6ca6ba.html' },
  { n: 3, route: 'kalkulator', file: '3_kalkulator_zakat_3befd6d392a545c4bfcb957c718a6f59.html' },
  { n: 2, route: 'mustahik', file: '2_layanan_mustahik_56824cbd3eec482db3659c73d676f754.html' },
  { n: 7, route: 'command-center', file: '7_command_center_c726739a6cfb4ac8a16cfaab65646b50.html' },
  { n: 1, route: 'upz', file: '1_manajemen_upz_daerah_8496f08453d14c3eb294eb654ea05016.html' },
  { n: 5, route: 'keuangan', file: '5_keuangan_psak109_135d93a9121e4079be61764cf82a59b5.html' },
  { n: 4, route: 'asesmen', file: '4_asesmen_lapangan_ac2e09a7958c457b86f0ebfc3a8a6257.html' },
];

// Prefix class Tailwind per kunci theme.extend (untuk rename token yang konflik).
const PREFIXES = {
  colors: 'bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|divide|outline|placeholder|shadow|decoration|accent|caret',
  borderRadius: 'rounded(?:-[trblse]{1,2})?',
  fontFamily: 'font',
  fontSize: 'text',
  boxShadow: 'shadow',
};

const warnings = [];

// ---------- helpers ----------
function readTailwindExtend(html) {
  const m = html.match(/<script[^>]*id="tailwind-config"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return {};
  const sandbox = { tailwind: {} };
  vm.runInNewContext(m[1], sandbox);
  return (sandbox.tailwind.config && sandbox.tailwind.config.theme && sandbox.tailwind.config.theme.extend) || {};
}

/** Pisah CSS menjadi blok top-level {sel, body} dengan pencocokan kurung kurawal. */
function splitCss(css) {
  const out = [];
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    let depth = 1, j = open + 1;
    while (j < css.length && depth) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
      j++;
    }
    out.push({ sel: css.slice(i, open).trim(), body: css.slice(open + 1, j - 1) });
    i = j;
  }
  return out;
}

/** Buang aturan global (html/body/scrollbar) yang akan diatur oleh shell. */
function filterCss(css) {
  return splitCss(css)
    .map(({ sel, body }) => {
      if (sel.startsWith('@')) {
        const inner = filterCss(body);
        return inner.trim() ? `${sel} {\n${inner}\n}` : '';
      }
      if (/(^|[\s,])(html|body)\b|::-webkit-scrollbar/.test(sel)) return '';
      return `${sel} {${body}}`;
    })
    .filter(Boolean)
    .join('\n');
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Memetakan semua href="#" dan data-path di dalam layar menjadi anchor hash riil */
function linkifyContent(html) {
  // Petakan data-path dulu
  html = html.replace(/data-path="executive-command-center"/g, 'href="#command-center" data-route="command-center"');
  html = html.replace(/data-path="asesmen-dan-penyaluran"/g, 'href="#asesmen" data-route="asesmen"');
  html = html.replace(/data-path="keuangan-dan-simba"/g, 'href="#keuangan" data-route="keuangan"');
  html = html.replace(/data-path="manajemen-upz-daerah"/g, 'href="#upz" data-route="upz"');
  html = html.replace(/data-path="beranda-dan-transparansi"/g, 'href="#transparansi" data-route="transparansi"');
  html = html.replace(/data-path="kalkulator-dan-bayar-zis"/g, 'href="#kalkulator" data-route="kalkulator"');
  html = html.replace(/data-path="layanan-mustahik-dan-lacak"/g, 'href="#mustahik" data-route="mustahik"');

  // Petakan link href="#" berdasarkan teks/konteks
  html = html.replace(/<a([^>]*?)href="#"([^>]*?)>([\s\S]*?)<\/a>/gi, (match, pre, post, inner) => {
    const text = inner.toLowerCase();
    let target = '';
    if (text.includes('hitung') || text.includes('kalkulator') || text.includes('bayar zakat')) {
      target = '#kalkulator';
    } else if (text.includes('mustahik') || text.includes('ajukan bantuan') || text.includes('lacak')) {
      target = '#mustahik';
    } else if (text.includes('executive') || text.includes('pimpinan') || text.includes('command')) {
      target = '#command-center';
    } else if (text.includes('asesmen') || text.includes('penyaluran') || text.includes('kifayah')) {
      target = '#asesmen';
    } else if (text.includes('keuangan') || text.includes('psak') || text.includes('akuntansi')) {
      target = '#keuangan';
    } else if (text.includes('upz') || text.includes('unit pengumpul')) {
      target = '#upz';
    } else if (text.includes('beranda') || text.includes('transparansi') || text.includes('home')) {
      target = '#transparansi';
    }

    if (target) {
      return `<a${pre}href="${target}" data-route="${target.slice(1)}"${post}>${inner}</a>`;
    }
    return match;
  });

  return html;
}

// ---------- 1. parse semua layar ----------
const parsed = SCREENS.map((s) => {
  const html = fs.readFileSync(path.join(SCREENS_DIR, s.file), 'utf8');
  const extend = readTailwindExtend(html);

  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');

  const mainMatch = html.match(/<main([^>]*)>([\s\S]*)<\/main>/i);
  if (!mainMatch) throw new Error(`<main> tidak ditemukan di ${s.file}`);
  const mainAttrs = mainMatch[1];
  const mainInner = linkifyContent(mainMatch[2]);

  const afterMain = html.slice(html.lastIndexOf('</main>') + 7);
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*tailwind-config)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean);

  // Sisa markup setelah <main> (modal, toast, footer layar) tanpa script & penutup wrapper/body.
  let extras = afterMain.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<\/body>[\s\S]*$/i, '');
  const opens = (extras.match(/<div\b/gi) || []).length;
  let closes = (extras.match(/<\/div>/gi) || []).length;
  while (closes > opens) {
    extras = extras.replace(/<\/div>(?![\s\S]*<\/div>)/i, '');
    closes--;
  }
  extras = linkifyContent(extras);

  return { ...s, extend, styles, mainAttrs, mainInner, extras: extras.trim(), scripts };
});

// ---------- 2. gabung theme + rename token konflik ----------
const mergedExtend = {};
const renames = {};
SCREENS.forEach((s) => (renames[s.n] = []));

const extendKeys = new Set(parsed.flatMap((p) => Object.keys(p.extend)));
for (const key of extendKeys) {
  const tokens = new Set(parsed.flatMap((p) => Object.keys(p.extend[key] || {})));
  mergedExtend[key] = {};
  for (const token of tokens) {
    const byValue = new Map();
    parsed.forEach((p) => {
      if (!p.extend[key] || !(token in p.extend[key])) return;
      const v = JSON.stringify(p.extend[key][token]);
      if (!byValue.has(v)) byValue.set(v, []);
      byValue.get(v).push(p.n);
    });
    const ranked = [...byValue.entries()].sort((a, b) => b[1].length - a[1].length);
    const [canonVal] = ranked[0];
    mergedExtend[key][token] = JSON.parse(canonVal);

    for (const [val, screens] of ranked.slice(1)) {
      if (!PREFIXES[key]) {
        warnings.push(`Konflik theme.extend.${key}.${token} tidak ditangani (layar ${screens})`);
        continue;
      }
      for (const n of screens) {
        const newToken = `${token}-s${n}`;
        mergedExtend[key][newToken] = JSON.parse(val);
        renames[n].push({ key, token, newToken });
      }
    }
  }
}

function applyRenames(text, n) {
  for (const { key, token, newToken } of renames[n]) {
    const re = new RegExp(`(\\b(?:${PREFIXES[key]})-)${escapeRe(token)}(?=[\\s/"'\`:]|$)`, 'g');
    text = text.replace(re, `$1${newToken}`);
  }
  return text;
}

// ---------- 3. CSS gabungan (dedupe, deteksi konflik selector) ----------
const cssSeen = new Map();
const cssOut = [];
parsed.forEach((p) => {
  const filtered = applyRenames(filterCss(p.styles), p.n);
  splitCss(filtered).forEach(({ sel, body }) => {
    const norm = body.replace(/\s+/g, ' ').trim();
    if (sel.startsWith('@')) {
      const key = `${sel}::${norm}`;
      if (cssSeen.has(key)) return;
      cssSeen.set(key, norm);
      cssOut.push(`/* layar ${p.n} */ ${sel} {${body}}`);
      return;
    }
    if (cssSeen.has(sel)) {
      if (cssSeen.get(sel) !== norm) warnings.push(`CSS selector "${sel}" berbeda antar layar (layar ${p.n} diabaikan)`);
      return;
    }
    cssSeen.set(sel, norm);
    cssOut.push(`/* layar ${p.n} */ ${sel} {${body}}`);
  });
});

// ---------- 4. view + script ----------
const views = parsed
  .map((p, idx) => {
    const cls = (p.mainAttrs.match(/class="([^"]*)"/) || ['', ''])[1];
    return `
<!-- ===== Layar ${p.n}: ${p.route} (${p.file}) ===== -->
<section id="view-${p.route}" class="spa-view${idx === 0 ? '' : ' inactive'}" tabindex="-1" aria-hidden="${idx === 0 ? 'false' : 'true'}">
<div class="${applyRenames(cls, p.n)}">
${applyRenames(p.mainInner, p.n)}
</div>
${applyRenames(p.extras, p.n)}
</section>`;
  })
  .join('\n');

const scripts = parsed
  .filter((p) => p.scripts.length)
  .map((p) => {
    const code = applyRenames(p.scripts.join('\n;\n'), p.n);
    const fnNames = [...new Set([...code.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map((m) => m[1]))];
    const exportsCode = fnNames.map((f) => `if (typeof ${f} === 'function') window.${f} = ${f};`).join('\n  ');
    return `<script>
/* ===== Script asli layar ${p.n} (${p.route}) ===== */
(function () {
${code}
  ${exportsCode}
})();
</script>`;
  })
  .join('\n');

// ---------- 5. isi shell ----------
const shell = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
const twConfig = JSON.stringify(mergedExtend, null, 2);
const out = shell
  .replace('/*TAILWIND_EXTEND*/{}', twConfig)
  .replace('/*SCREEN_STYLES*/', cssOut.join('\n'))
  .replace('<!--VIEWS-->', views)
  .replace('<!--SCREEN_SCRIPTS-->', scripts);

fs.writeFileSync(path.join(ROOT, 'index.html'), out, 'utf8');

// ---------- 6. verifikasi ----------
const ids = [...out.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
if (dupIds.length) warnings.push(`ID duplikat: ${dupIds.join(', ')}`);

const allScriptText = parsed.flatMap((p) => p.scripts).join('\n');
const referenced = [...new Set([...allScriptText.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]))];
const missing = referenced.filter((id) => !ids.includes(id));
if (missing.length) warnings.push(`ID dipakai script tapi tidak ada di DOM: ${missing.join(', ')}`);

console.log(`index.html ditulis (${(out.length / 1024).toFixed(1)} KB), ${parsed.length} layar.`);
Object.entries(renames).forEach(([n, list]) => {
  if (list.length) console.log(`  layar ${n}: rename ${list.map((r) => `${r.token}->${r.newToken}`).join(', ')}`);
});
if (warnings.length) {
  console.log('\nPERINGATAN:');
  warnings.forEach((w) => console.log('  - ' + w));
} else {
  console.log('Tidak ada peringatan. Penggabungan sukses!');
}
