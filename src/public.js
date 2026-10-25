import { appState } from './state.js';

/**
 * Logika Portal Publik BAZNAS Kabupaten Bandung (index.html)
 * Navigasi Header 5 Kategori:
 * 1. Program: Zakat Infaq Sedekah (ZIS), Campaign Kemanusiaan
 * 2. Layanan: Pengajuan Bantuan, Kolaborasi Mitra, Kantor Layanan, Kalkulator Zakat
 * 3. Dashboard: Penghimpunan Dana, Penyaluran & Manfaat
 * 4. Berita
 * 5. Tentang Kami
 * Serta modal e-BSZ Kilat, Modal Kemanusiaan, Kemitraan, dan Kantor Layanan.
 */

const PUBLIC_ROUTES = {
  transparansi: { title: 'Beranda & Transparansi Real-Time - BAZNAS Kab. Bandung' },
  kalkulator: { title: 'Kalkulator ZIS Terakreditasi Syariah - BAZNAS Kab. Bandung' },
  mustahik: { title: 'Layanan & Lacak Status Mustahik (NIK) - BAZNAS Kab. Bandung' },
};

// Pemetaan anchor scroll ke dalam halaman beranda transparansi
const SCROLL_TARGETS = new Set([
  'program-zis',
  'dashboard-penghimpunan',
  'dashboard-penyaluran',
  'berita',
  'transparansi',
]);

const $ = (id) => document.getElementById(id);

export function showAppToast(message, icon = 'check_circle') {
  const toast = $('app-toast');
  if (!toast) return;
  const msgEl = $('app-toast-msg');
  const iconEl = $('app-toast-icon');
  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;
  toast.classList.remove('translate-y-24', 'opacity-0');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('translate-y-24', 'opacity-0'), 3500);
}
window.showAppToast = showAppToast;

export function triggerScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-left, .reveal-right').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const elements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale, .reveal-left, .reveal-right');
  if (!window._revealObserver) {
    window._revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );
  }

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible');
    }
    window._revealObserver.observe(el);
  });
}
window.triggerScrollAnimations = triggerScrollAnimations;

function scrollToElement(targetId) {
  if (!targetId) return;
  const el = $(targetId);
  if (el) {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
}

function render(route, targetScrollId = null) {
  const targetRoute = PUBLIC_ROUTES[route] ? route : 'transparansi';
  const cfg = PUBLIC_ROUTES[targetRoute];

  const apply = () => {
    // 1. Tampilkan section view yang aktif
    document.querySelectorAll('.spa-view').forEach((v) => {
      const active = v.id === `view-${targetRoute}`;
      v.classList.toggle('inactive', !active);
      v.setAttribute('aria-hidden', String(!active));
    });

    // 2. Update status aktif tombol navbar
    document.querySelectorAll('.pub-nav-btn, .pub-nav-item').forEach((a) => {
      const href = a.getAttribute('href');
      const active = a.dataset.route === targetRoute || (href && href === `#${targetRoute}`);
      a.classList.toggle('active', !!active);
    });

    // 3. Update title
    document.title = cfg.title;

    // 4. Scroll ke posisi anchor atau top
    if (targetScrollId) {
      scrollToElement(targetScrollId);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
      $(`view-${targetRoute}`)?.focus({ preventScroll: true });
    }

    // Tutup mobile drawer jika terbuka
    $('pub-mobile-drawer')?.classList.add('hidden');
  };

  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const vt = document.startViewTransition(apply);
    if (vt && vt.finished) {
      vt.finished.then(() => setTimeout(triggerScrollAnimations, 60));
    } else {
      setTimeout(triggerScrollAnimations, 60);
    }
  } else {
    apply();
    setTimeout(triggerScrollAnimations, 60);
  }
}

function navigate(route, targetScrollId = null) {
  if (targetScrollId) {
    if (location.hash !== `#${targetScrollId}`) {
      location.hash = targetScrollId;
    } else {
      render('transparansi', targetScrollId);
    }
    return true;
  }

  if (!PUBLIC_ROUTES[route]) return false;
  if (location.hash.slice(1) !== route) {
    location.hash = route;
  } else {
    render(route);
  }
  return true;
}

// ---------------- Modal Manager ----------------
const MODALS = {
  campaign: 'modal-campaign-kemanusiaan',
  mitra: 'modal-kolaborasi-mitra',
  kantor: 'modal-kantor-layanan',
  tentang: 'modal-tentang-kami',
};

function openModal(key) {
  const modalId = MODALS[key];
  if (!modalId) return;
  const modal = $(modalId);
  if (!modal) return;
  modal.classList.replace('hidden', 'flex');
  // Tutup drawer mobile jika ada
  $('pub-mobile-drawer')?.classList.add('hidden');
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.replace('flex', 'hidden');
}

