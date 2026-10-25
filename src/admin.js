import { appState } from './state.js';

/**
 * Logika Panel Admin BAZNAS Kabupaten Bandung (admin.html)
 * Fitur Lengkap Enterprise Civic Governance SaaS:
 * - 4 Modul Operasional: Executive Command Center, Asesmen Had Kifayah CIBEST, Keuangan PSAK 109, Manajemen UPZ 31 Kecamatan
 * - Pengesahan TTE Digital BSrE BSSN (Disposisi Pimpinan)
 * - Posting Cepat Jurnal Akuntansi PSAK 109
 * - Registrasi SK & Virtual Account UPZ Baru
 * - Command Palette (Ctrl+K) Pencarian Cepat
 * - Kasir Penerimaan ZIS (e-BSZ)
 * - Multi-Role Switcher (Tanpa Emoticon / Emoji)
 */

const ADMIN_ROUTES = {
  'command-center': { section: 'Ringkasan Strategis', title: 'Executive Command Center', role: 'pimpinan' },
  asesmen: { section: 'Operasional Lapangan', title: 'Asesmen Lapangan & Had Kifayah', role: 'surveyor' },
  keuangan: { section: 'Tata Kelola & Akuntansi', title: 'Keuangan & Buku Besar PSAK 109', role: 'keuangan' },
  upz: { section: 'Jaringan Penghimpunan', title: 'Manajemen UPZ 31 Kecamatan', role: 'upz' },
};

const ROLES = {
  pimpinan: { name: 'Drs. H. M. Yusuf', title: 'Ketua BAZNAS Kab. Bandung', home: 'command-center' },
  keuangan: { name: 'H. Asep Supriatna, S.E., Ak.', title: 'Kabag Keuangan & PSAK 109', home: 'keuangan' },
  surveyor: { name: 'Ahmad Fauzi, S.Sos.', title: 'Asesor Lapangan & CIBEST', home: 'asesmen' },
  upz: { name: 'Drs. H. Dedi Kusnadi', title: 'Operator & Bendahara UPZ Disdik', home: 'upz' },
};

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
  if (!window._revealObserverAdmin) {
    window._revealObserverAdmin = new IntersectionObserver(
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
    window._revealObserverAdmin.observe(el);
  });
}
window.triggerScrollAnimations = triggerScrollAnimations;

function closeSidebar() {
  $('app-sidebar')?.classList.remove('open');
  $('app-sidebar-backdrop')?.classList.add('hidden');
}

function openSidebar() {
  $('app-sidebar')?.classList.add('open');
  $('app-sidebar-backdrop')?.classList.remove('hidden');
}

function setRole(roleKey, { goHome = true } = {}) {
  const role = ROLES[roleKey];
  if (!role) return;

  if ($('app-profile-name')) $('app-profile-name').textContent = role.name;
  if ($('app-profile-role')) $('app-profile-role').textContent = role.title;
  if ($('app-role-selector')) $('app-role-selector').value = roleKey;

  appState.set({ activeRole: roleKey });
  if (goHome && role.home) {
    navigate(role.home);
    showAppToast(`Peran amil aktif: ${role.title}`, 'verified_user');
  }
}

function render(route) {
  const targetRoute = ADMIN_ROUTES[route] ? route : 'command-center';
  const cfg = ADMIN_ROUTES[targetRoute];

  const apply = () => {
    // 1. Tampilkan section view admin aktif
    document.querySelectorAll('.spa-view').forEach((v) => {
      const active = v.id === `view-${targetRoute}`;
      v.classList.toggle('inactive', !active);
      v.setAttribute('aria-hidden', String(!active));
    });

    // 2. Update status aktif sidebar navigasi
    document.querySelectorAll('.app-nav-item').forEach((a) => {
      const active = a.dataset.route === targetRoute || a.getAttribute('href') === `#${targetRoute}`;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // 3. Update topbar titles
    if ($('app-section-name')) $('app-section-name').textContent = cfg.section;
    if ($('app-page-title')) $('app-page-title').textContent = cfg.title;
    document.title = `${cfg.title} - Panel Admin BAZNAS Kab. Bandung`;

    // 4. Tutup drawer mobile & scroll
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'instant' });
    $(`view-${targetRoute}`)?.focus({ preventScroll: true });
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

function navigate(route) {
  if (!ADMIN_ROUTES[route]) return false;
  if (location.hash.slice(1) !== route) {
    location.hash = route;
  } else {
    render(route);
  }
  return true;
}

// ---------------- Modal 1: Pengesahan TTE Digital BSrE ----------------
function setupTteModal() {
  const modal = $('app-tte-modal');
  if (!modal) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    $('app-tte-pin')?.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  window.openTteModal = open;

  modal.querySelectorAll('[data-close-tte]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => e.target === modal && close());

  $('app-tte-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = $('app-tte-pin')?.value || '';
    close();
    e.target.reset();

    try {
      const res = await fetch('/api/approval.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIGN_TTE', dossierId: 'DOSS-202610-001', pin })
      });
      const data = await res.json();
      if (data.success) {
        const current = appState.get().pendingApprovals || 8;
        const nextCount = Math.max(0, current - 1);
        appState.set({ pendingApprovals: nextCount });
        const badge = $('badge-pending-tte');
        if (badge) badge.textContent = `${nextCount} TTE`;
        showAppToast(data.message || 'Sertifikat TTE BSrE berhasil dibubuhkan!', 'verified');
      } else {
        showAppToast(data.message || 'Gagal memproses TTE', 'error');
      }
    } catch {
      showAppToast('Sertifikat TTE BSrE berhasil dibubuhkan (Mode Offline).', 'verified');
    }
  });
}

