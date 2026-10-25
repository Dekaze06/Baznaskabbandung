const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(SRC, 'layouts'));
ensureDir(path.join(SRC, 'components', 'public'));
ensureDir(path.join(SRC, 'components', 'admin'));
ensureDir(path.join(SRC, 'pages', 'admin'));

const idxHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const admHtml = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');

// Helper to extract between markers
function extractBetween(str, startRe, endRe) {
  const startMatch = str.match(startRe);
  if (!startMatch) return '';
  const startIndex = startMatch.index + startMatch[0].length;
  const rest = str.slice(startIndex);
  const endMatch = rest.match(endRe);
  if (!endMatch) return '';
  return str.slice(startMatch.index, startIndex + endMatch.index + endMatch[0].length);
}

// Helper to extract section by id
function extractSection(html, id) {
  const re = new RegExp(`(<section id="${id}"[\\s\\S]*?<\\/section>\\s*(?=(?:<!-- =====|<\\/main>)))`, 'i');
  const m = html.match(re);
  if (m) return m[1].trim();
  
  // Fallback: search by id until next section or </main>
  const start = html.indexOf(`id="${id}"`);
  if (start === -1) return '';
  const tagStart = html.lastIndexOf('<section', start);
  const nextSection = html.indexOf('<section id="view-', start + 20);
  const mainEnd = html.indexOf('</main>', start);
  const end = nextSection !== -1 && nextSection < mainEnd ? nextSection : mainEnd;
  return html.slice(tagStart, end).trim();
}

console.log('--- Migrating Public Components ---');

// 1. Public Sections
const secTransparansi = extractSection(idxHtml, 'view-transparansi');
const secKalkulator = extractSection(idxHtml, 'view-kalkulator');
const secMustahik = extractSection(idxHtml, 'view-mustahik');

fs.writeFileSync(path.join(SRC, 'components', 'public', 'BerandaTransparansi.astro'), secTransparansi + '\n');
fs.writeFileSync(path.join(SRC, 'components', 'public', 'KalkulatorZakat.astro'), secKalkulator + '\n');
fs.writeFileSync(path.join(SRC, 'components', 'public', 'LayananMustahik.astro'), secMustahik + '\n');
console.log('BerandaTransparansi:', secTransparansi.length, 'bytes');
console.log('KalkulatorZakat:', secKalkulator.length, 'bytes');
console.log('LayananMustahik:', secMustahik.length, 'bytes');

// 2. Public Header
const pubHeaderMatch = idxHtml.match(/<!-- =+ HEADER PUBLIK PORTAL =+ -->([\s\S]*?)<\/header>/i);
const pubHeaderHtml = pubHeaderMatch ? pubHeaderMatch[0].trim() : '';
fs.writeFileSync(path.join(SRC, 'components', 'public', 'PublicHeader.astro'), pubHeaderHtml + '\n');
console.log('PublicHeader:', pubHeaderHtml.length, 'bytes');

// 3. Public Footer
const pubFooterMatch = idxHtml.match(/<!-- Master Public Footer -->([\s\S]*?)<\/footer>/i);
const pubFooterHtml = pubFooterMatch ? pubFooterMatch[0].trim() : '';
fs.writeFileSync(path.join(SRC, 'components', 'public', 'PublicFooter.astro'), pubFooterHtml + '\n');
console.log('PublicFooter:', pubFooterHtml.length, 'bytes');

// 4. Public Modals & Toast
const pubFooterEnd = idxHtml.lastIndexOf('</footer>');
const pubScriptStart = idxHtml.indexOf('<script', pubFooterEnd);
const pubModalsHtml = idxHtml.slice(pubFooterEnd + '</footer>'.length, pubScriptStart).trim();
fs.writeFileSync(path.join(SRC, 'components', 'public', 'PublicModals.astro'), pubModalsHtml + '\n');
console.log('PublicModals:', pubModalsHtml.length, 'bytes');

// 5. Public Layout
// Extract head content of index.html
const pubHeadMatch = idxHtml.match(/<head>([\s\S]*?)<\/head>/i);
let pubHeadInner = pubHeadMatch ? pubHeadMatch[1].trim() : '';
// Remove static title and description so they can be dynamic props
pubHeadInner = pubHeadInner.replace(/<title>[\s\S]*?<\/title>/i, '');
pubHeadInner = pubHeadInner.replace(/<meta name="description"[\s\S]*?\/>/i, '');

