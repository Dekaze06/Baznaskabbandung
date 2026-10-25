import { appState } from './state.js';

/**
 * Logika Shell Terpadu BAZNAS Kabupaten Bandung
 * Mengelola router SPA, transisi antara Mode Publik (Landing Page) & Mode Dashboard Amil,
 * navigasi 7 modul, role switcher, dan modal ZIS cepat.
 */

const ROUTES = {
  transparansi: { section: 'Layanan Publik', title: 'Beranda & Transparansi Real-Time', isPublic: true },
  kalkulator: { section: 'Layanan Publik', title: 'Kalkulator & Kasir ZIS', isPublic: true },
  mustahik: { section: 'Layanan Publik', title: 'Layanan & Lacak Mustahik', isPublic: true },
  'command-center': { section: 'Operasional & Pimpinan', title: 'Executive Command Center', isPublic: false },
  asesmen: { section: 'Divisi Pendistribusian', title: 'Asesmen Lapangan & Had Kifayah', isPublic: false },
  keuangan: { section: 'Keuangan & Pelaporan', title: 'Keuangan & Akuntansi PSAK 109', isPublic: false },
  upz: { section: 'Bidang Penghimpunan', title: 'Manajemen UPZ Daerah', isPublic: false },
};

const PUBLIC_ROUTES = new Set(['transparansi', 'kalkulator', 'mustahik']);

// Alias dari atribut data-path bawaan layar Stitch
const ALIASES = {
  'beranda-dan-transparansi': 'transparansi',
  'kalkulator-dan-bayar-zis': 'kalkulator',
  'layanan-mustahik-dan-lacak': 'mustahik',
  'executive-command-center': 'command-center',
  'asesmen-dan-penyaluran': 'asesmen',
  'keuangan-dan-simba': 'keuangan',
  'manajemen-upz-daerah': 'upz',
};

const ROLES = {
  pimpinan: { name: 'Drs. H. M. Yusuf', title: 'Ketua BAZNAS Kab. Bandung', home: 'command-center' },
  keuangan: { name: 'H. Asep Supriatna, S.E., Ak.', title: 'Kabag Keuangan', home: 'keuangan' },
  surveyor: { name: 'Ahmad Fauzi, S.Sos.', title: 'Asesor Pendistribusian', home: 'asesmen' },
  upz: { name: 'Drs. H. Dedi Kusnadi', title: 'Operator UPZ Disdik', home: 'upz' },
  muzaki: { name: 'Muzaki / Donatur Dermawan', title: 'Pengguna Publik', home: 'transparansi' },
};

const $ = (id) => document.getElementById(id);

function resolveRoute(key) {
  if (!key) return null;
  const k = ALIASES[key] || key;
  return ROUTES[k] ? k : null;
}

// ---------------- Toast Global ----------------
export function showAppToast(message, icon = 'check_circle') {
  const toast = $('app-toast');
  if (!toast) return;
  $('app-toast-msg').textContent = message;
  $('app-toast-icon').textContent = icon;
  toast.classList.remove('translate-y-24', 'opacity-0');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3500);
}
window.showAppToast = showAppToast;

// ---------------- Mode Switcher (Publik vs Dashboard Amil) ----------------
function setPublicMode(isPublic) {
  document.body.classList.toggle('public-mode', isPublic);
  appState.set({ isPublicMode: isPublic });
}

