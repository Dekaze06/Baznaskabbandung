export const prerender = false;

// Parameter Acuan Fikih & Regulasi BAZNAS Kabupaten Bandung (PRD Section 3.2)
const FIKIH_CONFIG = {
  hargaEmasPerGram: 1420000,
  nisabGramEmas: 85,
  nisabEmasTahunan: 1420000 * 85, // Rp 120.700.000 / thn
  nisabEmasBulanan: Math.round((1420000 * 85) / 12), // Rp 10.058.333 / bln
  tarifZakat: 0.025, // 2.5%
  hargaBerasPerKg: 16000,
  kadarBerasFitrahKg: 2.5,
  tarifBerasFitrahPerJiwa: 40000, // Rp 40.000 / jiwa
  tarifFidyahPerHari: 45000 // Rp 45.000 / hari
};

export async function GET({ request }) {
  return new Response(JSON.stringify({
    success: true,
    config: FIKIH_CONFIG,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { jenis, pendapatan, pengeluaran, periode, emasGram, tabungan, hutang, jumlahJiwa, jumlahHari } = body;

    let result = {
      jenisZakat: jenis || 'penghasilan',
      wajibZakat: false,
      nisabAcuan: 0,
      basisPerhitungan: 0,
      nominalZakat: 0,
      keterangan: ''
    };

    if (jenis === 'penghasilan') {
      const isBulanan = periode !== 'tahunan';
      const nisab = isBulanan ? FIKIH_CONFIG.nisabEmasBulanan : FIKIH_CONFIG.nisabEmasTahunan;
      const grossIncome = Number(pendapatan) || 0;
      const deduction = Number(pengeluaran) || 0;
      const netIncome = Math.max(0, grossIncome - deduction);

      result.nisabAcuan = nisab;
      result.basisPerhitungan = netIncome;
      result.wajibZakat = netIncome >= nisab;
      result.nominalZakat = result.wajibZakat ? Math.round(netIncome * FIKIH_CONFIG.tarifZakat) : 0;
      result.keterangan = result.wajibZakat
        ? `Wajib zakat (Penghasilan neto melampaui nisab Rp ${nisab.toLocaleString('id-ID')}).`
        : `Belum wajib zakat (Penghasilan belum mencapai nisab). Anda disarankan menunaikan Infak/Sedekah.`;
    } else if (jenis === 'maal') {
      const totalHarta = (Number(tabungan) || 0) + ((Number(emasGram) || 0) * FIKIH_CONFIG.hargaEmasPerGram);
      const totalHutang = Number(hutang) || 0;
      const hartaBersih = Math.max(0, totalHarta - totalHutang);
      const nisab = FIKIH_CONFIG.nisabEmasTahunan;

      result.nisabAcuan = nisab;
      result.basisPerhitungan = hartaBersih;
      result.wajibZakat = hartaBersih >= nisab;
      result.nominalZakat = result.wajibZakat ? Math.round(hartaBersih * FIKIH_CONFIG.tarifZakat) : 0;
      result.keterangan = result.wajibZakat
        ? `Wajib zakat maal 2.5% atas total harta kelolaan setara 85 gr emas.`
        : `Harta kelolaan belum mencapai nisab tahunan Rp ${nisab.toLocaleString('id-ID')}.`;
    } else if (jenis === 'fitrah') {
      const jiwa = Number(jumlahJiwa) || 1;
      result.nisabAcuan = 0;
      result.basisPerhitungan = jiwa;
      result.wajibZakat = true;
      result.nominalZakat = jiwa * FIKIH_CONFIG.tarifBerasFitrahPerJiwa;
      result.keterangan = `Zakat Fitrah untuk ${jiwa} jiwa x Rp 40.000 (Setara 2.5 Kg / 3.5 Liter Beras Premium).`;
    } else if (jenis === 'fidyah') {
      const hari = Number(jumlahHari) || 1;
      result.nisabAcuan = 0;
      result.basisPerhitungan = hari;
      result.wajibZakat = true;
      result.nominalZakat = hari * FIKIH_CONFIG.tarifFidyahPerHari;
      result.keterangan = `Fidyah untuk ${hari} hari x Rp 45.000 / hari (Termasuk makanan siap santap & lauk).`;
    }

    return new Response(JSON.stringify({
      success: true,
      data: result,
      config: FIKIH_CONFIG
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
