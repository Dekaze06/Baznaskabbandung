/**
 * Membangun 2 entry point terpisah:
 * 1. index.html  -> Landing Page & Portal Publik (Screen 6, 3, 2)
 * 2. admin.html  -> Panel Admin & SaaS Backoffice (Screen 7, 4, 5, 1)
 *
 * Jalankan: node tools/build-separated.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SCREENS_DIR = path.join(ROOT, 'screens');

const PUBLIC_SCREENS = [
  { n: 6, route: 'transparansi', file: '6_beranda_transparansi_db004234a4794ac094f805abff6ca6ba.html' },
  { n: 3, route: 'kalkulator', file: '3_kalkulator_zakat_3befd6d392a545c4bfcb957c718a6f59.html' },
  { n: 2, route: 'mustahik', file: '2_layanan_mustahik_56824cbd3eec482db3659c73d676f754.html' },
];

const ADMIN_SCREENS = [
  { n: 7, route: 'command-center', file: '7_command_center_c726739a6cfb4ac8a16cfaab65646b50.html' },
  { n: 4, route: 'asesmen', file: '4_asesmen_lapangan_ac2e09a7958c457b86f0ebfc3a8a6257.html' },
  { n: 5, route: 'keuangan', file: '5_keuangan_psak109_135d93a9121e4079be61764cf82a59b5.html' },
  { n: 1, route: 'upz', file: '1_manajemen_upz_daerah_8496f08453d14c3eb294eb654ea05016.html' },
];

const ALL_SCREENS = [...PUBLIC_SCREENS, ...ADMIN_SCREENS];

const PREFIXES = {
  colors: 'bg|text|border(?:-[trblxy])?|ring|ring-offset|from|via|to|fill|stroke|divide|outline|placeholder|shadow|decoration|accent|caret',
  borderRadius: 'rounded(?:-[trblse]{1,2})?',
  fontFamily: 'font',
  fontSize: 'text',
  boxShadow: 'shadow',
};

function readTailwindExtend(html) {
  const m = html.match(/<script[^>]*id="tailwind-config"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return {};
  const sandbox = { tailwind: {} };
  vm.runInNewContext(m[1], sandbox);
  return (sandbox.tailwind.config && sandbox.tailwind.config.theme && sandbox.tailwind.config.theme.extend) || {};
}

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

function linkifyContent(html, isPublicTarget) {
  if (isPublicTarget) {
    // Mode Publik (index.html):
    // Layanan publik tetap hash link, admin modul diarahkan ke /admin.html#route
    html = html.replace(/data-path="beranda-dan-transparansi"/g, 'href="#transparansi" data-route="transparansi"');
    html = html.replace(/data-path="kalkulator-dan-bayar-zis"/g, 'href="#kalkulator" data-route="kalkulator"');
    html = html.replace(/data-path="layanan-mustahik-dan-lacak"/g, 'href="#mustahik" data-route="mustahik"');

    html = html.replace(/data-path="executive-command-center"/g, 'href="/admin.html#command-center"');
    html = html.replace(/data-path="asesmen-dan-penyaluran"/g, 'href="/admin.html#asesmen"');
    html = html.replace(/data-path="keuangan-dan-simba"/g, 'href="/admin.html#keuangan"');
    html = html.replace(/data-path="manajemen-upz-daerah"/g, 'href="/admin.html#upz"');

    html = html.replace(/<a([^>]*?)href="#"([^>]*?)>([\s\S]*?)<\/a>/gi, (match, pre, post, inner) => {
      const text = inner.toLowerCase();
      let target = '';
      if (text.includes('hitung') || text.includes('kalkulator') || text.includes('bayar zakat')) {
        target = '#kalkulator';
      } else if (text.includes('mustahik') || text.includes('ajukan bantuan') || text.includes('lacak')) {
        target = '#mustahik';
      } else if (text.includes('beranda') || text.includes('transparansi') || text.includes('home')) {
        target = '#transparansi';
      } else if (text.includes('executive') || text.includes('pimpinan') || text.includes('command')) {
        target = '/admin.html#command-center';
      } else if (text.includes('asesmen') || text.includes('penyaluran') || text.includes('kifayah')) {
        target = '/admin.html#asesmen';
      } else if (text.includes('keuangan') || text.includes('psak') || text.includes('akuntansi')) {
        target = '/admin.html#keuangan';
      } else if (text.includes('upz') || text.includes('unit pengumpul')) {
        target = '/admin.html#upz';
      } else if (text.includes('admin') || text.includes('login amil') || text.includes('dashboard amil')) {
        target = '/admin.html';
      }

      if (target) {
        const isInternal = target.startsWith('#');
        return `<a${pre}href="${target}"${isInternal ? ` data-route="${target.slice(1)}"` : ''}${post}>${inner}</a>`;
      }
      return match;
    });
  } else {
    // Mode Admin (admin.html):
    // Modul admin tetap hash link, publik diarahkan ke /index.html#route
    html = html.replace(/data-path="executive-command-center"/g, 'href="#command-center" data-route="command-center"');
    html = html.replace(/data-path="asesmen-dan-penyaluran"/g, 'href="#asesmen" data-route="asesmen"');
    html = html.replace(/data-path="keuangan-dan-simba"/g, 'href="#keuangan" data-route="keuangan"');
    html = html.replace(/data-path="manajemen-upz-daerah"/g, 'href="#upz" data-route="upz"');

    html = html.replace(/data-path="beranda-dan-transparansi"/g, 'href="/index.html#transparansi"');
    html = html.replace(/data-path="kalkulator-dan-bayar-zis"/g, 'href="/index.html#kalkulator"');
    html = html.replace(/data-path="layanan-mustahik-dan-lacak"/g, 'href="/index.html#mustahik"');

    html = html.replace(/<a([^>]*?)href="#"([^>]*?)>([\s\S]*?)<\/a>/gi, (match, pre, post, inner) => {
      const text = inner.toLowerCase();
      let target = '';
      if (text.includes('executive') || text.includes('pimpinan') || text.includes('command')) {
        target = '#command-center';
      } else if (text.includes('asesmen') || text.includes('penyaluran') || text.includes('kifayah')) {
        target = '#asesmen';
      } else if (text.includes('keuangan') || text.includes('psak') || text.includes('akuntansi')) {
        target = '#keuangan';
      } else if (text.includes('upz') || text.includes('unit pengumpul')) {
        target = '#upz';
      } else if (text.includes('hitung') || text.includes('kalkulator') || text.includes('bayar zakat')) {
        target = '/index.html#kalkulator';
      } else if (text.includes('mustahik') || text.includes('ajukan bantuan') || text.includes('lacak')) {
        target = '/index.html#mustahik';
      } else if (text.includes('beranda') || text.includes('transparansi') || text.includes('home') || text.includes('publik')) {
        target = '/index.html#transparansi';
      }

      if (target) {
        const isInternal = target.startsWith('#');
        return `<a${pre}href="${target}"${isInternal ? ` data-route="${target.slice(1)}"` : ''}${post}>${inner}</a>`;
      }
      return match;
    });
  }

  return html;
}

// 1. Parsing semua 7 layar dan cari mapping token Tailwind konflik secara global
const allRaw = ALL_SCREENS.map(s => {
  const html = fs.readFileSync(path.join(SCREENS_DIR, s.file), 'utf8');
  return { ...s, html, extend: readTailwindExtend(html) };
});

const mergedExtend = {};
const renames = {};
ALL_SCREENS.forEach(s => (renames[s.n] = []));

const extendKeys = new Set(allRaw.flatMap(p => Object.keys(p.extend)));
for (const key of extendKeys) {
  const tokens = new Set(allRaw.flatMap(p => Object.keys(p.extend[key] || {})));
  mergedExtend[key] = {};
  for (const token of tokens) {
    const byValue = new Map();
    allRaw.forEach(p => {
      if (!p.extend[key] || !(token in p.extend[key])) return;
      const v = JSON.stringify(p.extend[key][token]);
      if (!byValue.has(v)) byValue.set(v, []);
      byValue.get(v).push(p.n);
    });
    const ranked = [...byValue.entries()].sort((a, b) => b[1].length - a[1].length);
    const [canonVal] = ranked[0];
    mergedExtend[key][token] = JSON.parse(canonVal);

    for (const [val, screens] of ranked.slice(1)) {
      if (!PREFIXES[key]) continue;
      for (const n of screens) {
        const newToken = `${token}-s${n}`;
        mergedExtend[key][newToken] = JSON.parse(val);
        renames[n].push({ key, token, newToken });
      }
    }
  }
}

function applyRenames(text, n) {
  for (const { key, token, newToken } of (renames[n] || [])) {
    const re = new RegExp(`(\\b(?:${PREFIXES[key]})-)${escapeRe(token)}(?=[\\s/"'\`:]|$)`, 'g');
    text = text.replace(re, `$1${newToken}`);
  }
  return text;
}

// Helper untuk membangun HTML bundel
function buildPage({ screens, shellFile, outputFile, isPublic }) {
  const parsed = screens.map(s => {
    const html = fs.readFileSync(path.join(SCREENS_DIR, s.file), 'utf8');
    const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');

    const mainMatch = html.match(/<main([^>]*)>([\s\S]*)<\/main>/i);
    if (!mainMatch) throw new Error(`<main> tidak ditemukan di ${s.file}`);
    const mainAttrs = mainMatch[1];
    let mainInner = linkifyContent(mainMatch[2], isPublic);
    if (s.n === 6) {
      mainInner = mainInner.replace(
        /(<!-- Transparansi Fiskal[^>]*-->\s*<section)\b/i,
        '$1 id="dashboard-penghimpunan"'
      );
      mainInner = mainInner.replace(
        /(<!-- GIS Regional Section[^>]*-->\s*<section)\b/i,
        '$1 id="dashboard-penyaluran"'
      );
      mainInner = mainInner.replace(
        /(<!-- 5 Pilar Program[^>]*-->\s*<section)\b/i,
        '$1 id="program-zis"'
      );
      mainInner = mainInner.replace(
        /(<!-- Verification & Publications Section[^>]*-->\s*<section)\b/i,
        '$1 id="berita"'
      );
    } else if (s.n === 7) {
      mainInner = mainInner.replace(/(<!-- Left Column: Priority Approvals -->\s*<div)\b/i, '$1 id="disposisi-queue"');
      mainInner = mainInner.replace(/(<!-- 31 Kecamatan Radar Overview -->\s*<div)\b/i, '$1 id="radar-wilayah"');
      mainInner = mainInner.replace(/(<!-- Compact SHA-256 Audit Trail -->\s*<div)\b/i, '$1 id="audit-trail-card"');
      mainInner = mainInner.replace(/(<!-- 4 Core Executive Metric Cards[^>]*-->\s*<section)\b/i, '$1 id="rkat-metrics"');
    } else if (s.n === 4) {
      mainInner = mainInner.replace(/(<!-- Card 1: Concise Dossier & Meta[^>]*-->\s*<section)\b/i, '$1 id="dossier-mustahik"');
      mainInner = mainInner.replace(/(<!-- GPS Location Card -->\s*<div)\b/i, '$1 id="gps-geotagging"');
      mainInner = mainInner.replace(/(<!-- Simplified Component Breakdown Table -->\s*<div)\b/i, '$1 id="had-kifayah-table"');
      mainInner = mainInner.replace(/(<!-- Card 4: Simplified CIBEST 4-Quadrant Visual -->\s*<section)\b/i, '$1 id="cibest-model"');
    } else if (s.n === 5) {
      mainInner = mainInner.replace(/(<!-- SECTION 1: FINANCIAL BALANCES - 5 SEGREGATED FUNDS -->\s*<div)\b/i, '$1 id="segregated-funds"');
      mainInner = mainInner.replace(/(<!-- SECTION 2: DISBURSEMENT DISPOSITIONS WAITING FOR BANK TRANSFER -->\s*<div)\b/i, '$1 id="disposisi-transfer"');
      mainInner = mainInner.replace(/(<!-- SECTION 3: PSAK 109 DOUBLE ENTRY JOURNAL -->\s*<div)\b/i, '$1 id="buku-besar-psak"');
      mainInner = mainInner.replace(/(<!-- SECTION 4: REAL TIME BANK RECONCILIATION -->\s*<div)\b/i, '$1 id="rekonsiliasi-bank"');
    } else if (s.n === 1) {
      mainInner = mainInner.replace(/(<!-- 2\. PEMROSESAN SETORAN KOLEKTIF ZIS[^>]*-->\s*<section)\b/i, '$1 id="setoran-kolektif"');
      mainInner = mainInner.replace(/(<!-- Concise Directory Table -->\s*<div)\b/i, '$1 id="direktori-upz"');
      mainInner = mainInner.replace(/(<span class="text-xs font-bold text-fog uppercase tracking-wider">Hak Kelola \/ Bagi Hasil Syar'i<\/span>)/i, '<span id="hak-kelola-amil"></span>$1');
    }
    const afterMain = html.slice(html.lastIndexOf('</main>') + 7);
    const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*tailwind-config)[^>]*>([\s\S]*?)<\/script>/gi)]
      .map(m => m[1].trim())
      .filter(Boolean);

    let extras = afterMain.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<\/body>[\s\S]*$/i, '');
    const opens = (extras.match(/<div\b/gi) || []).length;
    let closes = (extras.match(/<\/div>/gi) || []).length;
    while (closes > opens) {
      extras = extras.replace(/<\/div>(?![\s\S]*<\/div>)/i, '');
      closes--;
    }
    extras = linkifyContent(extras, isPublic);

    return { ...s, styles, mainAttrs, mainInner, extras: extras.trim(), scripts };
  });

  // CSS gabungan
  const cssSeen = new Map();
  const cssOut = [];
  parsed.forEach(p => {
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
      if (cssSeen.has(sel)) return;
      cssSeen.set(sel, norm);
      cssOut.push(`/* layar ${p.n} */ ${sel} {${body}}`);
    });
  });

  // Views markup
  const views = parsed.map((p, idx) => {
    const cls = (p.mainAttrs.match(/class="([^"]*)"/) || ['', ''])[1];
    return `
