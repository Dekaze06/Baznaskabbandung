export const prerender = false;

let upzDirectory = [
  { kode: 'UPZ-3204-OPD-001', nama: 'Sekretariat Daerah (Setda) Kab. Bandung', kategori: 'opd', sk: '042/KEP/BAZNAS-BDG/2024', realisasi: 1450800000, hakAmil: 181350000, porsiUpz: 87048000, bank: 'BSI 7120394812', status: 'Kepatuhan Mandiri' },
  { kode: 'UPZ-3204-OPD-014', nama: 'Dinas Pendidikan Kab. Bandung', kategori: 'opd', sk: '055/KEP/BAZNAS-BDG/2024', realisasi: 3240000000, hakAmil: 405000000, porsiUpz: 194400000, bank: 'BJB Syariah 5040109283', status: 'Kepatuhan Sangat Baik' },
  { kode: 'UPZ-3204-OPD-018', nama: 'Dinas Kesehatan & RSUD Soreang', kategori: 'opd', sk: '061/KEP/BAZNAS-BDG/2024', realisasi: 1120400000, hakAmil: 140050000, porsiUpz: 67224000, bank: 'BSI 7183029182', status: 'Terverifikasi' },
  { kode: 'UPZ-3204-KEC-012', nama: 'UPZ Kantor Kecamatan Ciwidey', kategori: 'kecamatan', sk: '118/KEP/BAZNAS-BDG/2025', realisasi: 420500000, hakAmil: 52562500, porsiUpz: 25230000, bank: 'BJB Syariah 5040182741', status: 'Terverifikasi' },
  { kode: 'UPZ-3204-KEC-001', nama: 'UPZ Kantor Kecamatan Soreang', kategori: 'kecamatan', sk: '102/KEP/BAZNAS-BDG/2024', realisasi: 580400000, hakAmil: 72550000, porsiUpz: 34824000, bank: 'BSI 7109283741', status: 'Kepatuhan Mandiri' },
  { kode: 'UPZ-3204-KEC-005', nama: 'UPZ Kantor Kecamatan Baleendah', kategori: 'kecamatan', sk: '108/KEP/BAZNAS-BDG/2024', realisasi: 645800000, hakAmil: 80725000, porsiUpz: 38748000, bank: 'BSI 7192837411', status: 'Terverifikasi' },
  { kode: 'UPZ-3204-MSJ-088', nama: 'Masjid Agung Al-Fathu Soreang', kategori: 'masjid', sk: '089/KEP/BAZNAS-BDG/2024', realisasi: 680200000, hakAmil: 85025000, porsiUpz: 40812000, bank: 'BSI 7183920194', status: 'Perlu Perpanjangan SK' },
  { kode: 'UPZ-3204-SCH-031', nama: 'UPZ K3S Sekolah Dasar Kec. Cileunyi', kategori: 'sekolah', sk: '133/KEP/BAZNAS-BDG/2024', realisasi: 415200000, hakAmil: 51900000, porsiUpz: 24912000, bank: 'BJB Syariah 5040192834', status: 'Terverifikasi' }
];

export async function GET({ request }) {
  const url = new URL(request.url);
  const cat = url.searchParams.get('kategori');

  let list = upzDirectory;
  if (cat && cat !== 'all') {
    list = list.filter(u => u.kategori === cat);
  }

  return new Response(JSON.stringify({
    success: true,
    totalRegistered: 487,
    activeDisplay: list.length,
    data: list
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { nama, kategori, skNomor, kontakKetua, bank, noRek } = body;

    if (!nama || !kategori) {
      return new Response(JSON.stringify({ success: false, message: 'Nama UPZ dan Kategori wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const nextId = `UPZ-3204-${kategori.toUpperCase().slice(0, 3)}-${String(upzDirectory.length + 1).padStart(3, '0')}`;
    const newUpz = {
      kode: nextId,
      nama,
      kategori,
      sk: skNomor || `${String(upzDirectory.length + 50).padStart(3, '0')}/KEP/BAZNAS-BDG/2026`,
      realisasi: 0,
      hakAmil: 0,
      porsiUpz: 0,
      bank: `${bank || 'BSI'} ${noRek || '7100000000'}`,
      status: 'Terdaftar Baru'
    };

    upzDirectory.unshift(newUpz);

    return new Response(JSON.stringify({
      success: true,
      message: 'Registrasi UPZ baru berhasil disahkan dan terdaftar di SIMBA.',
      data: newUpz
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
