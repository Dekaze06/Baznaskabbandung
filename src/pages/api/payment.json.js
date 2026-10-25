export const prerender = false;

// Payment Channels & Gateway Integration (PRD Section 3.3 & 5.3)
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action, nominal, nama, jenisDana, kanalPembayaran, phone, email } = body;

    const amount = Number(nominal) || 0;
    if (amount <= 0) {
      return new Response(JSON.stringify({ success: false, message: 'Nominal pembayaran tidak valid.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const orderId = `ZIS-TRX-${Date.now().toString().slice(-8)}`;
    const bszNumber = `BSZ-3204-${Date.now().toString().slice(-6)}`;
    const uniqueDigit = Math.floor(100 + Math.random() * 899);
    const totalWithUnique = amount + (kanalPembayaran === 'transfer' ? uniqueDigit : 0);

    // Dynamic QRIS payload generator
    const qrisString = `00020101021226600016ID.BAZNAS.BDG011893600988320400010215ID102026048123503033605802ID5919BAZNAS KAB BANDUNG6007SOREANG61054091162230715${orderId}63047A1F`;

    // Dynamic Sharia Virtual Account
    const vaNumbers = {
      bsi: `988-3204-${Math.floor(10000000 + Math.random() * 90000000)}`,
      bjb_syariah: `504-3204-${Math.floor(10000000 + Math.random() * 90000000)}`,
      mandiri_syariah: `89304-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    const responseData = {
      orderId,
      bszNumber,
      status: 'MENUNGGU_PEMBAYARAN',
      namaMuzaki: nama || 'Hamba Allah',
      jenisDana: jenisDana || 'Zakat Penghasilan',
      nominalMurni: amount,
      kodeUnik: kanalPembayaran === 'transfer' ? uniqueDigit : 0,
      totalBayar: totalWithUnique,
      kanal: kanalPembayaran || 'qris',
      qrisData: qrisString,
      virtualAccount: vaNumbers,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      instruksi: kanalPembayaran === 'qris'
        ? 'Pindai kode QRIS menggunakan mobile banking syariah atau dompet digital Anda.'
        : 'Transfer tepat sesuai total nominal pembayaran ke rekening resmi BAZNAS Kab. Bandung.'
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Instruksi pembayaran resmi BAZNAS berhasil dibuat.',
      data: responseData
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