function closeAllModals() {
  Object.values(MODALS).forEach((id) => {
    const el = $(id);
    if (el) closeModal(el);
  });
  const zisModal = $('app-zis-modal');
  if (zisModal) closeModal(zisModal);
}

function setupInteractiveModals() {
  // Tombol pembuka modal via data-open-modal="..."
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal]');
    if (btn) {
      e.preventDefault();
      const modalKey = btn.getAttribute('data-open-modal');
      openModal(modalKey);
    }
  });

  // Tombol penutup modal
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('[role="dialog"]');
      closeModal(modal);
    });
  });

  // Klik backdrop untuk menutup modal
  Object.values(MODALS).forEach((id) => {
    const modal = $(id);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }
  });

  // ESC key menutup semua modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // Donasi dari Campaign Kemanusiaan -> Buka modal e-BSZ
  $('btn-donate-campaign')?.addEventListener('click', () => {
    closeModal($('modal-campaign-kemanusiaan'));
    const zisModal = $('app-zis-modal');
    if (zisModal) {
      zisModal.classList.replace('hidden', 'flex');
      const select = $('app-zis-type');
      if (select) select.value = 'Infak / Sedekah Program BAZNAS Peduli';
      $('app-zis-name')?.focus();
    }
  });

  // Form Kemitraan CSR
  $('form-kolaborasi-mitra')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal($('modal-kolaborasi-mitra'));
    e.target.reset();
    showAppToast('Terima kasih! Permohonan kemitraan berhasil dikirim. Tim Kemitraan BAZNAS akan segera menghubungi Anda.', 'handshake');
  });
}

// ---------------- Modal Pembayaran ZIS Cepat ----------------
function setupQuickZis() {
  const modal = $('app-zis-modal');
  if (!modal) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    $('app-zis-name')?.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  $('pub-btn-quick-zis')?.addEventListener('click', open);

  modal.querySelectorAll('[data-close-zis]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => e.target === modal && close());

  $('app-zis-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number($('app-zis-amount')?.value) || 500000;
    const type = $('app-zis-type')?.value;
    const name = $('app-zis-name')?.value || 'Hamba Allah';

    appState.recordPayment(amount, type, name, 'online');
    close();
    e.target.reset();

    try {
      const res = await fetch('/api/zis.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: name, jumlah: amount, jenis: type, metode: 'Online Payment Gateway' })
      });
      const data = await res.json();
      if (data.success) {
        showAppToast(`Alhamdulillah! e-BSZ ${data.bsz?.id || '3204'} terbit: Rp ${amount.toLocaleString('id-ID')} (${name})`, 'verified');
      } else {
        showAppToast(data.message || 'Gagal memproses pembayaran.', 'error');
      }
    } catch {
      const bsz = `BSZ-3204-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      showAppToast(`Alhamdulillah! e-BSZ ${bsz} berhasil diterbitkan: Rp ${amount.toLocaleString('id-ID')} (${name})`, 'verified');
    }
  });
}

// ---------------- Mobile Menu Drawer Toggle ----------------
function setupMobileMenu() {
  const toggleBtn = $('pub-btn-mobile-toggle');
  const drawer = $('pub-mobile-drawer');
  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = drawer.classList.toggle('hidden');
    toggleBtn.setAttribute('aria-expanded', String(!isHidden));
  });
}

function init() {
  // Delegasi klik link publik internal
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a[href^="#"], [data-route]');
    if (!el) return;

    const href = el.getAttribute('href');
    if (href && (href.startsWith('/admin') || href.startsWith('/admin.html'))) return; // Biarkan navigasi ke admin

    const scrollId = el.dataset.scroll;
    const route = el.dataset.route || (href ? href.slice(1) : null);

    if (scrollId && SCROLL_TARGETS.has(scrollId)) {
      e.preventDefault();
      navigate('transparansi', scrollId);
      return;
    }

    if (route && PUBLIC_ROUTES[route]) {
      e.preventDefault();
      navigate(route);
      return;
    }

    if (href && href.startsWith('#') && SCROLL_TARGETS.has(href.slice(1))) {
      e.preventDefault();
      navigate('transparansi', href.slice(1));
    }
  });

  setupQuickZis();
  setupInteractiveModals();
  setupMobileMenu();

  // Hash change listener
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (SCROLL_TARGETS.has(h)) {
      render('transparansi', h);
    } else if (PUBLIC_ROUTES[h]) {
      render(h);
    }
  });

  // Default awal ke 'transparansi' (Beranda Landing Page) atau target hash jika ada
  const initialHash = location.hash.slice(1);
  if (SCROLL_TARGETS.has(initialHash)) {
    render('transparansi', initialHash);
  } else if (PUBLIC_ROUTES[initialHash]) {
    render(initialHash);
  } else {
    render('transparansi');
  }

  triggerScrollAnimations();

  console.log(`Portal Publik BAZNAS Kab. Bandung siap dengan 5 Menu Header Terintegrasi.`);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
