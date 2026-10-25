export const prerender = false;

// Mock persistent in-memory database for BAZNAS SaaS backend
let zisStats = {
  totalPenghimpunan: 48720500000,
  targetRkat: 52000000000,
  persentaseRkat: 93.69,
  nisabEmas: 82350000,
  hargaEmasPerGram: 1420000,
  berasFitrahPerJiwa: 40000,
  totalMuzakiAktif: 42150,
  transaksiTerakhir: [
    { id: 'BSZ-202610-0941', nama: 'H. Dedi Suhendar', jenis: 'Zakat Penghasilan (Profesi)', jumlah: 1250000, waktu: '24 Okt 2026, 14:22', kanal: 'BSI Mobile', status: 'Tervalidasi' },
    { id: 'BSZ-202610-0940', nama: 'Hj. Siti Nurbaya', jenis: 'Zakat Maal (Tabungan)', jumlah: 4500000, waktu: '24 Okt 2026, 13:50', kanal: 'QRIS BJB Syariah', status: 'Tervalidasi' },
    { id: 'BSZ-202610-0939', nama: 'ASN Bapenda Kab. Bandung', jenis: 'Zakat Profesi ASN Kolektif', jumlah: 88500000, waktu: '24 Okt 2026, 11:15', kanal: 'Payroll BJB Syariah', status: 'Tervalidasi' },
    { id: 'BSZ-202610-0938', nama: 'Muzaki Hamba Allah', jenis: 'Infak Kemanusiaan Rutilahu', jumlah: 500000, waktu: '24 Okt 2026, 10:04', kanal: 'PosPay Soreang', status: 'Tervalidasi' }
  ]
};

export async function GET({ request }) {
  return new Response(JSON.stringify({
    success: true,
    data: zisStats,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { nama, phone, email, jenis, jumlah, metode } = body;

    if (!jumlah || Number(jumlah) <= 0) {
      return new Response(JSON.stringify({ success: false, message: 'Nominal pembayaran tidak valid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const bszCode = `BSZ-3204-${Date.now().toString().slice(-6)}`;
    const newTx = {
      id: bszCode,
      nama: nama || 'Hamba Allah',
      phone: phone || '-',
      email: email || '-',
      jenis: jenis || 'Zakat Penghasilan',
      jumlah: Number(jumlah),
      metode: metode || 'QRIS BJB Syariah',
      waktu: 'Baru saja',
      status: 'Tervalidasi SIMBA'
    };

    zisStats.totalPenghimpunan += Number(jumlah);
    zisStats.totalMuzakiAktif += 1;
    zisStats.transaksiTerakhir.unshift(newTx);
    if (zisStats.transaksiTerakhir.length > 20) zisStats.transaksiTerakhir.pop();

    return new Response(JSON.stringify({
      success: true,
      message: 'Pembayaran ZIS berhasil dicatat & e-BSZ diterbitkan',
      bsz: newTx
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