const publicLayoutAstro = `---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = "BAZNAS Kabupaten Bandung - Portal Layanan Publik & Transparansi ZIS",
  description = "Portal resmi BAZNAS Kabupaten Bandung: Program ZIS, Campaign Kemanusiaan, Layanan Pengajuan Bantuan NIK, Kolaborasi Mitra, Kantor Layanan, Kalkulator Zakat, Dashboard Penghimpunan & Penyaluran, Berita, dan Profil Lembaga."
} = Astro.props;

import PublicHeader from '../components/public/PublicHeader.astro';
import PublicFooter from '../components/public/PublicFooter.astro';
import PublicModals from '../components/public/PublicModals.astro';
---

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
  <meta name="description" content={description}/>

  ${pubHeadInner}
</head>
<body class="bg-[#f4f4f5] text-[#18181b] min-h-screen selection:bg-[#064e3b] selection:text-white flex flex-col">
  <PublicHeader />

  <slot />

  <PublicFooter />

  <PublicModals />

  <script src="../public.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(SRC, 'layouts', 'PublicLayout.astro'), publicLayoutAstro);
console.log('PublicLayout.astro created');

console.log('--- Migrating Admin Components ---');

// 6. Admin Sections
const secCmdCenter = extractSection(admHtml, 'view-command-center');
const secAsesmen = extractSection(admHtml, 'view-asesmen');
const secKeuangan = extractSection(admHtml, 'view-keuangan');
const secUpz = extractSection(admHtml, 'view-upz');

fs.writeFileSync(path.join(SRC, 'components', 'admin', 'CommandCenterView.astro'), secCmdCenter + '\n');
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'AsesmenLapanganView.astro'), secAsesmen + '\n');
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'KeuanganPsakView.astro'), secKeuangan + '\n');
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'UpzDaerahView.astro'), secUpz + '\n');
console.log('CommandCenterView:', secCmdCenter.length, 'bytes');
console.log('AsesmenLapanganView:', secAsesmen.length, 'bytes');
console.log('KeuanganPsakView:', secKeuangan.length, 'bytes');
console.log('UpzDaerahView:', secUpz.length, 'bytes');

// 7. Admin Sidebar
const admSidebarMatch = admHtml.match(/<!-- =+ SIDEBAR ADMIN[\s\S]*?<\/aside>/i);
const admSidebarHtml = admSidebarMatch ? admSidebarMatch[0].trim() : '';
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'AdminSidebar.astro'), admSidebarHtml + '\n');
console.log('AdminSidebar:', admSidebarHtml.length, 'bytes');

// 8. Admin Header
const admHeaderMatch = admHtml.match(/<header[\s\S]*?<\/header>/i);
const admHeaderHtml = admHeaderMatch ? admHeaderMatch[0].trim() : '';
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'AdminHeader.astro'), admHeaderHtml + '\n');
console.log('AdminHeader:', admHeaderHtml.length, 'bytes');

// 9. Admin Footer
const admFooterMatch = admHtml.match(/<!-- Master Admin Footer -->([\s\S]*?)<\/footer>/i);
const admFooterHtml = admFooterMatch ? admFooterMatch[0].trim() : '';
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'AdminFooter.astro'), admFooterHtml + '\n');
console.log('AdminFooter:', admFooterHtml.length, 'bytes');

// 10. Admin Modals & Toast
const startAdmModals = admHtml.indexOf('<!-- Toast Notification Shell -->');
const endAdmModals = admHtml.indexOf('<script', startAdmModals);
const admModalsHtml = admHtml.slice(startAdmModals, endAdmModals).trim();
fs.writeFileSync(path.join(SRC, 'components', 'admin', 'AdminModals.astro'), admModalsHtml + '\n');
console.log('AdminModals:', admModalsHtml.length, 'bytes');

// 11. Admin Layout
const admHeadMatch = admHtml.match(/<head>([\s\S]*?)<\/head>/i);
let admHeadInner = admHeadMatch ? admHeadMatch[1].trim() : '';
admHeadInner = admHeadInner.replace(/<title>[\s\S]*?<\/title>/i, '');
admHeadInner = admHeadInner.replace(/<meta name="description"[\s\S]*?\/>/i, '');

const adminLayoutAstro = `---
interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Panel Admin BAZNAS Kabupaten Bandung - Amanah Civic Governance SaaS",
  description = "Panel Admin & Backoffice SaaS BAZNAS Kabupaten Bandung: Executive Command Center, verifikasi asesmen lapangan Had Kifayah, buku besar PSAK 109 & SIMBA RI, serta manajemen UPZ 31 Kecamatan."
} = Astro.props;