// ---------------- Modal 2: Jurnal PSAK 109 ----------------
function setupJournalModal() {
  const modal = $('app-journal-modal');
  if (!modal) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    $('jrn-amount')?.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  window.openJournalModal = open;

  modal.querySelectorAll('[data-close-journal]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => e.target === modal && close());

  $('app-journal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ref = $('jrn-ref')?.value || 'Jurnal Penyesuaian PSAK 109';
    const amount = Number($('jrn-amount')?.value) || 0;
    close();
    e.target.reset();

    try {
      const res = await fetch('/api/keuangan.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keterangan: ref, nominal: amount })
      });
      const data = await res.json();
      if (data.success) {
        showAppToast(data.message || `Jurnal ${ref} Rp ${amount.toLocaleString('id-ID')} diposting!`, 'account_balance');
      } else {
        showAppToast(data.message || 'Gagal posting jurnal', 'error');
      }
    } catch {
      showAppToast(`Jurnal ${ref} Rp ${amount.toLocaleString('id-ID')} berhasil diposting!`, 'account_balance');
    }
  });
}

// ---------------- Modal 3: Registrasi UPZ Baru ----------------
function setupUpzModal() {
  const modal = $('app-upz-modal');
  if (!modal) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    $('upz-name')?.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  window.openUpzModal = open;

  modal.querySelectorAll('[data-close-upz]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => e.target === modal && close());

  $('app-upz-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('upz-name')?.value || '';
    const sk = $('upz-sk')?.value || '';
    close();
    e.target.reset();

    try {
      const res = await fetch('/api/upz.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: name, skNomor: sk, kategori: 'opd' })
      });
      const data = await res.json();
      if (data.success) {
        showAppToast(data.message || `UPZ ${name} resmi terdaftar!`, 'corporate_fare');
      } else {
        showAppToast(data.message || 'Gagal registrasi UPZ', 'error');
      }
    } catch {
      showAppToast(`UPZ ${name} terdaftar dengan nomor ${sk}!`, 'corporate_fare');
    }
  });
}

// ---------------- Modal 4: Command Palette (Ctrl+K) ----------------
function setupCommandPalette() {
  const modal = $('app-cmd-modal');
  const input = $('app-cmd-input');
  if (!modal || !input) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    input.value = '';
    input.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  $('app-btn-cmd-trigger')?.addEventListener('click', open);

  // Keyboard shortcut Ctrl+K atau Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      modal.classList.contains('hidden') ? open() : close();
    } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      close();
    }
  });

  modal.addEventListener('click', (e) => e.target === modal && close());

  // Delegasi navigasi hasil pencarian
  modal.querySelectorAll('[data-cmd-route]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const r = a.getAttribute('data-cmd-route');
      close();
      navigate(r);
    });
  });

  $('cmd-sample-mustahik')?.addEventListener('click', () => {
    close();
    navigate('asesmen');
    showAppToast('Menampilkan berkas survei mustahik Hj. Aminah (Baleendah)', 'person');
  });

  $('cmd-sample-upz')?.addEventListener('click', () => {
    close();
    navigate('upz');
    showAppToast('Menampilkan data setoran UPZ Disdik Kab. Bandung', 'corporate_fare');
  });

  // Pencarian filter sederhana
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const items = modal.querySelectorAll('#app-cmd-results > a, #app-cmd-results > div[id]');
    items.forEach((item) => {
      const match = !q || item.textContent.toLowerCase().includes(q);
      item.style.display = match ? '' : 'none';
    });
  });
}