// ---------------- Router SPA ----------------
function render(route) {
  const cfg = ROUTES[route] || ROUTES['transparansi'];
  const targetRoute = ROUTES[route] ? route : 'transparansi';

  const apply = () => {
    // 1. Otomatis atur layout: jika route publik -> Mode Publik (full-width), jika route internal -> Mode Dashboard
    setPublicMode(cfg.isPublic);

    // 2. Tampilkan view yang aktif (content-visibility: hidden untuk view non-aktif)
    document.querySelectorAll('.spa-view').forEach((v) => {
      const active = v.id === `view-${targetRoute}`;
      v.classList.toggle('inactive', !active);
      v.setAttribute('aria-hidden', String(!active));
    });

    // 3. Update active nav di sidebar admin
    document.querySelectorAll('.app-nav-item').forEach((a) => {
      const active = a.dataset.route === targetRoute;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // 4. Update active nav di pill menu header publik
    document.querySelectorAll('.pub-nav-item').forEach((a) => {
      const active = a.dataset.route === targetRoute;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // 5. Update judul topbar
    if ($('app-section-name')) $('app-section-name').textContent = cfg.section;
    if ($('app-page-title')) $('app-page-title').textContent = cfg.title;
    document.title = `${cfg.title} - BAZNAS Kabupaten Bandung`;

    // 6. Tutup drawer mobile bila terbuka & scroll ke atas
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'instant' });
    $(`view-${targetRoute}`)?.focus({ preventScroll: true });
  };

  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.startViewTransition(apply);
  } else {
    apply();
  }

  appState.set({ activeRoute: targetRoute });
}

function navigate(key) {
  const route = resolveRoute(key);
  if (!route) return false;
  if (location.hash.slice(1) !== route) {
    location.hash = route; // Memicu hashchange listener -> render
  } else {
    render(route);
  }
  return true;
}

// ---------------- Sidebar Controls ----------------
function openSidebar() {
  $('app-sidebar')?.classList.add('open');
  $('app-sidebar-backdrop')?.classList.remove('hidden');
}

function closeSidebar() {
  $('app-sidebar')?.classList.remove('open');
  $('app-sidebar-backdrop')?.classList.add('hidden');
}

function setRole(key, { goHome = true } = {}) {
  const role = ROLES[key];
  if (!role) return;
  if ($('app-profile-name')) $('app-profile-name').textContent = role.name;
  if ($('app-profile-role')) $('app-profile-role').textContent = role.title;
  if ($('app-role-selector')) $('app-role-selector').value = key;
  appState.set({ activeRole: key });
  if (goHome) navigate(role.home);
}

// ---------------- Modal ZIS Cepat ----------------
function setupQuickZis() {
  const modal = $('app-zis-modal');
  if (!modal) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    $('app-zis-name')?.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  // Trigger dari header admin & header publik
  $('app-btn-quick-zis')?.addEventListener('click', open);
  $('pub-btn-quick-zis')?.addEventListener('click', open);

  // Tombol tutup
  modal.querySelectorAll('[data-close-zis]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => e.target === modal && close());
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());

  // Form submit
  $('app-zis-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = Number($('app-zis-amount').value) || 500000;
    const type = $('app-zis-type').value;
    const name = $('app-zis-name').value || 'Hamba Allah';

    appState.recordPayment(amount, type, name, 'konter');
    close();
    e.target.reset();

    const bsz = `BSZ-3204-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    showAppToast(`Alhamdulillah! e-BSZ ${bsz} terbit: Rp ${amount.toLocaleString('id-ID')} (${name})`, 'verified');
  });
}

// ---------------- Init App ----------------
function init() {
  // Delegasi klik global: setiap link dengan data-route, data-path, atau href="#..."
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-route], [data-path], a[href^="#"]');
    if (!el) return;

    // Abaikan anchor non-navigasi internal
    const href = el.getAttribute('href');
    if (href === '#' && !el.dataset.route && !el.dataset.path) return;

    const key = el.dataset.route || el.dataset.path || (href ? href.slice(1) : null);
    if (key && resolveRoute(key)) {
      e.preventDefault();
      navigate(key);
    }
  });

  // Tombol sidebar mobile
  $('app-btn-open-sidebar')?.addEventListener('click', openSidebar);
  $('app-btn-close-sidebar')?.addEventListener('click', closeSidebar);
  $('app-sidebar-backdrop')?.addEventListener('click', closeSidebar);

  // Tombol ganti mode:
  // 1. Dari Header Publik -> Masuk ke Dashboard Amil (#command-center)
  $('pub-btn-goto-dashboard')?.addEventListener('click', () => {
    navigate('command-center');
    showAppToast('Beralih ke Dashboard Operasional Amil', 'dashboard');
  });

  // 2. Dari Header Admin -> Kembali ke Portal Publik (#transparansi)
  $('app-btn-public-mode')?.addEventListener('click', () => {
    navigate('transparansi');
    showAppToast('Beralih ke Portal Publik & Beranda', 'public');
  });

  // Selector peran di sidebar
  $('app-role-selector')?.addEventListener('change', (e) => setRole(e.target.value));

  // Popover notifikasi
  const notifBtn = $('app-btn-notif');
  const pop = $('app-notif-popover');
  if (notifBtn && pop) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const hidden = pop.classList.toggle('hidden');
      notifBtn.setAttribute('aria-expanded', String(!hidden));
    });
    document.addEventListener('click', (e) => {
      if (!pop.contains(e.target)) {
        pop.classList.add('hidden');
        notifBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Setup modal pembayaran cepat
  setupQuickZis();

  // Load state tersimpan
  const saved = appState.get();
  setRole(saved.activeRole in ROLES ? saved.activeRole : 'pimpinan', { goHome: false });

  // Event listener hash URL
  window.addEventListener('hashchange', () => {
    const r = resolveRoute(location.hash.slice(1));
    if (r) render(r);
  });

  // INITIAL ROUTE: SELALU DEFAULT KE 'transparansi' (Landing Page Beranda) jika hash kosong!
  const initialHash = location.hash.slice(1);
  const initialRoute = resolveRoute(initialHash) || 'transparansi';
  render(initialRoute);

  console.log(`BAZNAS Kabupaten Bandung SaaS Platform siap. Halaman aktif: ${initialRoute}`);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
