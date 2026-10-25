export const prerender = false;

// Mock database for multi-level approval dossiers (PRD Section 2.3 & 5.3)
let approvalQueue = [
  {
    id: 'DOSS-202610-001',
    mustahikId: 'MUST-3204-0982',
    nama: 'Asep Saepudin',
    nik: '3204121908750003',
    program: 'Bandung Peduli - Rutilahu Darurat Kp. Pasirhuni',
    asnaf: 'Fakir',
    plafon: 'Tier 3 (> Rp 15 Juta)',
    nominal: 25000000,
    kecamatan: 'Cimaung',
    skorCibest: { kuadran: 'IV (Fakir Spiritual/Material)', defisit: '-75.8%' },
    stage: 'KETUA_FINAL_TTE',
    requiredRole: 'PIMPINAN_KETUA',
    status: 'Menunggu Tanda Tangan Digital BSrE',
    tanggalMasuk: '2026-10-22',
    kelengkapanBerkas: {
      ktpKkValid: true,
      sktmDesa: true,
      surveiLapanganGeotag: true,
      rekomendasiWaka2: true,
      validasiRkatWaka3: true
    },
    tteHash: null,
    signedAt: null
  },
  {
    id: 'DOSS-202610-002',
    mustahikId: 'MUST-3204-1014',
    nama: 'Hj. Siti Rokayah (Santri Yatim)',
    nik: '3204055204820001',
    program: 'Bandung Cerdas - Beasiswa Pesantren Al-Ihsan',
    asnaf: 'Fisabilillah / Miskin',
    plafon: 'Tier 2 (Rp 2,5 - 15 Juta)',
    nominal: 4800000,
    kecamatan: 'Ciwidey',
    skorCibest: { kuadran: 'II', defisit: '-45.2%' },
    stage: 'WAKA_2_APPROVED',
    requiredRole: 'WAKA_3_KEUANGAN',
    status: 'Menunggu Validasi Pagu RKAT',
    tanggalMasuk: '2026-10-23',
    kelengkapanBerkas: {
      ktpKkValid: true,
      sktmDesa: true,
      surveiLapanganGeotag: true,
      rekomendasiWaka2: true,
      validasiRkatWaka3: false
    },
    tteHash: null,
    signedAt: null
  },
  {
    id: 'DOSS-202610-003',
    mustahikId: 'MUST-3204-1049',
    nama: 'Engkos Kosasih (2 Mitra Z-Auto)',
    nik: '3204170311680004',
    program: 'Bandung Makmur - Paket Usaha Bengkel Z-Auto',
    asnaf: 'Miskin Produktif',
    plafon: 'Tier 2 (Rp 2,5 - 15 Juta)',
    nominal: 12000000,
    kecamatan: 'Bojongsoang',
    skorCibest: { kuadran: 'II', defisit: '-52.0%' },
    stage: 'KABAG_REVIEW',
    requiredRole: 'WAKA_2_PENDISTRIBUSIAN',
    status: 'Menunggu Otorisasi Bidang Penyaluran',
    tanggalMasuk: '2026-10-24',
    kelengkapanBerkas: {
      ktpKkValid: true,
      sktmDesa: true,
      surveiLapanganGeotag: true,
      rekomendasiWaka2: false,
      validasiRkatWaka3: false
    },
    tteHash: null,
    signedAt: null
  },
  {
    id: 'DOSS-202610-004',
    mustahikId: 'MUST-3204-1088',
    nama: 'Iis Aisyah (Pengobatan Hemodialisa)',
    nik: '3204084509790002',
    program: 'Bandung Sehat - Bantuan Medis RSUD Otista',
    asnaf: 'Fakir Sakit',
    plafon: 'Tier 2 (Rp 2,5 - 15 Juta)',
    nominal: 6500000,
    kecamatan: 'Margahayu',
    skorCibest: { kuadran: 'IV', defisit: '-78.5%' },
    stage: 'COMPLETED_SIGNED',
    requiredRole: 'STAF_KEUANGAN',
    status: 'Tersertifikasi TTE BSrE (Siap SP2D)',
    tanggalMasuk: '2026-10-20',
    kelengkapanBerkas: {
      ktpKkValid: true,
      sktmDesa: true,
      surveiLapanganGeotag: true,
      rekomendasiWaka2: true,
      validasiRkatWaka3: true
    },
    tteHash: 'BSrE-BSSN-SHA256:7f4c9a01...881b',
    signedAt: '2026-10-24 16:30'
  }
];

export async function GET({ request }) {
  const url = new URL(request.url);
  const stage = url.searchParams.get('stage');

  let list = approvalQueue;
  if (stage && stage !== 'all') {
    list = list.filter(item => item.stage === stage);
  }

  return new Response(JSON.stringify({
    success: true,
    totalPending: approvalQueue.filter(q => q.stage !== 'COMPLETED_SIGNED').length,
    totalSigned: approvalQueue.filter(q => q.stage === 'COMPLETED_SIGNED').length,
    data: list
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action, dossierId, pin, signerRole, notes } = body;

    if (!action) {
      return new Response(JSON.stringify({ success: false, message: 'Aksi otorisasi wajib ditentukan.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Single Sign or Batch Sign
    if (action === 'SIGN_TTE' || action === 'BATCH_SIGN') {
      // Validate PIN
      if (!pin || pin.length < 6) {
        return new Response(JSON.stringify({ success: false, message: 'PIN Otorisasi TTE BSrE (6 Digit) wajib dimasukkan.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const timestamp = new Date().toISOString();
      const generatedHash = `BSrE-BSSN-SHA256:${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;

      if (action === 'BATCH_SIGN') {
        let count = 0;
        approvalQueue.forEach(item => {
          if (item.stage !== 'COMPLETED_SIGNED') {
            item.stage = 'COMPLETED_SIGNED';
            item.status = 'Tersertifikasi TTE BSrE (Siap SP2D)';
            item.tteHash = generatedHash;
            item.signedAt = timestamp;
            count++;
          }
        });

        return new Response(JSON.stringify({
          success: true,
          message: `${count} berkas berhasil ditandatangani secara elektronik (TTE BSrE BSSN) dan diteruskan ke kasir perbankan H2H.`,
          batchCertificate: generatedHash,
          signedCount: count
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Single item sign
      const item = approvalQueue.find(q => q.id === dossierId);
      if (!item) {
        return new Response(JSON.stringify({ success: false, message: `Berkas ${dossierId} tidak ditemukan.` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      item.stage = 'COMPLETED_SIGNED';
      item.status = 'Tersertifikasi TTE BSrE (Siap SP2D)';
      item.tteHash = generatedHash;
      item.signedAt = timestamp;

      return new Response(JSON.stringify({
        success: true,
        message: `Berkas ${dossierId} (${item.nama}) sah ditandatangani dengan TTE BSrE BSSN.`,
        certificate: generatedHash,
        data: item
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'REVISE' || action === 'REJECT') {
      const item = approvalQueue.find(q => q.id === dossierId);
      if (!item) {
        return new Response(JSON.stringify({ success: false, message: `Berkas ${dossierId} tidak ditemukan.` }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      item.status = action === 'REVISE' ? 'Dikembalikan untuk Revisi' : 'Ditolak Sidang Pleno';
      item.stage = action === 'REVISE' ? 'REVISION_REQUESTED' : 'REJECTED';

      return new Response(JSON.stringify({
        success: true,
        message: `Status berkas ${dossierId} diperbarui: ${item.status}`,
        notes: notes || 'Tidak ada catatan'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Aksi tidak dikenal.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