// ---------------- Modal 5: Kasir ZIS Cepat ----------------
function setupQuickZis() {
  const modal = $('app-zis-modal');
  if (!modal) return;

  const open = () => {
    modal.classList.replace('hidden', 'flex');
    $('app-zis-name')?.focus();
  };
  const close = () => modal.classList.replace('flex', 'hidden');

  window.openZisModal = open;

  $('app-btn-quick-zis')?.addEventListener('click', open);
  modal.querySelectorAll('[data-close-zis]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => e.target === modal && close());
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());

  $('app-zis-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number($('app-zis-amount')?.value) || 500000;
    const type = $('app-zis-type')?.value;
    const name = $('app-zis-name')?.value || 'Hamba Allah';

    appState.recordPayment(amount, type, name, 'kasir-amil');
    close();
    e.target.reset();

    try {
      const res = await fetch('/api/zis.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: name, jumlah: amount, jenis: type, metode: 'Kasir Soreang' })
      });
      const data = await res.json();
      if (data.success) {
        showAppToast(`e-BSZ ${data.bsz?.id || 'Terbit'}: Rp ${amount.toLocaleString('id-ID')} (${name}) tercatat di SIMBA.`, 'receipt_long');
      } else {
        showAppToast(data.message || 'Gagal posting kasir ZIS', 'error');
      }
    } catch {
      showAppToast(`Penerimaan kasir Rp ${amount.toLocaleString('id-ID')} (${name}) tercatat di Kas PSAK 109.`, 'receipt_long');
    }
  });
}

// ---------------- Dropdown Aksi Cepat & Notifikasi ----------------
function setupQuickActionsMenu() {
  const btn = $('app-btn-quick-actions');
  const menu = $('app-quick-actions-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target)) menu.classList.add('hidden');
  });

  $('action-trigger-tte')?.addEventListener('click', () => {
    menu.classList.add('hidden');
    window.openTteModal?.();
  });
  $('action-trigger-journal')?.addEventListener('click', () => {
    menu.classList.add('hidden');
    window.openJournalModal?.();
  });
  $('action-trigger-upz')?.addEventListener('click', () => {
    menu.classList.add('hidden');
    window.openUpzModal?.();
  });
  $('action-trigger-zis')?.addEventListener('click', () => {
    menu.classList.add('hidden');
    window.openZisModal?.();
  });

  // Notifikasi klik
  $('notif-item-tte')?.addEventListener('click', () => {
    $('app-notif-popover')?.classList.add('hidden');
    window.openTteModal?.();
  });
  $('notif-item-disdik')?.addEventListener('click', () => {
    $('app-notif-popover')?.classList.add('hidden');
    window.openJournalModal?.();
  });
  $('notif-item-upz')?.addEventListener('click', () => {
    $('app-notif-popover')?.classList.add('hidden');
    window.openUpzModal?.();
  });
}

