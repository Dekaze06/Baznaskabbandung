export const prerender = false;

let segregatedFunds = [
  { pool: 'Dana Zakat', bank: 'Bank Syariah Indonesia (BSI)', saldo: 4821450000, nomorRek: '7100293841', status: 'Terikat 8 Asnaf' },
  { pool: 'Dana Infak Terikat', bank: 'Bank BJB Syariah', saldo: 1265800000, nomorRek: '5040182741', status: 'Khusus Program Terikat' },
  { pool: 'Dana Infak Bebas', bank: 'Bank BJB Syariah & QRIS', saldo: 850000000, nomorRek: '5040199482', status: 'Fleksibel Pemberdayaan' },
  { pool: 'Dana Amil', bank: 'Bank Syariah Indonesia (BSI)', saldo: 612800000, nomorRek: '7192837411', status: 'Hak Amil (Max 12.5%)' },
  { pool: 'Dana Non-Halal / DSKL', bank: 'PosPay & Giro Penyaluran', saldo: 1634920000, nomorRek: '9021849102', status: 'Sosial & Kemaslahatan Umum' }
];

let jurnalMemorial = [
  {
    nomor: 'JU-2026-X-0442',
    tanggal: '24 Okt 2026',
    keterangan: 'Penyaluran Bantuan Rutilahu Darurat Kp. Pasirhuni (Asep Saepudin)',
    kolam: 'Dana Zakat',
    debit: '5.1.01.01.01 - Beban Penyaluran Fakir (Rp 25.000.000)',
    kredit: '1.1.01.02.01 - Kas BSI Giro Zakat Utama (Rp 25.000.000)',
    nominal: 25000000,
    status: 'Posted SIMBA'
  },
  {
    nomor: 'JU-2026-X-0441',
    tanggal: '24 Okt 2026',
    keterangan: 'Penerimaan Zakat Profesi ASN Disdik Periode Oktober 2026',
    kolam: 'Dana Zakat',
    debit: '1.1.01.02.02 - Kas Giro BJB Syariah (Rp 312.400.000)',
    kredit: '4.1.01.01.01 - Pendapatan Zakat Profesi (Rp 312.400.000)',
    nominal: 312400000,
    status: 'Posted SIMBA'
  },
  {
    nomor: 'JU-2026-X-0440',
    tanggal: '24 Okt 2026',
    keterangan: 'Alokasi Hak Kelola Amil UPZ Disdik 6% (Fatwa MUI)',
    kolam: 'Dana Amil',
    debit: '5.2.01.03.01 - Beban Operasional Amil UPZ (Rp 18.744.000)',
    kredit: '2.1.01.01.02 - Utang Bagi Hasil Amil UPZ (Rp 18.744.000)',
    nominal: 18744000,
    status: 'Posted SIMBA'
  }
];

export async function GET({ request }) {
  return new Response(JSON.stringify({
    success: true,
    data: {
      totalKasKelolaan: segregatedFunds.reduce((acc, f) => acc + f.saldo, 0),
      segregatedFunds,
      jurnalMemorial
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { keterangan, kolam, debitAkun, kreditAkun, nominal } = body;

    if (!nominal || Number(nominal) <= 0) {
      return new Response(JSON.stringify({ success: false, message: 'Nominal jurnal harus lebih besar dari 0' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newJurnal = {
      nomor: `JU-2026-X-${Math.floor(1000 + Math.random() * 9000)}`,
      tanggal: '24 Okt 2026',
      keterangan: keterangan || 'Jurnal Penyesuaian PSAK 109',
      kolam: kolam || 'Dana Zakat',
      debit: debitAkun || '5.1.01.01.01 - Beban Penyaluran Zakat',
      kredit: kreditAkun || '1.1.01.02.01 - Kas BSI Giro',
      nominal: Number(nominal),
      status: 'Posted SIMBA'
    };

    jurnalMemorial.unshift(newJurnal);

    return new Response(JSON.stringify({
      success: true,
      message: 'Jurnal memorial PSAK 109 berhasil dibukukan dan diposting ke SIMBA.',
      data: newJurnal
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