<!-- ===== Layar ${p.n}: ${p.route} (${p.file}) ===== -->
<section id="view-${p.route}" class="spa-view${idx === 0 ? '' : ' inactive'}" tabindex="-1" aria-hidden="${idx === 0 ? 'false' : 'true'}">
  <div class="${applyRenames(cls, p.n)}">
    ${applyRenames(p.mainInner, p.n)}
  </div>
  ${applyRenames(p.extras, p.n)}
</section>`;
  }).join('\n');

  // Scripts asli layar
  const scriptsMarkup = parsed
    .filter(p => p.scripts.length)
    .map(p => {
      const code = applyRenames(p.scripts.join('\n;\n'), p.n);
      const fnNames = [...new Set([...code.matchAll(/function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1]))];
      const exportsCode = fnNames.map(f => `if (typeof ${f} === 'function') window.${f} = ${f};`).join('\n  ');
      return `<script>
/* ===== Script asli layar ${p.n} (${p.route}) ===== */
(function () {
${code}
  ${exportsCode}
})();
</script>`;
    }).join('\n');

  const shellTemplate = fs.readFileSync(path.join(ROOT, shellFile), 'utf8');
  const twConfig = JSON.stringify(mergedExtend, null, 2);

  const finalHtml = shellTemplate
    .replace('/*TAILWIND_EXTEND*/{}', twConfig)
    .replace('/*SCREEN_STYLES*/', cssOut.join('\n'))
    .replace('<!--VIEWS-->', views)
    .replace('<!--SCREEN_SCRIPTS-->', scriptsMarkup);

  fs.writeFileSync(path.join(ROOT, outputFile), finalHtml, 'utf8');
  console.log(`[OK] ${outputFile} dibuat (${(finalHtml.length / 1024).toFixed(1)} KB) dengan ${parsed.length} layar: ${parsed.map(p => p.route).join(', ')}`);
}

// 2. Bangun index.html (Publik)
buildPage({
  screens: PUBLIC_SCREENS,
  shellFile: 'tools/public-shell.html',
  outputFile: 'index.html',
  isPublic: true,
});

// 3. Bangun admin.html (Admin)
buildPage({
  screens: ADMIN_SCREENS,
  shellFile: 'tools/admin-shell.html',
  outputFile: 'admin.html',
  isPublic: false,
});

console.log('Pemisahan Landing Page & Panel Admin selesai!');