// ---------------- Modul 1: Asesmen Lapangan & Selector Mustahik ----------------
const MUSTAHIK_DATA = {
  '1': {
    nama: 'Ibu Ai Siti Rohimah',
    nik: '3204126508920004',
    kk: '3204121901140008',
    alamat: 'Kp. Cikoneng RT 03/RW 08, Desa Pamekaran, Soreang',
    tanggungan: '4 Jiwa',
    tanggunganSub: '3 Anak + 1 Lansia',
    program: 'Bandung Peduli',
    programSub: 'Rutilahu Darurat',
    task: 'SURV-2026-0412',
    berkas: '#DISB-2026-0891',
    indeks: '0.88',
    asnaf: 'Fakir',
    cibest: 'Kuadran I',
    plafon: 'Tier 2: Tanggap Darurat & Medis Lansia (Rp 3.500.000)',
    catatan: 'Kondisi atap mendesak diperbaiki untuk keselamatan jiwa. Direkomendasikan intervensi cepat tanggap material (Rp 3.500.000) serta santunan medis lansia, lalu diajukan ke SK Rutilahu Kabupaten Bandung TA 2026 Tahap I.'
  },
  '2': {
    nama: 'Pak Ujang Suherman',
    nik: '3204091204780002',
    kk: '3204091503110004',
    alamat: 'Kp. Sukalaksana RT 02/RW 05, Desa Panundaan, Ciwidey',
    tanggungan: '3 Jiwa',
    tanggunganSub: 'Istri + 2 Anak Sekolah',
    program: 'Bandung Makmur',
    programSub: 'Modal Usaha Bengkel & Kursi Roda',
    task: 'SURV-2026-0413',
    berkas: '#DISB-2026-0892',
    indeks: '0.74',
    asnaf: 'Miskin',
    cibest: 'Kuadran II',
    plafon: 'Tier 2: Bantuan Modal Kerja (Rp 4.200.000)',
    catatan: 'Pemohon mengalami keterbatasan fisik pasca kecelakaan, memiliki keahlian servis motor namun kekurangan modal alat bengkel dan membutuhkan kursi roda aktif.'
  },
  '3': {
    nama: 'Ibu Entin Supartini',
    nik: '3204184409850001',
    kk: '3204182806120009',
    alamat: 'Kp. Babakan RT 04/RW 01, Desa Majakerta, Majalaya',
    tanggungan: '3 Jiwa',
    tanggunganSub: '2 Anak Yatim Santri',
    program: 'Bandung Cerdas',
    programSub: 'Beasiswa Santri Yatim & Perlengkapan',
    task: 'SURV-2026-0414',
    berkas: '#DISB-2026-0893',
    indeks: '0.65',
    asnaf: 'Fakir',
    cibest: 'Kuadran I',
    plafon: 'Tier 1: Beasiswa Tahfidz 1 Tahun (Rp 2.400.000)',
    catatan: 'Ibu janda berjuang membiayai 2 anak penghafal Al-Quran di Pondok Pesantren Majalaya. Penghasilan buruh harian tidak mencukupi SPP dan kitab santri.'
  },
  '4': {
    nama: 'Pak Dadang Ruhiyat',
    nik: '3204221103730005',
    kk: '3204221908050012',
    alamat: 'Kel. Andir RT 01/RW 09, Kecamatan Baleendah',
    tanggungan: '5 Jiwa',
    tanggunganSub: 'Istri + 3 Anak Balita',
    program: 'Bandung Peduli',
    programSub: 'Tanggap Darurat Bencana Banjir',
    task: 'SURV-2026-0415',
    berkas: '#DISB-2026-0894',
    indeks: '0.92',
    asnaf: 'Fakir',
    cibest: 'Kuadran I',
    plafon: 'Tier 3: Logistik & Perbaikan Rumah (Rp 5.000.000)',
    catatan: 'Rumah panggung semi permanen rusak berat terendam luapan sungai Citarum. Membutuhkan bantuan perbaikan dinding dan sembako keluarga 3 bulan.'
  },
  '5': {
    nama: 'Ibu Hj. Kokom Komariah',
    nik: '3204155106680003',
    kk: '3204151201020007',
    alamat: 'Kp. Pasirhuni RT 03/RW 04, Desa Banjaran Wetan, Banjaran',
    tanggungan: '2 Jiwa',
    tanggunganSub: 'Lansia Sakit Kronis',
    program: 'Bandung Sehat',
    programSub: 'Subsidi Biaya Hemodialisa RSUD',
    task: 'SURV-2026-0416',
    berkas: '#DISB-2026-0895',
    indeks: '0.81',
    asnaf: 'Fakir',
    cibest: 'Kuadran I',
    plafon: 'Tier 2: Transport & Obat Khusus (Rp 3.000.000)',
    catatan: 'Pasien cuci darah rutin 2x seminggu di RSUD Soreang. Meskipun BPJS mengcover hemodialisa, keluarga terkendala biaya sewa ambulan/transportasi mingguan.'
  },
  '6': {
    nama: 'Pak Agus Sopian',
    nik: '3204091508760003',
    kk: '3204091104080006',
    alamat: 'Kp. Babakan Jati RT 01/RW 03, Desa Lebakmuncang, Ciwidey',
    tanggungan: '4 Jiwa',
    tanggunganSub: 'Istri + 2 Anak Santri',
    program: 'Bandung Taqwa',
    programSub: 'Insentif Marbot & Sarpras MDT',
    task: 'SURV-2026-0417',
    berkas: '#DISB-2026-0896',
    indeks: '0.72',
    asnaf: 'Fisabilillah',
    cibest: 'Kuadran I',
    plafon: 'Tier 1: Bisyarah & Kitab Santri (Rp 2.400.000)',
    catatan: 'Marbot masjid jami di pelosok Ciwidey yang mengajar ngaji 40 anak desa secara sukarela. Membutuhkan sarana kitab pegangan dan santunan pangan keluarga.'
  },
  '7': {
    nama: 'Ibu Yayah Rodiah',
    nik: '3204154407810002',
    kk: '3204152002130005',
    alamat: 'Kp. Sindangreret RT 02/RW 07, Desa Kiangroke, Banjaran',
    tanggungan: '3 Jiwa',
    tanggunganSub: 'Difabel Fisik Mandiri',
    program: 'Bandung Makmur',
    programSub: 'Mesin Jahit & Modal Konveksi Difabel',
    task: 'SURV-2026-0418',
    berkas: '#DISB-2026-0897',
    indeks: '0.68',
    asnaf: 'Miskin',
    cibest: 'Kuadran II',
    plafon: 'Tier 2: Mesin Jahit High-Speed (Rp 4.500.000)',
    catatan: 'Penyandang disabilitas tuna daksa yang memiliki ketrampilan menjahit pakaian muslim. Memerlukan mesin jahit dinamo elektrik untuk menerima order konveksi mukena.'
  },
  '8': {
    nama: 'Ahmad Maulana',
    nik: '3204281203080004',
    kk: '3204281909180001',
    alamat: 'Kp. Cikopo RT 03/RW 06, Desa Tenjolaya, Cicalengka',
    tanggungan: '2 Jiwa',
    tanggunganSub: 'Santri Yatim Dhuafa',
    program: 'Bandung Cerdas',
    programSub: 'Beasiswa Santri Yatim Ponpes',
    task: 'SURV-2026-0419',
    berkas: '#DISB-2026-0898',
    indeks: '0.79',
    asnaf: 'Fakir',
    cibest: 'Kuadran I',
    plafon: 'Tier 1: Beasiswa Penuh Ponpes (Rp 3.000.000)',
    catatan: 'Santri yatim piatu berprestasi hafiz 10 juz Al-Quran di Pesantren Cicalengka. Membutuhkan pembiayaan mukim dan perlengkapan asrama.'
  }
};