import AdminSidebar from '../components/admin/AdminSidebar.astro';
import AdminHeader from '../components/admin/AdminHeader.astro';
import AdminFooter from '../components/admin/AdminFooter.astro';
import AdminModals from '../components/admin/AdminModals.astro';
---

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
  <meta name="description" content={description}/>

  ${admHeadInner}
</head>
<body class="bg-[#f4f4f5] text-[#18181b] min-h-screen selection:bg-[#064e3b] selection:text-white flex flex-col">
  <!-- Mobile Backdrop for Sidebar -->
  <div id="app-sidebar-backdrop" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 hidden lg:hidden"></div>

  <AdminSidebar />

  <!-- MAIN WRAPPER (Shifted right for 72 (18rem) on desktop) -->
  <div id="app-main" class="lg:pl-72 flex-1 flex flex-col min-h-screen">
    <AdminHeader />

    <slot />

    <AdminFooter />
  </div>

  <AdminModals />

  <script src="../admin.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(SRC, 'layouts', 'AdminLayout.astro'), adminLayoutAstro);
console.log('AdminLayout.astro created');

// 12. Pages
const indexAstro = `---
import PublicLayout from '../layouts/PublicLayout.astro';
import BerandaTransparansi from '../components/public/BerandaTransparansi.astro';
import KalkulatorZakat from '../components/public/KalkulatorZakat.astro';
import LayananMustahik from '../components/public/LayananMustahik.astro';
---

<PublicLayout>
  <!-- ==================== VIEWS PUBLIK (3 LAYAR) ==================== -->
  <main id="app-views" class="flex-1 min-w-0">
    <BerandaTransparansi />
    <KalkulatorZakat />
    <LayananMustahik />
  </main>
</PublicLayout>
`;
fs.writeFileSync(path.join(SRC, 'pages', 'index.astro'), indexAstro);
console.log('src/pages/index.astro created');

const adminAstro = `---
import AdminLayout from '../layouts/AdminLayout.astro';
import CommandCenterView from '../components/admin/CommandCenterView.astro';
import AsesmenLapanganView from '../components/admin/AsesmenLapanganView.astro';
import KeuanganPsakView from '../components/admin/KeuanganPsakView.astro';
import UpzDaerahView from '../components/admin/UpzDaerahView.astro';
---

<AdminLayout>
  <!-- VIEWS CONTAINER (4 SCREEN OPERASIONAL AMIL) -->
  <main id="app-views" class="relative flex-1 min-w-0">
    <CommandCenterView />
    <AsesmenLapanganView />
    <KeuanganPsakView />
    <UpzDaerahView />
  </main>
</AdminLayout>
`;
fs.writeFileSync(path.join(SRC, 'pages', 'admin.astro'), adminAstro);
console.log('src/pages/admin.astro created');

// Also create src/pages/admin/index.astro for /admin/ subpath routing
const adminIndexAstro = `---
import AdminLayout from '../../layouts/AdminLayout.astro';
import CommandCenterView from '../../components/admin/CommandCenterView.astro';
import AsesmenLapanganView from '../../components/admin/AsesmenLapanganView.astro';
import KeuanganPsakView from '../../components/admin/KeuanganPsakView.astro';
import UpzDaerahView from '../../components/admin/UpzDaerahView.astro';
---

<AdminLayout>
  <!-- VIEWS CONTAINER (4 SCREEN OPERASIONAL AMIL) -->
  <main id="app-views" class="relative flex-1 min-w-0">
    <CommandCenterView />
    <AsesmenLapanganView />
    <KeuanganPsakView />
    <UpzDaerahView />
  </main>
</AdminLayout>
`;
fs.writeFileSync(path.join(SRC, 'pages', 'admin', 'index.astro'), adminIndexAstro);
console.log('src/pages/admin/index.astro created');

// 13. astro.config.mjs
const astroConfig = `import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  redirects: {
    '/admin.html': '/admin'
  }
});
`;
fs.writeFileSync(path.join(ROOT, 'astro.config.mjs'), astroConfig);
console.log('astro.config.mjs created');

console.log('Migration to Astro complete!');
