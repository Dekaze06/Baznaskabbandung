# Product Requirements Document (PRD): Sistem Informasi & Portal Digital BAZNAS Kabupaten Bandung

**Identitas Dokumen**

| Atribut | Detail Informasi |
| :--- | :--- |
| **Nama Produk** | Portal Layanan Publik, Core Backend & Executive Admin Panel [BAZNAS Kabupaten Bandung](https://kabbandung.baznas.go.id/) |
| **Versi Dokumen** | 2.0 (Enterprise Release Specification) |
| **Tanggal Dokumen** | 24 Oktober 2026 |
| **Pemilik Produk** | Pimpinan & Bagian TI [BAZNAS Kabupaten Bandung](https://kabbandung.baznas.go.id/) (Soreang, Kabupaten Bandung) |
| **Standar Regulasi** | UU No. 23 Tahun 2011 tentang Pengelolaan Zakat, PP No. 14 Tahun 2014, PSAK 109 (Akuntansi ZIS), dan Standar Integrasi [SIMBA BAZNAS RI](https://simba.baznas.go.id/wishes) |
| **Status** | Siap untuk Pengembangan (*Ready for Engineering*) |

## 1. Ringkasan Eksekutif & Visi Produk

[BAZNAS Kabupaten Bandung](https://kabbandung.baznas.go.id/) mengelola penghimpunan dan [pendistribusian zakat, infak, sedekah (ZIS), serta Dana Sosial Keagamaan Lainnya (DSKL)](https://kabbandung.baznas.go.id/Pendistribusian) di seluruh wilayah Kabupaten Bandung (31 kecamatan, 270 desa, dan 10 kelurahan), termasuk pengelolaan jaringan Unit Pengumpul Zakat (UPZ) di tingkat Organisasi Perangkat Daerah (OPD), DPRD, kecamatan, desa, dan masjid.

Dokumen ini mendefinisikan spesifikasi teknis dan fungsional untuk membangun **Ekosistem Website Publik, Core Backend API, dan Panel Admin Multi-Otoritas (RBAC)** yang mengintegrasikan layanan muzaki (pembayar zakat), pengajuan bantuan mustahik (penerima manfaat), pelaporan UPZ, akuntansi dana berbasis PSAK 109, hingga mekanisme *multi-level approval* berjenjang dari tingkat Staf Pelaksana, Kepala Bagian, Wakil Ketua I–IV, hingga Ketua BAZNAS.

### 1.1 Tujuan Strategis
1. **Optimalisasi Penghimpunan Digital (ZIS & DSKL):** Memudahkan masyarakat, ASN, dan korporasi di Kabupaten Bandung menunaikan zakat, infak, sedekah, dan fidyah secara daring dengan penerbitan **Bukti Setor Zakat (BSZ)** otomatis yang sah sebagai pengurang penghasilan kena pajak ([integrasi SIMBA & Pajak](https://lampung.baznas.go.id/berita/news-show/pimpinan-baznas-ri-aplikasi-simba-terintegrasi-dengan-pengurang-pajak/26493)).
2. **Tata Kelola Pendistribusian & Pendayagunaan Tepat Sasaran:** Mendigitalisasi siklus hidup pengajuan mustahik, asesmen lapangan (verifikasi faktual *had kifayah*), hingga pencairan dana program unggulan daerah seperti perbaikan [Rumah Tidak Layak Huni (Rutilahu)](https://kabbandung.baznas.go.id/Pendistribusian), pemberdayaan ekonomi [Bengkel Z-Auto](https://kabbandung.baznas.go.id/berita/news-show/baznas-kabupaten-bandung-resmi-luncurkan-program-bengkel-z-auto/31443), [Z-Kosmetika](https://kabbandung.baznas.go.id/berita/news-show/hut-ke-25-baznas-baznas-kabupaten-bandung-perkuat-pemberdayaan-lewat-z-kosmetika/36020), [Program Sedekah Cahaya](https://kabbandung.baznas.go.id/berita/news-show/program-sedekah-cahaya-baznas-kabupaten-bandung-dan-brader-di-pangalengan/19900), [Dai Pelosok](https://kabbandung.baznas.go.id/berita/news-show/baznas-kabupaten-bandung-tutup-program-dai-pelosok-di-kertasari/41821), serta [insentif dan perlindungan BPJS Ketenagakerjaan bagi ribuan ustaz/ustazah, marbot, dan guru ngaji](https://kabbandung.baznas.go.id/berita/news-show/baznas-kabupaten-bandung-laporkan-pengelolaan-zakat-2025-dalam-siraman-rohani-pemkab-bandung/35087).
3. **Otorisasi Berjenjang & Akuntabilitas Internal:** Menerapkan pemisahan tugas (*Segregation of Duties*) yang ketat antara fungsi input (Staf), fungsi verifikasi (Kabag/Auditor), fungsi otorisasi bidang (Wakil Ketua I–IV), dan persetujuan akhir (Ketua BAZNAS) disertai *immutable audit trail*.
4. **Kepatuhan Standar Nasional:** Mendukung sinkronisasi data dua arah dengan sistem pusat [SIMBA BAZNAS RI](https://baznas.go.id/news-show/BAZNAS_RI_Perkuat_Sistem_Pelaporan_Zakat_melalui_SiMBA/3420) dan pedoman [Kantor Digital BAZNAS](https://bucket-api.baznas.go.id/bucket-api/file?bucket=bzn-fdr-smb-p5739641&file=attachments/pemberitahuan/410-Manual%20Book%20Kantor%20Digital%20(V.2).pdf).

### 1.2 Target Metrik Keberhasilan (KPI Produk)
- **Waktu Pemrosesan Transaksi ZIS:** Konfirmasi pembayaran otomatis melalui *Payment Gateway* dan penerbitan e-BSZ dalam waktu `< 15 detik` setelah pembayaran berhasil.
- **Efisiensi Waktu Persetujuan Pendistribusian:** Pemangkasan waktu verifikasi dan disposisi pengajuan mustahik dari rata-rata 14 hari kerja (manual) menjadi `< 3 hari kerja` melalui *workflow* digital.
- **Akurasi Rekonsiliasi & Pelaporan SIMBA:** Tingkat kesesuaian `100%` antara jurnal transaksi portal dengan laporan keuangan PSAK 109 dan format ekspor [SIMBA](https://simba.baznas.go.id/wishes).
- **Keandalan Sistem (*Uptime*):** Ketersediaan layanan minimum `99.9%` terutama pada periode puncak transaksi (10 hari terakhir bulan Ramadan dan Iduladha).

## 2. Arsitektur Peran, Hierarki User & Matriks Otoritas (RBAC + ABAC)

Sistem menggunakan kombinasi **Role-Based Access Control (RBAC)** dan **Attribute-Based Access Control (ABAC)** berdasarkan jabatan struktural di [BAZNAS Kabupaten Bandung](https://kabbandung.baznas.go.id/), plafon nominal dana, serta cakupan wilayah kerja (Kecamatan/Desa/UPZ).

### 2.1 Struktur Hierarki Pengguna

| Level | Kode Role | Nama Jabatan / Peran | Deskripsi & Wewenang Utama |
| :--- | :--- | :--- | :--- |
| **Level 0** | `SUPER_ADMIN` | Administrator Sistem TI | Mengelola konfigurasi infrastruktur, manajemen *user & role*, kunci API Payment Gateway/SIMBA, *backup*, dan pemantauan *security log*. **Tidak memiliki wewenang menyetujui pencairan dana.** |
| **Level 1** | `PIMPINAN_KETUA` | Ketua BAZNAS Kab. Bandung | Pemegang otoritas tertinggi lembaga. Melihat *Executive Dashboard* menyeluruh, menyetujui RKAT, menandatangani SK secara elektronik (TTE), dan memberikan *final approval* pencairan dana di atas ambang batas Wakil Ketua. |
| **Level 2A** | `WAKA_1_PENGHIMPUNAN` | Wakil Ketua I (Bidang Penghimpunan) | Otoritas penuh pada strategi, target, kampanye, kerja sama muzaki korporasi/OPD, dan pengawasan seluruh UPZ di Kabupaten Bandung. |
| **Level 2B** | `WAKA_2_PENDISTRIBUSIAN` | Wakil Ketua II (Bidang Pendistribusian & Pendayagunaan) | Otoritas persetujuan penyaluran bantuan sosial (konsumtif) dan pemberdayaan ekonomi (produktif), kuota program, serta evaluasi kelayakan mustahik. |
| **Level 2C** | `WAKA_3_KEUANGAN` | Wakil Ketua III (Bidang Perencanaan, Keuangan & Pelaporan) | Otoritas pengendalian anggaran (RKAT), otorisasi pencairan kas/bank (*settlement*), validasi laporan keuangan PSAK 109, dan pelaporan ke [SIMBA](https://baznas.go.id/news-show/BAZNAS_RI_Luncurkan_Modernisasi_SIMBA_di_Rakernis_Transformasi_Digital_dan_Zakat_Tech_Mini_Expo_2025/3486) / Pemkab Bandung. |
| **Level 2D** | `WAKA_4_SDM_UMUM` | Wakil Ketua IV (Bidang SDM, Administrasi & Umum) | Otoritas pengelolaan keamilian, surat-menyurat resmi (e-Office), aset lembaga, publikasi kehumasan, serta kepesertaan program internal/amil. |
| **Level 3** | `KABAG_PELAKSANA` | Kepala Pelaksana / Kepala Bagian | Memimpin verifikasi tingkat manajerial per divisi (Kabag Penghimpunan, Kabag Pendistribusian, Kabag Keuangan, Kabag Administrasi & Humas), melakukan *review* draf dari staf sebelum naik ke Pimpinan (Waka/Ketua). |
| **Level 4** | `AUDITOR_SAI` | Satuan Audit Internal (SAI) | Akses *Read-Only* menyeluruh ke seluruh modul transaksi, berkas mustahik, jurnal akuntansi, dan *Audit Trail* untuk keperluan pemeriksaan kepatuhan syariah dan finansial, serta memberi *flag* temuan audit. |
| **Level 5A** | `STAF_PENGHIMPUNAN` | Staf Pelayanan Muzaki & Konter | Input transaksi ZIS tunai/jemput zakat, verifikasi bukti transfer manual, pengelolaan CRM Muzaki, dan penerbitan Bukti Setor Zakat (BSZ). |
| **Level 5B** | `STAF_PENDISTRIBUSIAN` | Staf Layanan Mustahik & Asesor Lapangan | Input permohonan mustahik, pelaksanaan survei kelayakan lapangan (*scoring had kifayah* + unggah foto geotagging), dan pengajuan proposal pencairan. |
| **Level 5C** | `STAF_KEUANGAN` | Staf Keuangan, Kasir & Akuntansi | Rekonsiliasi mutasi bank/Payment Gateway, penjurnalan transaksi PSAK 109, eksekusi pembayaran bantuan yang telah disetujui Pimpinan, dan sinkronisasi data [SIMBA](https://simba.baznas.go.id/wishes). |
| **Level 5D** | `STAF_HUMAS_ADMIN` | Staf Humas, Konten & Sekretariat | Pengelolaan berita, artikel fikih zakat, galeri kegiatan, agenda pimpinan, surat masuk/keluar, dan pembaruan konten halaman publik. |
| **Level 6** | `OPERATOR_UPZ` | Admin Unit Pengumpul Zakat (UPZ) | Perwakilan resmi UPZ OPD/DPRD/Kecamatan/Desa/Masjid. Hanya dapat mengakses data terisolasi milik UPZ masing-masing untuk menginput setoran kolektif dan mengajukan usulan mustahik wilayahnya. |
| **Level 7** | `PUBLIC_USER` | Muzaki / Mustahik Terdaftar | Pengguna publik yang memiliki akun di portal untuk memantau riwayat donasi, mengunduh BSZ/laporan tahunan pajak, atau melacak status pengajuan bantuan. |

### 2.2 Matriks Hak Akses (CRUD & Approval Matrix)

Keterangan Kode Akses:
- **C** = *Create* (Buat/Input Data)
- **R** = *Read* (Lihat Data; `R*` = Terbatas pada cakupan unit/pribadi)
- **U** = *Update* (Ubah Data; `U*` = Hanya saat status *Draft/Revisi*)
- **D** = *Delete* (Hapus/Arsipkan; hanya *Soft Delete*)
- **V** = *Verify* (Verifikasi Teknis/Lapangan)
- **A** = *Approve* (Persetujuan Otorisasi Berjenjang)
- **P** = *Publish / Disburse* (Publikasi ke Publik / Eksekusi Pencairan Dana)

| Modul Sistem | Super Admin | Ketua | Waka I | Waka II | Waka III | Waka IV | Kabag | SAI (Audit) | Staf Bidang | Operator UPZ |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manajemen User & Role** | C,R,U,D | R | R | R | R | R,V,A | R* | R | - | - |
| **Konfigurasi Sistem & API** | C,R,U,D | R | - | - | R | R | - | R | - | - |
| **Kampanye & Target ZIS** | R | R,A | C,R,U,A | R | R | R | C,R,U,V | R | C,R,U* | R* |
| **Transaksi Penghimpunan & BSZ** | R | R | R,A | R | R,V | R | R,V | R | C,R,U*,V | C,R* |
| **Data Mustahik & Survei Lapangan** | R | R | R | R,A | R | R | R,V | R | C,R,U*,V | C,R* |
| **Penyaluran & Pencairan Program** | R | R,A | R | R,A | R,A | R | R,V | R | C,R,U* | R* |
| **Keuangan, RKAT & PSAK 109** | R | R,A | R | R | R,V,A | R | R,V | R | C,R,U*,P | R* |
| **Manajemen UPZ Daerah** | R | R,A | R,V,A | R | R | R,A | C,R,U,V | R | C,R,U* | R*,U* |
| **CMS Berita & Publikasi** | R | R,A | R | R | R | R,A | R,V,P | R | C,R,U* | - |
| **E-Office, SK & Disposisi Surat** | R | R,A | R,A | R,A | R,A | R,V,A | C,R,U,V | R | C,R,U* | R* |
| **Log Audit & Keamanan** | R | R | R* | R* | R* | R* | R* | R | - | - |

### 2.3 Aturan Alur Persetujuan Berjenjang (*Multi-Level Approval Workflow*)

1. **Alur Pencairan Dana Pendistribusian & Pendayagunaan:**
   - **Langkah 1 (Input & Verifikasi Faktual):** `STAF_PENDISTRIBUSIAN` menerima berkas permohonan, melakukan survei lapangan, menghitung skor *Had Kifayah* dan indeks kemiskinan, lalu mengunggah berita acara survei beserta foto geotagging.
   - **Langkah 2 (Verifikasi Manajerial):** `KABAG_PELAKSANA` (Kabag Pendistribusian) memeriksa kelengkapan dokumen (KTP/KK Kab. Bandung, SKTM, RAB/Proposal) dan kesesuaian asnaf (8 golongan penerima zakat).
   - **Langkah 3 (Otorisasi Bidang & Plafon Nominal):**
     - **Plafon Tier 1 (`≤ Rp 2.500.000` - Bantuan Konsumtif/Darurat):** Cukup disetujui oleh `KABAG_PELAKSANA` dengan notifikasi otomatis ke `WAKA_2_PENDISTRIBUSIAN`.
     - **Plafon Tier 2 (`Rp 2.500.001 s.d. Rp 15.000.000` - Bantuan Program/Pemberdayaan Mikro):** Wajib disetujui oleh `WAKA_2_PENDISTRIBUSIAN` dan divalidasi ketersediaan anggarannya oleh `WAKA_3_KEUANGAN`.
     - **Plafon Tier 3 (`> Rp 15.000.000` - Bantuan Rutilahu, Bengkel Z-Auto, Kolaborasi Strategis, atau Bantuan Komunitas):** Wajib melalui persetujuan kolektif (`WAKA_2_PENDISTRIBUSIAN` + `WAKA_3_KEUANGAN`) dan **Persetujuan Akhir (`PIMPINAN_KETUA`)** melalui mekanisme Pleno Pimpinan Digital.
   - **Langkah 4 (Eksekusi Pencairan):** Setelah status berubah menjadi `APPROVED_FOR_DISBURSEMENT`, `STAF_KEUANGAN` melakukan transfer/pencairan dan mengunggah bukti transfer serta Berita Acara Serah Terima (BAST) untuk menutup tiket pengajuan (`DISBURSED`).

2. **Alur Publikasi Berita & Laporan Transparansi:**
   - **Berita Harian & Dokumentasi Kegiatan:** Ditulis oleh `STAF_HUMAS_ADMIN` (`DRAFT`) $\rightarrow$ Direview dan dipublikasikan oleh `KABAG_PELAKSANA` Humas (`PUBLISHED`).
   - **Siaran Pers Resmi, Kebijakan Fikih & Laporan Keuangan Publik:** Ditulis oleh Staf/Kabag $\rightarrow$ Diverifikasi oleh `WAKA_3_KEUANGAN` (untuk laporan keuangan) atau `WAKA_4_SDM_UMUM` (untuk rilis kelembagaan) $\rightarrow$ Disetujui oleh `PIMPINAN_KETUA` sebelum tampil di halaman publik.

## 3. Spesifikasi Fungsional: Portal Publik (Frontend Website)

Portal publik dirancang dengan pendekatan *Mobile-First Responsive Web Application* dan *Progressive Web App (PWA)*, mengutamakan kecepatan akses, kemudahan donasi 3 langkah (*3-Click Checkout*), dan transparansi pengelolaan dana secara *real-time*.

### 3.1 Beranda (*Homepage*) & Transparansi Real-Time
- **Hero Banner Interaktif:** Menampilkan kampanye prioritas [BAZNAS Kabupaten Bandung](https://kabbandung.baznas.go.id/) dengan tombol aksi cepat (*Call-to-Action*) "Bayar Zakat Sekarang" dan "Hitung Zakat".
- **Widget Statistik Transparansi Live:** Menampilkan ringkasan data agregat yang disinkronkan dari buku besar akuntansi:
  - Total Penghimpunan Tahun Berjalan (Zakat Maal, Zakat Fitrah, Infak/Sedekah, DSKL, Fidyah).
  - Total Penyaluran per 8 Asnaf (Fakir, Miskin, Amil, Muallaf, Riqab, Gharimin, Fisabilillah, Ibnu Sabil).
  - Total Penerima Manfaat (Jiwa & Lembaga) beserta sebaran per 5 Pilar Program BAZNAS.
- **Peta Sebaran Kebaikan Kabupaten Bandung (GIS Interaktif):** Peta interaktif berbasis *polygon* 31 kecamatan di Kabupaten Bandung (mulai dari Soreang, Ciwidey, Pangalengan, Kertasari, Cileunyi, hingga Margaasih) yang menampilkan titik lokasi penyaluran bantuan seperti perbaikan [Rutilahu](https://kabbandung.baznas.go.id/Pendistribusian), titik [Bengkel Z-Auto](https://kabbandung.baznas.go.id/berita/news-show/baznas-kabupaten-bandung-resmi-luncurkan-program-bengkel-z-auto/31443), dan jumlah penghimpunan UPZ kecamatan.

### 3.2 Modul Kalkulator Zakat Sesuai Fikih & Regulasi BAZNAS
Kalkulator interaktif dengan parameter harga emas dan beras lokal Kabupaten Bandung yang dapat diperbarui secara dinamis oleh Admin:
- **Zakat Penghasilan (Profesi):** Menggunakan standar nisab senilai 85 gram emas (termasuk opsi parameter [standar emas yang ditetapkan BAZNAS](https://kabbandung.baznas.go.id/)) dengan tarif `2,5%` dari penghasilan bruto atau neto bulanan/tahunan.
- **Zakat Maal (Emas, Perak, Tabungan, Deposito, Perdagangan, Pertanian, Perusahaan):** Perhitungan otomatis berdasarkan *haul* (1 tahun) dan nisab masing-masing objek zakat.
- **Kalkulator Fidyah & Kafarat:** Menghitung kewajiban fidyah berdasarkan jumlah hari tidak berpuasa dikalikan ketetapan nilai fidyah per hari di wilayah Kabupaten Bandung.
- **Integrasi Langsung ke Pembayaran:** Hasil perhitungan kalkulator dapat langsung diteruskan ke halaman pembayaran dalam satu klik dengan nominal yang sudah terisi otomatis.

### 3.3 Layanan Pembayaran ZISWAF Online (*ZIS Checkout Engine*)
- **Pilihan Jenis Dana Terstruktur:**
  - **Zakat:** Zakat Penghasilan, Zakat Maal, Zakat Fitrah.
  - **Infak / Sedekah:** Infak Tak Terikat (Umum) dan Infak Terikat (*Muqayyad*) berdasarkan program spesifik daerah (contoh: [Sedekah Cahaya Pangalengan](https://kabbandung.baznas.go.id/berita/news-show/program-sedekah-cahaya-baznas-kabupaten-bandung-dan-brader-di-pangalengan/19900), [Pemberdayaan Z-Kosmetika](https://kabbandung.baznas.go.id/berita/news-show/hut-ke-25-baznas-baznas-kabupaten-bandung-perkuat-pemberdayaan-lewat-z-kosmetika/36020), Bantuan Bencana Kabupaten Bandung).
  - **DSKL & Fidyah:** Pembayaran Fidyah, Kurban, dan Dana Sosial Keagamaan Lainnya.
- **Fitur Doa & Niat Zakat Digital:** Menampilkan teks lafaz niat zakat (Arab, Latin, dan Terjemahan Bahasa Indonesia/Sunda) sebelum pembayaran, serta kolom doa muzaki yang dapat ditampilkan secara publik (atau sebagai *Hamba Allah* / anonim).
- **Metode Pembayaran Multi-Kanal:**
  - *QRIS Dinamis* (mendukung seluruh dompet digital dan *mobile banking*).
  - *Virtual Account (VA)* Bank Syariah & Nasional (BSI, BJB Syariah, BJB, Mandiri, BRI, BNI, BCA).
  - *E-Wallet Instant Payment* (GoPay, OVO, Dana, ShopeePay).
  - *Transfer Rekening Resmi (Manual Verification)* dengan fitur unggah bukti bayar dan deteksi nominal unik.
- **Layanan Jemput Zakat:** Formulir permintaan penjemputan zakat langsung ke rumah/kantor muzaki di wilayah Kabupaten Bandung dengan penjadwalan kurir amil.

### 3.4 Portal Layanan Mustahik & Pelacakan Bantuan (*Tracking System*)
- **Katalog Persyaratan Pengajuan:** Informasi transparan mengenai syarat administrasi pengajuan bantuan per kategori program (Pendidikan, Kesehatan, Kemanusiaan/Rutilahu, Ekonomi Produktif, Dakwah).
- **Formulir Pengajuan Bantuan Daring:** Memungkinkan warga atau UPZ Desa mengajukan permohonan bantuan dengan validasi NIK Kabupaten Bandung (kode wilayah `32.04.*`) dan unggah dokumen pendukung.
- **Lacak Status Permohonan (*Ticket Tracker*):** Pencarian status pengajuan secara *real-time* menggunakan Nomor Registrasi dan 4 digit terakhir NIK (Status: *Dokumen Diterima $\rightarrow$ Verifikasi Administrasi $\rightarrow$ Jadwal Survei Lapangan $\rightarrow$ Sidang Pleno Pimpinan $\rightarrow$ Disetujui / Ditolak beserta alasan $\rightarrow$ Dana Dicairkan*).

### 3.5 Direktori Program, Berita, Regulasi & Portal Muzaki
- **5 Pilar Program BAZNAS Kabupaten Bandung:** Halaman khusus untuk program Bandung Peduli (Kemanusiaan), Bandung Cerdas (Pendidikan), Bandung Sehat (Kesehatan), Bandung Makmur (Ekonomi), dan Bandung Taqwa (Dakwah & Advokasi).
- **Pusat Berita, Artikel Fikih & BAZNAS TV:** Menampilkan [berita kegiatan terkini](https://kabbandung.baznas.go.id/berita), edukasi fikih zakat, serta integrasi galeri video dokumentasi penyaluran.
- **Cek Validasi Bukti Setor Zakat (BSZ):** Halaman verifikasi publik melalui pemindaian *QR Code* pada dokumen BSZ untuk memastikan keaslian dokumen bagi keperluan pelaporan pajak SPT Tahunan.
- **Dashboard Muzaki (Area Login):** Riwayat transaksi lengkap, unduh kumpulan BSZ tahunan untuk pengurang pajak (NPWP/NIK), pengingat zakat bulanan otomatis via WhatsApp/Email, dan laporan dampak penyaluran dari program yang didonasikan.

## 4. Spesifikasi Fungsional: Panel Admin & Eksekutif (Backoffice)

Panel Admin dirancang sebagai *Single Page Application (SPA)* yang menampilkan menu, aksi, dan *widget* secara dinamis sesuai otoritas user yang sedang masuk (*Role-Aware UI*).

### 4.1 Executive Command Center (Khusus Ketua & Wakil Ketua I–IV)
- **KPI Scorecard Real-Time:** Pencapaian penghimpunan dibandingkan target RKAT tahunan/bulanan, rasio penyaluran terhadap penghimpunan (*Allocation to Collection Ratio / ACR*), dan saldo kas per jenis dana (Zakat, Infak, Amil, DSKL).
- **Inbox Persetujuan Prioritas (*Actionable Approval Queue*):** Daftar pengajuan pencairan bantuan, draf SK, dan RKAT yang menunggu tanda tangan/persetujuan Pimpinan, dilengkapi ringkasan eksekutif, skor kelayakan mustahik, dan tombol *Approve / Reject / Minta Revisi* beserta catatan disposisi.
- **Analitik Demografi & Geospasial:** Grafik tren pertumbuhan muzaki baru vs berulang (*retention rate*), komposisi penghimpunan ASN/OPD vs Ritel/Masyarakat, serta peta *heatmap* kemiskinan dan penyaluran bantuan per kecamatan di Kabupaten Bandung.

### 4.2 Modul Manajemen Penghimpunan (*Collection Management*)
- **Manajemen Transaksi & Rekonsiliasi:** Daftar seluruh transaksi masuk (Online Payment Gateway, Transfer Manual, Konter Tunai, dan Setoran Kolektif ASN/UPZ).
- **Generator Bukti Setor Zakat (BSZ) & Nomor Pokok Wajib Zakat (NPWZ):** Pembuatan NPWZ otomatis bagi muzaki baru dan pencetakan BSZ berstandar [SIMBA BAZNAS](https://baznas.go.id/news-show/BAZNAS_RI_Perkuat_Sistem_Pelaporan_Zakat_melalui_SiMBA/3420) yang dilengkapi QR Code dan tanda tangan elektronik.
- **Manajemen Kampanye & Crowdfunding Program:** Pembuatan halaman kampanye tematik (contoh: *Ramadan Berkah Kab. Bandung*, *Bantuan Rutilahu Soreang*, *Beasiswa Santri*) lengkap dengan target dana, batas waktu, dan pembaruan kabar penyaluran (*update progress*).
- **CRM Muzaki & Retensi:** Segmentasi database muzaki (Individu, ASN Pemkab Bandung, Anggota DPRD, Korporasi/Kadin), penjadwalan *blast* pengingat zakat via WhatsApp Business API, dan pencatatan jadwal jemput zakat.

### 4.3 Modul Manajemen Pendistribusian & Pendayagunaan (*Distribution & Empowerment*)
- **Database Mustahik Terpadu & Deteksi Duplikasi:** Pendaftaran mustahik individu maupun lembaga dengan pengecekan otomatis berdasarkan NIK dan Nomor KK untuk mencegah duplikasi penerima bantuan dalam periode yang ditentukan (*cooling-off period*), kecuali untuk bantuan darurat bencana.
- **Instrumen Asesmen Lapangan Digital (*Had Kifayah & CIBEST Model*):**
  - Formulir digital yang dapat diakses melalui ponsel oleh `STAF_PENDISTRIBUSIAN` saat survei di lapangan (mendukung *Offline-First Mode* untuk daerah pelosok seperti Kertasari atau Pangalengan, dan sinkronisasi otomatis saat kembali terhubung ke internet).
  - Perhitungan skor kelayakan otomatis berdasarkan kondisi tempat tinggal, penghasilan keluarga, jumlah tanggungan, dan indikator keimanan/ibadah (Model CIBEST BAZNAS).
  - Pengunggahan foto rumah/usaha mustahik yang mengunci koordinat GPS (*geotagging*) dan waktu pengambilan (*timestamp*).
- **Manajemen Program Berkelanjutan & Monitoring Mustahik Produktif:** Modul pelacakan khusus untuk penerima bantuan pemberdayaan (seperti mitra [Bengkel Z-Auto](https://kabbandung.baznas.go.id/berita/news-show/baznas-kabupaten-bandung-resmi-luncurkan-program-bengkel-z-auto/31443) dan [Z-Kosmetika](https://kabbandung.baznas.go.id/berita/news-show/hut-ke-25-baznas-baznas-kabupaten-bandung-perkuat-pemberdayaan-lewat-z-kosmetika/36020)) serta penerima insentif rutin ([ustaz/ustazah dan marbot masjid](https://kabbandung.baznas.go.id/berita/news-show/baznas-kabupaten-bandung-laporkan-pengelolaan-zakat-2025-dalam-siraman-rohani-pemkab-bandung/35087)) guna memantau perkembangan usaha dan transformasi dari mustahik menjadi muzaki.

### 4.4 Modul Manajemen UPZ (Unit Pengumpul Zakat)
- **Hierarki & Registrasi UPZ:** Pengelolaan profil dan Surat Keputusan (SK) pengukuhan UPZ di tingkat OPD Pemkab Bandung, Sekretariat DPRD, BUMN/BUMD, Kecamatan (31 kecamatan), Desa/Kelurahan, Sekolah, dan Masjid/Pesantren.
- **Portal Pelaporan Kolektif UPZ:** `OPERATOR_UPZ` dapat mengunggah daftar rincian potongan zakat/infak kolektif (misal: zakat profesi ASN per dinas) menggunakan templat Excel/CSV terstandar, sehingga setiap individu ASN tetap mendapatkan BSZ atas nama masing-masing.
- **Pengelolaan Hak Bagi Hasil / Dana Operasional UPZ:** Perhitungan otomatis proporsi penyaluran atau pengembalian hak kelola UPZ sesuai regulasi BAZNAS Kabupaten Bandung.

### 4.5 Modul Keuangan, Akuntansi PSAK 109 & Integrasi SIMBA
- **Pemisahan Dana Mutlak (*Strict Fund Accounting*):** Sistem buku besar yang memisahkan secara ketat saldo dan mutasi antara:
  1. Dana Zakat (Hanya boleh disalurkan ke 8 Asnaf).
  2. Dana Infak/Sedekah Tidak Terikat & Terikat.
  3. Dana Sosial Keagamaan Lainnya (DSKL) & Fidyah.
  4. Dana Amil (Hak amil maksimum sesuai syariah dan regulasi: 12,5% dari zakat dan 20% dari infak/sedekah).
  5. Dana APBD / Hibah Daerah (Dana Bantuan Operasional / DBO dari Pemkab Bandung).
- **Manajemen RKAT (Rencana Kerja dan Anggaran Tahunan):** Pengaturan pagu anggaran per bidang dan per mata anggaran. Sistem secara otomatis memblokir pengajuan pencairan apabila pagu mata anggaran terkait telah habis, kecuali ada persetujuan revisi anggaran dari `WAKA_3_KEUANGAN` dan `PIMPINAN_KETUA`.
- **Laporan Keuangan Standar PSAK 109 Otomatis:**
  - Laporan Posisi Keuangan (Neraca).
  - Laporan Perubahan Dana (Zakat, Infak/Sedekah, Amil, Non-Halal jika ada untuk disalurkan ke fasilitas umum).
  - Laporan Perubahan Aset Kelolaan.
  - Laporan Arus Kas & Catatan atas Laporan Keuangan (CaLK).
- **Konektor & Sinkronisasi [SIMBA BAZNAS RI](https://baznas.go.id/news-show/BAZNAS_RI_Luncurkan_Modernisasi_SIMBA_di_Rakernis_Transformasi_Digital_dan_Zakat_Tech_Mini_Expo_2025/3486):** Fitur sinkronisasi API otomatis atau ekspor/impor batch berformat standar SIMBA untuk memastikan seluruh transaksi daerah tercatat di database nasional BAZNAS RI tanpa kerja ganda (*double input*).

### 4.6 Modul CMS, E-Office & Audit Internal
- **Content Management System (CMS):** Editor berita *rich-text* dengan optimasi SEO otomatis, manajemen jadwal tayang, galeri foto/video, pengumuman lelang/pengadaan, serta manajemen dokumen unduhan (Laporan Keuangan Audited, Perda/Perbup Zakat, Majalah BAZNAS).
- **E-Office & Disposisi Digital:** Pencatatan surat masuk (permohonan audiensi, undangan OPD, proposal lembaga) dan surat keluar lengkap dengan lembar disposisi elektronik dari Ketua ke Wakil Ketua dan Kepala Bagian.
- **Dashboard Satuan Audit Internal (SAI):** Menampilkan anomali transaksi, daftar pengajuan yang melewati batas SLA, pemeriksaan kelengkapan berkas BAST pencairan, serta log perubahan data sensitif (*Before & After JSON Diff*).

## 5. Arsitektur Teknis & Desain Backend

Sistem dibangun dengan arsitektur *Modular Monolith* yang siap dipisahkan menjadi *Microservices* pada komponen berbeban tinggi (seperti *Payment Webhook Processor* dan *Notification Worker*), menjamin kemudahan pemeliharaan sekaligus performa tinggi.

### 5.1 Rekomendasi Stack Teknologi

| Lapisan (*Layer*) | Teknologi yang Direkomendasikan | Alasan Pemilihan Teknis |
| :--- | :--- | :--- |
| **Frontend Publik** | Next.js 15 (App Router, TypeScript), Tailwind CSS, Shadcn UI | Mendukung *Server-Side Rendering (SSR)* dan *Incremental Static Regeneration (ISR)* untuk performa SEO berita/kampanye yang optimal serta pemuatan halaman cepat di jaringan seluler daerah. |
| **Panel Admin (SPA)** | React / Next.js + TanStack Table & TanStack Query, Recharts, Leaflet/Mapbox | Responsif untuk tabel data skala besar, manajemen *state* otorisasi yang presisi, serta visualisasi peta GIS Kabupaten Bandung. |
| **Backend Core API** | Go (Golang - Fiber/Echo) atau NestJS (Node.js TypeScript) | *Type-safe*, konkurensi tinggi untuk menangani lonjakan transaksi pembayaran zakat pada malam Idulfitri, dan arsitektur modular yang bersih. |
| **Database Utama** | PostgreSQL 16 + PostGIS | Kepatuhan ACID penuh untuk transaksi keuangan/akuntansi (mencegah *race condition* saldo) dan ekstensi PostGIS untuk pemetaan koordinat mustahik/UPZ per kecamatan. |
| **Cache & Message Queue** | Redis 7 + BullMQ / Asynq | Penyimpanan *session/token*, *rate limiting* API, serta antrean asinkron untuk pengiriman WhatsApp/Email, pembuatan PDF BSZ, dan sinkronisasi ke [SIMBA](https://simba.baznas.go.id/wishes). |
| **Object Storage** | S3-Compatible Object Storage (MinIO / AWS S3 / GCP Cloud Storage) | Penyimpanan terenkripsi untuk dokumen KTP/KK mustahik, foto geotagging survei, bukti transfer, dan file PDF BSZ dengan pemisahan *bucket* publik dan privat. |
| **Infrastruktur & DevOps** | Docker, Kubernetes / Cloud Run, Nginx, GitHub Actions CI/CD, Prometheus + Grafana | Orkestrasi kontainer dengan *auto-scaling*, pemantauan kesehatan server *real-time*, dan *zero-downtime deployment*. |

### 5.2 Desain Skema Database Inti (ERD Logis)

Berikut adalah struktur tabel inti dalam PostgreSQL untuk mendukung otorisasi multi-level, penghimpunan, pendistribusian, dan akuntansi dana:

1. **Tabel `users` & `roles` & `permissions` (RBAC + ABAC):**
   - `users`: `id (UUID)`, `nip_amil`, `full_name`, `email`, `phone`, `password_hash`, `role_id`, `division_id`, `upz_id (Nullable)`, `mfa_enabled (Boolean)`, `mfa_secret`, `digital_signature_pin_hash`, `status (ACTIVE/SUSPENDED)`, `last_login_at`.
   - `role_permissions`: Memetakan `role_id` dengan izin spesifik (`module`, `action`, `max_approval_amount`, `scope_type [ALL / DIVISION / UPZ / SELF]`).
2. **Tabel `upz_units` (Manajemen UPZ):**
   - `id (UUID)`, `code_simba`, `name`, `category (OPD / DPRD / KECAMATAN / DESA / MASJID / SEKOLAH / KORPORASI)`, `district_code (Kode Kecamatan)`, `village_code`, `sk_number`, `sk_valid_until`, `bank_account_info`, `status`.
3. **Tabel `muzakki_profiles` & `zis_transactions` (Penghimpunan):**
   - `muzakki_profiles`: `id (UUID)`, `npwz (Unique)`, `nik_encrypted`, `npwp_encrypted`, `full_name`, `muzakki_type (INDIVIDU / ASN / ENTITAS)`, `upz_id`, `phone`, `email`, `address`, `district_id`.
   - `zis_transactions`: `id (UUID)`, `trx_number (Unique)`, `bsz_number (Unique)`, `simba_sync_id`, `muzakki_id`, `upz_id`, `fund_type (ZAKAT_PENGHASILAN / ZAKAT_MAAL / ZAKAT_FITRAH / INFAK_UMUM / INFAK_TERIKAT / DSKL / FIDYAH)`, `campaign_id`, `amount (NUMERIC(18,2))`, `unique_code`, `total_paid`, `payment_channel`, `payment_gateway_ref`, `payment_status (PENDING / PAID / EXPIRED / REFUNDED)`, `verified_by (UUID)`, `paid_at`, `bsz_pdf_url`, `is_tax_deductible (Boolean)`.
4. **Tabel `mustahik_profiles` & `distribution_submissions` (Pendistribusian):**
   - `mustahik_profiles`: `id (UUID)`, `nik_hash (Unique Index)`, `nik_encrypted`, `kk_number_encrypted`, `full_name`, `asnaf_category (FAKIR / MISKIN / AMIL / MUALLAF / RIQAB / GHARIMIN / FISABILILLAH / IBNU_SABIL)`, `district_id`, `village_id`, `address`, `latitude`, `longitude`, `cibest_quadrant`, `had_kifayah_score`, `bank_name`, `bank_account_number`.
   - `distribution_submissions`: `id (UUID)`, `ticket_number (Unique)`, `mustahik_id`, `program_id`, `pilar_category (PENDIDIKAN / KESEHATAN / EKONOMI / KEMANUSIAAN / DAKWAH)`, `submission_source (ONLINE / WALK_IN / UPZ)`, `upz_id`, `requested_amount`, `approved_amount`, `current_stage (SUBMITTED / ADMIN_VERIFIED / SURVEYED / KABAG_APPROVED / WAKA_APPROVED / KETUA_APPROVED / DISBURSED / REJECTED)`, `rkat_budget_id`, `disbursed_at`, `bast_document_url`.
5. **Tabel `approval_logs` (Mesin Otorisasi Berjenjang):**
   - `id (UUID)`, `reference_type (DISTRIBUTION / RKAT / SK_UPZ / FINANCIAL_REPORT / CMS_PRESS)`, `reference_id (UUID)`, `step_order (INT)`, `required_role`, `actor_user_id (UUID)`, `decision (APPROVED / REJECTED / REVISION_REQUESTED)`, `notes`, `signature_hash`, `acted_at`.
6. **Tabel `journal_entries` & `journal_lines` (Akuntansi PSAK 109):**
   - `journal_entries`: `id (UUID)`, `journal_number`, `transaction_date`, `fund_pool (ZAKAT / INFAK_UMUM / INFAK_TERIKAT / DSKL / AMIL / APBD)`, `source_module`, `source_reference_id`, `description`, `status (DRAFT / POSTED / REVERSED)`, `posted_by`, `approved_by`.
   - `journal_lines`: `id (UUID)`, `journal_entry_id`, `chart_of_account_id`, `debit (NUMERIC(18,2))`, `credit (NUMERIC(18,2))`, `asnaf_tag`, `program_tag`.
7. **Tabel `audit_trails` (Immutable Security Log):**
   - `id (BIGSERIAL)`, `timestamp (TIMESTAMPTZ)`, `actor_id (UUID)`, `actor_role`, `ip_address`, `user_agent`, `action_type`, `resource_table`, `resource_id`, `previous_state (JSONB)`, `new_state (JSONB)`, `integrity_checksum (SHA-256)`.

### 5.3 Spesifikasi Endpoint REST API Utama

Seluruh endpoint berada di bawah prefix `/api/v1` dan menggunakan autentikasi `Bearer JWT (Access Token 15 menit + HttpOnly Refresh Token)` serta validasi *Idempotency-Key* untuk seluruh mutasi finansial.

| Kategori | Method & Endpoint | Deskripsi Fungsional | Otoritas Role |
| :--- | :--- | :--- | :--- |
| **Auth & Security** | `POST /api/v1/auth/login` | Autentikasi kredensial & tantangan *Multi-Factor Authentication (MFA/TOTP)*. | Semua User |
| **Auth & Security** | `POST /api/v1/auth/verify-pin` | Verifikasi PIN Otorisasi 6-digit sebelum menyetujui pencairan dana atau tanda tangan SK. | Kabag, Waka I–IV, Ketua |
| **Public ZIS** | `POST /api/v1/public/zakat/calculate` | Menghitung kewajiban zakat penghasilan/maal/fidyah berdasarkan harga emas/beras terkini. | Publik |
| **Public ZIS** | `POST /api/v1/public/transactions/checkout` | Membuat transaksi ZIS baru dan menghasilkan kode QRIS / nomor Virtual Account. | Publik / Muzaki |
| **Webhook** | `POST /api/v1/webhooks/payment-gateway` | Menerima *callback* pembayaran lunas (dengan verifikasi *HMAC Signature*), menjurnal kas otomatis, & menerbitkan BSZ. | Payment Gateway System |
| **Public Mustahik** | `POST /api/v1/public/submissions` | Mengirimkan permohonan bantuan baru beserta dokumen KTP/KK/SKTM. | Publik / Operator UPZ |
| **Public Mustahik** | `GET /api/v1/public/submissions/track/:ticket` | Melacak status tahapan verifikasi permohonan bantuan secara *real-time*. | Publik |
| **Penghimpunan** | `POST /api/v1/admin/collections/upz-batch` | Mengunggah rincian setoran kolektif ASN/UPZ untuk pembuatan BSZ massal. | Operator UPZ, Staf Penghimpunan |
| **Pendistribusian** | `POST /api/v1/admin/distributions/:id/survey` | Mengirimkan hasil asesmen lapangan (*had kifayah*, kuadran CIBEST, foto geotagging). | Staf Pendistribusian |
| **Approval Engine** | `POST /api/v1/admin/approvals/:id/decide` | Memberikan keputusan (`APPROVE`, `REJECT`, `REVISE`) pada pengajuan sesuai plafon wewenang. | Kabag, Waka I–IV, Ketua |
| **Keuangan & SIMBA** | `POST /api/v1/admin/finance/disburse/:id` | Mengeksekusi pencairan dana atas pengajuan yang telah berstatus *Approved* penuh & membuat jurnal PSAK 109. | Staf Keuangan, Waka III |
| **Keuangan & SIMBA** | `POST /api/v1/admin/simba/sync` | Menjalankan sinkronisasi transaksi penghimpunan & penyaluran dengan API [SIMBA BAZNAS RI](https://baznas.go.id/news-show/BAZNAS_RI_Perkuat_Sistem_Pelaporan_Zakat_melalui_SiMBA/3420). | Staf Keuangan, Waka III |
| **Executive** | `GET /api/v1/admin/executive/summary` | Mengambil metrik agregat penghimpunan, ACR, realisasi RKAT, dan sebaran bantuan per kecamatan. | Ketua, Waka I–IV, SAI |

## 6. Keamanan, Kepatuhan Regulasi & Non-Functional Requirements (NFR)

Mengingat [BAZNAS Kabupaten Bandung](https://kabbandung.baznas.go.id/) mengelola dana publik/umat dan data kependudukan sensitif, sistem wajib memenuhi standar keamanan dan kepatuhan berikut:

### 6.1 Keamanan Data & Kepatuhan UU Perlindungan Data Pribadi (UU PDP No. 27 Tahun 2022)
- **Enkripsi Data Sensitif (*Field-Level Encryption*):** Nomor Induk Kependudukan (NIK), Nomor Kartu Keluarga (KK), Nomor Pokok Wajib Pajak (NPWP), dan nomor rekening bank wajib dienkripsi di level aplikasi menggunakan **AES-256-GCM** sebelum disimpan ke database. Untuk keperluan pencarian/deteksi duplikasi NIK, sistem menyimpan kolom terpisah berisi *Blind Index* (`HMAC-SHA256`).
- **Dokumen Privat Berbasis *Pre-Signed URL*:** Berkas KTP, KK, SKTM, dan foto kondisi rumah mustahik disimpan di *private bucket* yang tidak dapat diakses publik secara langsung. Akses oleh Staf Verifikator atau Pimpinan menggunakan *short-lived pre-signed URL* (kedaluwarsa dalam 5 menit) dengan pencatatan akses di *Audit Log*.
- **Kewajiban MFA & PIN Otorisasi:** Seluruh akun `SUPER_ADMIN`, `STAF_KEUANGAN`, `KABAG`, `WAKA_1` s.d. `WAKA_4`, dan `PIMPINAN_KETUA` wajib mengaktifkan *Multi-Factor Authentication (MFA)* berbasis aplikasi autentikator (TOTP) atau OTP WhatsApp resmi, serta memasukkan PIN Otorisasi khusus saat menyetujui pencairan dana.
- **Immutable Audit Trail (Anti-Tamper):** Tabel `audit_trails` diatur dengan izin *Append-Only* pada level pengguna database PostgreSQL (bahkan `SUPER_ADMIN` aplikasi tidak memiliki fitur *Update* atau *Delete* pada log audit). Setiap baris log memiliki *cryptographic hash chaining* (`SHA-256` dari baris sebelumnya) untuk mendeteksi manipulasi database secara langsung.

### 6.2 Keandalan Transaksi & Performa
- **Idempoten & Transaksi Atomik:** Setiap pemrosesan *webhook* pembayaran dari Payment Gateway wajib bersifat idempoten untuk mencegah pencatatan ganda atau penerbitan BSZ ganda apabila Payment Gateway mengirim ulang notifikasi.
- **Kapasitas Beban Puncak (*Peak Load Scaling*):** Sistem diuji menggunakan *Load Testing* (k6) untuk mampu menahan minimal **500 transaksi per menit** dan **10.000 pengunjung aktif bersamaan** pada periode puncak zakat fitrah dan zakat maal di akhir Ramadan tanpa penurunan performa (*response time* API P95 `< 300ms`).
- **Strategi Pencadangan (*Backup & Disaster Recovery*):** Pencadangan database otomatis secara *Point-in-Time Recovery (PITR)* setiap jam dan *full snapshot* harian ke lokasi *cloud region* terpisah (Indonesia/Jakarta) dengan target *Recovery Point Objective (RPO)* `< 15 menit` dan *Recovery Time Objective (RTO)* `< 2 jam`.

## 7. Roadmap Implementasi & Tahapan Rilis

Pengembangan direncanakan dalam durasi **16 Minggu (4 Fase)** dengan pendekatan *Agile Scrum* per 2 minggu (*Sprint*):

| Fase | Rentang Waktu | Fokus Pengembangan & Deliverable Utama | Kriteria Keberhasilan (*Exit Criteria*) |
| :--- | :--- | :--- | :--- |
| **Fase 1: Foundation, Core RBAC & Penghimpunan** | Minggu 1 – 4 | Arsitektur database PostgreSQL, autentikasi JWT + MFA, manajemen User/Role berjenjang, Kalkulator Zakat, Checkout ZIS Online, integrasi Payment Gateway (QRIS & VA), dan generator PDF Bukti Setor Zakat (BSZ). | Simulasi pembayaran ZIS end-to-end berhasil menerbitkan e-BSZ valid dengan QR Code dalam `< 15 detik`. |
| **Fase 2: Pendistribusian, Mustahik & Multi-Level Approval** | Minggu 5 – 8 | Portal pengajuan mustahik, instrumen survei lapangan (*Had Kifayah* & Geotagging), deteksi duplikasi NIK, serta mesin *Multi-Level Approval* berjenjang (Staf $\rightarrow$ Kabag $\rightarrow$ Waka II & III $\rightarrow$ Ketua). | Alur persetujuan berjenjang Tier 1, Tier 2, dan Tier 3 berjalan sesuai plafon otoritas tanpa celah *bypass*. |
| **Fase 3: Portal UPZ, Akuntansi PSAK 109 & Konektor SIMBA** | Minggu 9 – 12 | Dashboard khusus Operator UPZ (OPD/Kecamatan/Desa/Masjid), unggah kolektif zakat ASN, penjurnalan otomatis PSAK 109, pengendalian pagu RKAT, dan integrasi sinkronisasi [SIMBA BAZNAS RI](https://simba.baznas.go.id/wishes). | Laporan Perubahan Dana PSAK 109 seimbang (*balanced*) 100% dan format ekspor sesuai skema SIMBA. |
| **Fase 4: Executive Dashboard, GIS, CMS, UAT & Go-Live** | Minggu 13 – 16 | Executive Command Center Pimpinan, Peta GIS 31 Kecamatan Kab. Bandung, CMS Berita/Artikel, E-Office Disposisi, *Penetration Testing* (OWASP Top 10), pelatihan amil/UPZ, dan *Go-Live*. | Lulus uji keamanan independen, lulus *User Acceptance Test (UAT)* bersama Pimpinan & SAI, serta sistem resmi beroperasi. |