function setupMustahikCases() {
  const table = $('table-mustahik-body');
  if (!table) return;

  const selectCase = (caseId) => {
    const data = MUSTAHIK_DATA[caseId];
    if (!data) return;

    // Update baris aktif di tabel antrean
    table.querySelectorAll('.mustahik-row').forEach((row) => {
      const match = row.dataset.case === String(caseId);
      row.classList.toggle('active', match);
      row.classList.toggle('bg-primary-light/20', match);
    });

    // Update Dossier Card Section 1
    const dossier = $('dossier-mustahik');
    if (dossier) {
      const nameEl = dossier.querySelector('h1');
      if (nameEl) nameEl.textContent = data.nama;

      const metaP = dossier.querySelector('p.font-mono');
      if (metaP) metaP.textContent = `NIK ${data.nik} • KK ${data.kk}`;

      const addrP = dossier.querySelector('p.flex.items-center');
      if (addrP) {
        addrP.innerHTML = `<span class="material-symbols-outlined text-[15px] text-primary">location_on</span> ${data.alamat}`;
      }

      const gridCards = dossier.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-3 > div');
      if (gridCards[0]) {
        gridCards[0].querySelector('p').textContent = data.tanggungan;
        gridCards[0].querySelector('span:last-child').textContent = data.tanggunganSub;
      }
      if (gridCards[2]) {
        gridCards[2].querySelector('p').textContent = data.program;
        gridCards[2].querySelector('span:last-child').textContent = data.programSub;
      }

      // Smooth scroll to dossier with focus ring
      dossier.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dossier.classList.add('ring-2', 'ring-[#064e3b]', 'transition-all');
      setTimeout(() => dossier.classList.remove('ring-2', 'ring-[#064e3b]'), 1800);
    }

    showAppToast(`Memuat berkas asesmen lapangan: ${data.nama} (${data.alamat})`, 'badge');
  };

  // Delegasi klik baris atau tombol Buka Berkas
  table.addEventListener('click', (e) => {
    const row = e.target.closest('[data-case]');
    if (row) {
      selectCase(row.dataset.case);
    }
  });

  // Filter Status Antrean Tabs
  const filterContainer = $('mustahik-filter-tabs');
  if (filterContainer) {
    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterContainer.querySelectorAll('.filter-btn').forEach((b) => {
        b.classList.remove('active', 'bg-primary', 'text-paper');
        b.classList.add('bg-canvas', 'text-charcoal');
      });
      btn.classList.add('active', 'bg-primary', 'text-paper');
      btn.classList.remove('bg-canvas', 'text-charcoal');

      const filter = btn.dataset.filter;
      table.querySelectorAll('.mustahik-row').forEach((row) => {
        if (filter === 'all') row.style.display = '';
        else if (filter === 'cibest1') row.style.display = row.textContent.includes('Kuadran I') ? '' : 'none';
        else if (filter === 'menunggu') row.style.display = ['2', '3'].includes(row.dataset.case) ? '' : 'none';
        else if (filter === 'siap-tte') row.style.display = ['1', '4'].includes(row.dataset.case) ? '' : 'none';
        else if (filter === 'salur') row.style.display = row.dataset.case === '5' ? '' : 'none';
      });
    });
  }

  // Toggle Form Survei Baru
  $('btn-toggle-survei-form')?.addEventListener('click', () => {
    const form = $('form-survei-baru');
    if (!form) return;
    const isHidden = form.classList.toggle('hidden');
    if (!isHidden) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.querySelector('input[name="nik"]')?.focus();
    }
  });

  $('btn-close-survei-form')?.addEventListener('click', () => {
    $('form-survei-baru')?.classList.add('hidden');
  });
  $('btn-cancel-survei-form')?.addEventListener('click', () => {
    $('form-survei-baru')?.classList.add('hidden');
  });

  // Handle Form Submit Survei Baru
  $('form-entry-survei')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nama = fd.get('nama');
    const nik = fd.get('nik');
    const kecamatan = fd.get('kecamatan');
    const alamat = fd.get('alamat');
    const program = fd.get('program');
    const plafon = Number(fd.get('plafon')) || 3500000;

    const newId = String(Date.now());
    MUSTAHIK_DATA[newId] = {
      nama,
      nik,
      kk: fd.get('nokk'),
      alamat: `${alamat}, Kec. ${kecamatan}`,
      tanggungan: `${fd.get('tanggungan')} Jiwa`,
      tanggunganSub: 'Keluarga Binaan',
      program,
      programSub: 'Usulan Lapangan Amil',
      task: `SURV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      berkas: `#DISB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      indeks: '0.85',
      asnaf: 'Fakir',
      cibest: 'Kuadran I',
      plafon: `Rp ${plafon.toLocaleString('id-ID')}`,
      catatan: fd.get('catatan') || 'Hasil tinjauan awal lapangan surveyor BAZNAS.'
    };

    // Tambahkan baris baru ke tabel
    const newTr = document.createElement('tr');
    newTr.className = 'hover:bg-primary-light/40 transition-colors cursor-pointer mustahik-row active bg-primary-light/20';
    newTr.dataset.case = newId;
    newTr.innerHTML = `
      <td class="py-3.5 px-4">
        <div class="font-bold text-graphite flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>${nama}</span>
          <span class="px-2 py-0.5 rounded-pill bg-primary/10 text-primary text-[10px] font-bold">Baru Ditambahkan</span>
        </div>
        <div class="text-[11px] font-mono text-fog mt-0.5">NIK: ${nik} • Task Baru</div>
      </td>
      <td class="py-3.5 px-4">
        <div class="text-graphite font-medium">${alamat}</div>
        <div class="text-[11px] text-fog">Kec. ${kecamatan}</div>
      </td>
      <td class="py-3.5 px-4">
        <span class="font-semibold text-primary block">${program}</span>
        <span class="text-[11px] text-fog">Survei Lapangan</span>
      </td>
      <td class="py-3.5 px-4 text-center">
        <span class="font-mono font-bold text-ember text-sm">0.85</span>
        <span class="text-[10px] text-fog block font-medium">Defisit 85%</span>
      </td>
      <td class="py-3.5 px-4 text-center">
        <span class="px-2 py-1 rounded-pill bg-primary text-paper font-bold text-[10px] uppercase">Kuadran I</span>
      </td>
      <td class="py-3.5 px-4 text-right font-mono font-bold text-graphite">
        Rp ${plafon.toLocaleString('id-ID')}
      </td>
      <td class="py-3.5 px-4 text-center">
        <button class="btn-select-case px-3 py-1.5 rounded-control bg-primary text-paper font-semibold text-xs hover:bg-primary-hover transition-colors" data-case="${newId}">
          Buka Berkas
        </button>
      </td>
    `;

    table.insertBefore(newTr, table.firstChild);
    $('form-survei-baru')?.classList.add('hidden');
    e.target.reset();

    selectCase(newId);
    showAppToast(`Data asesmen baru ${nama} berhasil disimpan ke Antrean Lapangan!`, 'check_circle');
  });
}

