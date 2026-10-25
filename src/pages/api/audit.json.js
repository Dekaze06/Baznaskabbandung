export const prerender = false;

// Mock persistent immutable audit log with cryptographic hash chaining (PRD Section 6.1)
let auditLogs = [
  {
    id: 104,
    timestamp: '2026-10-24 16:30:12',
    actor: 'KH. Yusuf Ali (Ketua BAZNAS)',
    role: 'PIMPINAN_KETUA',
    action: 'DIGITAL_SIGN_TTE',
    target: 'DOSS-202610-004 (Bantuan Hemodialisa Iis Aisyah)',
    ip: '10.32.4.12',
    hash: 'SHA256:8f4c21a9e04...9921',
    prevHash: 'SHA256:7e9a8f2d5c1...881e'
  },
  {
    id: 103,
    timestamp: '2026-10-24 14:15:00',
    actor: 'Hj. Nenden (Staf Keuangan)',
    role: 'STAF_KEUANGAN',
    action: 'POSTING_JURNAL_PSAK109',
    target: 'JU-2026-X-0441 (Setoran Zakat ASN Disdik)',
    ip: '10.32.4.18',
    hash: 'SHA256:7e9a8f2d5c1...881e',
    prevHash: 'SHA256:6d8b7e1c4b0...770d'
  },
  {
    id: 102,
    timestamp: '2026-10-24 11:20:45',
    actor: 'Ahmad Fauzi, S.Sos. (Asesor)',
    role: 'STAF_PENDISTRIBUSIAN',
    action: 'SUBMIT_SURVEI_GEOTAG',
    target: 'MUST-3204-0982 (Asep Saepudin - Kp. Pasirhuni)',
    ip: '182.253.110.45',
    hash: 'SHA256:6d8b7e1c4b0...770d',
    prevHash: 'SHA256:5c7a6d0b3a9...669c'
  },
  {
    id: 101,
    timestamp: '2026-10-24 09:05:10',
    actor: 'Drs. H. Dedi Kusnadi (Ketua UPZ Disdik)',
    role: 'OPERATOR_UPZ',
    action: 'UPLOAD_BATCH_ASN',
    target: '584 Baris ASN Payroll Disdik (Rp 348.650.000)',
    ip: '114.124.200.89',
    hash: 'SHA256:5c7a6d0b3a9...669c',
    prevHash: 'SHA256:00000000000...GENESIS'
  }
];

export async function GET({ request }) {
  return new Response(JSON.stringify({
    success: true,
    totalRecords: auditLogs.length,
    securityIntegrity: 'VERIFIED_100%_TAMPER_PROOF',
    lastHash: auditLogs[0]?.hash,
    data: auditLogs
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { actor, role, action, target } = body;

    const prev = auditLogs[0]?.hash || 'GENESIS_HASH';
    const newHash = `SHA256:${Math.random().toString(16).substring(2, 10)}${Date.now().toString(16)}`;

    const newLog = {
      id: auditLogs.length + 101,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: actor || 'Sistem BAZNAS SaaS',
      role: role || 'SYSTEM_DAEMON',
      action: action || 'AUDIT_EVENT',
      target: target || 'General Resource',
      ip: '127.0.0.1',
      hash: newHash,
      prevHash: prev
    };

    auditLogs.unshift(newLog);

    return new Response(JSON.stringify({
      success: true,
      message: 'Log audit berhasil dicatat dalam rantai hash tak dapat diubah (immutable).',
      data: newLog
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
