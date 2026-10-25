export const prerender = false;

// Mock database for mustahik verification & tracking
let mustahikList = [
  {
    nik: '3204121908750003',
    nama: 'Asep Saepudin',
    telepon: '0812-2244-8891',
    alamat: 'Kp. Pasirhuni RT 03/08, Ds. Pasirhuni, Kec. Cimaung',
    kategori: 'Bandung Peduli - Rutilahu Darurat',
    asnaf: 'Fakir',
    anggaran: 25000000,
    status: 'Menunggu Disposisi TTE',
    skorCibest: { kuadran: 'IV', spiritual: 68, material: 22, defisit: '-75.8%' },
    tanggalDaftar: '2026-10-22',
    surveyor: 'Ahmad Fauzi, S.Sos.'
  },
  {
    nik: '3204055204820001',
    nama: 'Siti Aminah',
    telepon: '0857-9911-3320',
    alamat: 'Jl. Raya Ciwidey Km 4, Ds. Rawabogo, Kec. Ciwidey',
    kategori: 'Bandung Cerdas - Beasiswa Santri',
    asnaf: 'Miskin / Fisabilillah',
    anggaran: 4800000,
    status: 'Disetujui TTE BSrE',
    skorCibest: { kuadran: 'II', spiritual: 82, material: 41, defisit: '-45.2%' },
    tanggalDaftar: '2026-10-23',
    surveyor: 'Rian Hidayat'
  },
  {
    nik: '3204170311680004',
    nama: 'Engkos Kosasih',
    telepon: '0813-8822-4411',
    alamat: 'Kp. Bojongsoang RT 01/04, Ds. Bojongsoang, Kec. Bojongsoang',
    kategori: 'Bandung Makmur - Modal Z-Chicken',
    asnaf: 'Gharimin / Miskin',
    anggaran: 12000000,
    status: 'Survei Lapangan',
    skorCibest: { kuadran: 'II', spiritual: 74, material: 38, defisit: '-52.0%' },
    tanggalDaftar: '2026-10-24',
    surveyor: 'Ahmad Fauzi, S.Sos.'
  },
  {
    nik: '3204084509790002',
    nama: 'Iis Aisyah',
    telepon: '0821-3344-5566',
    alamat: 'Kp. Sindangreret RT 02/06, Ds. Margahayu Selatan, Kec. Margahayu',
    kategori: 'Bandung Sehat - Bantuan Hemodialisa',
    asnaf: 'Fakir',
    anggaran: 6500000,
    status: 'Disetujui TTE BSrE',
    skorCibest: { kuadran: 'IV', spiritual: 78, material: 20, defisit: '-78.5%' },
    tanggalDaftar: '2026-10-20',
    surveyor: 'dr. H. Rahmat'
  }
];

export async function GET({ request }) {
  const url = new URL(request.url);
  const nik = url.searchParams.get('nik');

  if (nik) {
    const found = mustahikList.find(m => m.nik === nik || m.nik.replace(/\D/g, '') === nik.replace(/\D/g, ''));
    if (!found) {
      return new Response(JSON.stringify({
        success: false,
        message: `Data NIK ${nik} tidak ditemukan dalam antrean verifikasi terpadu BAZNAS Kab. Bandung.`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: found
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    total: mustahikList.length,
    data: mustahikList
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { nik, nama, telepon, alamat, kategori, deskripsi } = body;

    if (!nik || !nama) {
      return new Response(JSON.stringify({ success: false, message: 'NIK dan Nama Lengkap wajib diisi.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newCase = {
      nik: nik.trim(),
      nama: nama.trim(),
      telepon: telepon || '-',
      alamat: alamat || 'Kabupaten Bandung',
      kategori: kategori || 'Bandung Peduli - Bantuan Darurat',
      asnaf: 'Fakir / Miskin (Tahap Verifikasi)',
      anggaran: 5000000,
      status: 'Survei Lapangan',
      skorCibest: { kuadran: 'IV', spiritual: 70, material: 25, defisit: '-70.0%' },
      tanggalDaftar: new Date().toISOString().split('T')[0],
      surveyor: 'Tim Respon BAZNAS Tanggap Bencana'
    };

    mustahikList.unshift(newCase);

    return new Response(JSON.stringify({
      success: true,
      message: 'Pengajuan bantuan mustahik berhasil didaftarkan ke SIMBA BAZNAS Kab. Bandung.',
      data: newCase
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