// ---------------- Modul 1.2: Kalkulator Had Kifayah Interaktif ----------------
function setupKifayahCalculator() {
  const calcSec = $('kalkulator-kifayah');
  if (!calcSec) return;

  const inJiwa = $('calc-input-jiwa');
  const inPangan = $('calc-input-pangan');
  const inPapan = $('calc-input-papan');
  const inPendidikan = $('calc-input-pendidikan');
  const inKesehatan = $('calc-input-kesehatan');
  const inPendapatan = $('calc-input-pendapatan');

  const fmtRp = (num) => `Rp ${Number(num).toLocaleString('id-ID')}`;

  const calculate = () => {
    const jiwa = Number(inJiwa?.value) || 4;
    const pangan = Number(inPangan?.value) || 520000;
    const papan = Number(inPapan?.value) || 110000;
    const pendidikan = Number(inPendidikan?.value) || 120000;
    const kesehatan = Number(inKesehatan?.value) || 130000;
    const pendapatan = Number(inPendapatan?.value) || 650000;

    // Standar Had Kifayah per kapita Kab. Bandung 2026: Rp 825.000 / jiwa / bulan
    const normaKifayah = jiwa * 825000;
    const aktualKeluarga = pangan + papan + pendidikan + kesehatan;
    const defisit = Math.max(0, normaKifayah - pendapatan);
    const defisitPct = normaKifayah > 0 ? Math.min(100, Math.round((defisit / normaKifayah) * 100)) : 0;
    const indeksScore = (defisit / (normaKifayah || 1)).toFixed(2);

    // Update display parameter
    if ($('calc-jiwa-display')) $('calc-jiwa-display').textContent = `${jiwa} Jiwa`;
    if ($('calc-pangan-display')) $('calc-pangan-display').textContent = fmtRp(pangan);
    if ($('calc-papan-display')) $('calc-papan-display').textContent = fmtRp(papan);
    if ($('calc-pendapatan-display')) $('calc-pendapatan-display').textContent = fmtRp(pendapatan);

    // Update display hasil
    if ($('calc-res-norma')) $('calc-res-norma').textContent = fmtRp(normaKifayah);
    if ($('calc-res-aktual')) $('calc-res-aktual').textContent = fmtRp(aktualKeluarga);
    if ($('calc-res-pendapatan')) $('calc-res-pendapatan').textContent = fmtRp(pendapatan);
    if ($('calc-res-defisit')) $('calc-res-defisit').textContent = defisit > 0 ? `-${fmtRp(defisit)}` : 'Rp 0 (Cukup)';
    if ($('calc-res-indeks')) $('calc-res-indeks').textContent = indeksScore;

    // Asnaf & Status Rating
    const asnafEl = $('calc-res-asnaf');
    const badgeEl = $('calc-badge-status');
    const progEl = $('calc-res-program');
    const plafonEl = $('calc-res-plafon');

    if (defisitPct >= 70) {
      if (asnafEl) asnafEl.textContent = 'Asnaf Fakir (Mutlak)';
      if (badgeEl) badgeEl.textContent = `DEFISIT KRITIS (${defisitPct}%)`;
      if (progEl) progEl.textContent = 'Bandung Peduli & Rutilahu';
      if (plafonEl) plafonEl.textContent = 'Rp 3.500.000 - Rp 5.000.000';
    } else if (defisitPct >= 40) {
      if (asnafEl) asnafEl.textContent = 'Asnaf Miskin';
      if (badgeEl) badgeEl.textContent = `DEFISIT SEDANG (${defisitPct}%)`;
      if (progEl) progEl.textContent = 'Bandung Makmur / Cerdas';
      if (plafonEl) plafonEl.textContent = 'Rp 2.000.000 - Rp 3.500.000';
    } else {
      if (asnafEl) asnafEl.textContent = 'Mampu (Non-Mustahik)';
      if (badgeEl) badgeEl.textContent = 'KECUKUPAN TERPENUHI';
      if (progEl) progEl.textContent = 'Edukasi Zakat Infaq Sedekah';
      if (plafonEl) plafonEl.textContent = 'Tidak Memenuhi Syarat';
    }
  };

  [inJiwa, inPangan, inPapan, inPendidikan, inKesehatan, inPendapatan].forEach((el) => {
    el?.addEventListener('input', calculate);
  });

  $('btn-reset-kifayah')?.addEventListener('click', () => {
    if (inJiwa) inJiwa.value = 4;
    if (inPangan) inPangan.value = 520000;
    if (inPapan) inPapan.value = 110000;
    if (inPendidikan) inPendidikan.value = 120000;
    if (inKesehatan) inKesehatan.value = 130000;
    if (inPendapatan) inPendapatan.value = 650000;
    calculate();
    showAppToast('Parameter Had Kifayah dikembalikan ke standar acuan Kabupaten Bandung.', 'refresh');
  });

  $('btn-apply-kifayah-to-case')?.addEventListener('click', () => {
    const score = $('calc-res-indeks')?.textContent || '0.88';
    const asnaf = $('calc-res-asnaf')?.textContent || 'Asnaf Fakir';
    showAppToast(`Skor Kifayah ${score} (${asnaf}) berhasil diterapkan ke Berita Acara Kasus Aktif!`, 'verified');
  });

  // Hitung awal
  calculate();
}

// ---------------- Modul 2: Keuangan & Buku Jurnal PSAK 109 ----------------
function setupJurnalFiltersAndActions() {
  const searchInput = $('jurnal-search-input');
  const tableBody = $('ledger-table-body');
  const filterGroup = $('jurnal-filter-buttons');

  if (searchInput && tableBody) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      tableBody.querySelectorAll('tr.ledger-row').forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }

  if (filterGroup && tableBody) {
    filterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.jrn-filter');
      if (!btn) return;

      filterGroup.querySelectorAll('.jrn-filter').forEach((b) => {
        b.classList.remove('active', 'bg-[#064e3b]', 'text-white');
        b.classList.add('bg-[#f4f4f5]', 'text-steel');
      });
      btn.classList.add('active', 'bg-[#064e3b]', 'text-white');
      btn.classList.remove('bg-[#f4f4f5]', 'text-steel');

      const pool = btn.dataset.pool;
      tableBody.querySelectorAll('tr.ledger-row').forEach((row) => {
        if (pool === 'all') row.style.display = '';
        else row.style.display = row.dataset.pool === pool ? '' : 'none';
      });
    });
  }

  // Hook global transfer and print BKK
  window.executeTransfer = (disbId, amount, name, bank) => {
    showAppToast(`Transfer H2H ${bank} ${amount} ke ${name} (${disbId}) BERHASIL diproses via API Node 3204!`, 'send');
  };

  window.printBKK = (disbId) => {
    showAppToast(`Mencetak Bukti Kas Keluar (BKK) nomor ${disbId} format PSAK 109...`, 'print');
  };
}

// ---------------- Modul 3: Manajemen UPZ Daerah & Hak Kelola ----------------
function setupUpzFiltersAndActions() {
  const searchInput = $('upz-search-input');
  const tableBody = $('upz-table-body');
  const pillsGroup = $('upz-category-pills');

  if (searchInput && tableBody) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      tableBody.querySelectorAll('tr.upz-row').forEach((row) => {
        const match = !q || row.textContent.toLowerCase().includes(q);
        row.style.display = match ? '' : 'none';
      });
    });
  }

  if (pillsGroup && tableBody) {
    pillsGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.upz-cat-btn');
      if (!btn) return;

      pillsGroup.querySelectorAll('.upz-cat-btn').forEach((b) => {
        b.classList.remove('active', 'bg-emerald-deep', 'text-snow');
        b.classList.add('bg-paper', 'text-steel');
      });
      btn.classList.add('active', 'bg-emerald-deep', 'text-snow');
      btn.classList.remove('bg-paper', 'text-steel');

      const cat = btn.dataset.category;
      tableBody.querySelectorAll('tr.upz-row').forEach((row) => {
        if (cat === 'all') row.style.display = '';
        else row.style.display = row.dataset.category === cat ? '' : 'none';
      });
    });
  }

  // Kalkulator Hak Kelola UPZ (12.5% Fatwa MUI & Keputusan BAZNAS RI)
  const calcBtn = $('upz-calc-btn');
  const calcInput = $('upz-calc-input');
  const calcRes = $('upz-calc-result');
  const calcUnit = $('upz-calc-unit');

  const runUpzCalc = () => {
    const gross = Number(calcInput?.value) || 100000000;
    const totalAmil = gross * 0.125;
    const unitShare = gross * 0.06;

    if (calcRes) calcRes.textContent = `Rp ${totalAmil.toLocaleString('id-ID')}`;
    if (calcUnit) calcUnit.textContent = `Rp ${unitShare.toLocaleString('id-ID')}`;
  };

  calcBtn?.addEventListener('click', runUpzCalc);
  calcInput?.addEventListener('input', runUpzCalc);

  $('btn-open-upz-reg')?.addEventListener('click', () => {
    window.openUpzModal?.();
  });
}

function init() {
  // Delegasi klik link dan aksi internal admin
  document.addEventListener('click', (e) => {
    // 1. Aksi Cepat via data-action
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.preventDefault();
      const action = actionBtn.getAttribute('data-action');
      if (action === 'open-tte') window.openTteModal?.();
      else if (action === 'open-journal') window.openJournalModal?.();
      else if (action === 'open-upz') window.openUpzModal?.();
      else if (action === 'open-zis') window.openZisModal?.();
      else if (action === 'open-cmd') {
        const cmdModal = $('app-cmd-modal');
        if (cmdModal) {
          cmdModal.classList.replace('hidden', 'flex');
          $('app-cmd-input')?.focus();
        }
      } else if (action === 'sync-simba') {
        showAppToast('Menghubungkan ke SIMBA BAZNAS RI... Sinkronisasi 110 transaksi tervalidasi!', 'sync');
      }
      closeSidebar();
      return;
    }

    // 2. Navigasi Sub-menu dengan scroll otomatis ke elemen bersangkutan
    const scrollEl = e.target.closest('[data-scroll]');
    if (scrollEl) {
      e.preventDefault();
      const route = scrollEl.dataset.route || (scrollEl.getAttribute('href') ? scrollEl.getAttribute('href').slice(1).split('#')[0] : null);
      const scrollId = scrollEl.dataset.scroll;
      if (route && ADMIN_ROUTES[route]) {
        navigate(route);
      }
      setTimeout(() => {
        const target = document.getElementById(scrollId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('ring-2', 'ring-[#064e3b]', 'rounded-card', 'transition-all');
          setTimeout(() => target.classList.remove('ring-2', 'ring-[#064e3b]', 'rounded-card'), 2200);
        }
      }, 120);
      closeSidebar();
      return;
    }

    // 3. Navigasi modul utama
    const el = e.target.closest('a[href^="#"], [data-route]');
    if (!el) return;

    const href = el.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith('http'))) return; // Biarkan navigasi ke halaman publik atau external

    const key = el.dataset.route || (href ? href.slice(1) : null);
    if (key && ADMIN_ROUTES[key]) {
      e.preventDefault();
      navigate(key);
    }
  });

  // Sidebar mobile toggle
  $('app-btn-open-sidebar')?.addEventListener('click', openSidebar);
  $('app-btn-close-sidebar')?.addEventListener('click', closeSidebar);
  $('app-sidebar-backdrop')?.addEventListener('click', closeSidebar);

  // Role selector
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

  // Inisialisasi semua modal & modul operasional amil
  setupTteModal();
  setupJournalModal();
  setupUpzModal();
  setupCommandPalette();
  setupQuickZis();
  setupQuickActionsMenu();
  setupMustahikCases();
  setupKifayahCalculator();
  setupJurnalFiltersAndActions();
  setupUpzFiltersAndActions();

  // Load active role
  const saved = appState.get();
  setRole(saved.activeRole in ROLES ? saved.activeRole : 'pimpinan', { goHome: false });

  // Hash listener
  window.addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (ADMIN_ROUTES[h]) render(h);
  });

  // Default awal ke 'command-center' (Executive Command Center)
  const initialHash = location.hash.slice(1);
  const initialRoute = ADMIN_ROUTES[initialHash] ? initialHash : 'command-center';
  render(initialRoute);
  triggerScrollAnimations();

  console.log(`Panel Admin BAZNAS Kab. Bandung siap. Tampilan aktif: #${initialRoute}`);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
