"use client"

import React from "react"
import { Marquee } from "./marquee"

interface Partner {
  name: string
  category: string
  icon: string
}

const ROW_TOP: Partner[] = [
  { name: "Pemerintah Kab. Bandung", category: "Regulasi & Pembina Utama", icon: "corporate_fare" },
  { name: "Bank Syariah Indonesia", category: "Bank Pengelola Rekening ZIS", icon: "account_balance" },
  { name: "Bank BJB Syariah", category: "Mitra Payroll Giro ASN", icon: "account_balance" },
  { name: "Perumda Tirta Raharja", category: "Kemitraan CSR BUMD", icon: "water_drop" },
  { name: "Kemenag Kab. Bandung", category: "Pembina Syariah & Lembaga", icon: "verified" },
  { name: "RSUD Otista Soreang", category: "Rujukan Layanan Medis Mustahik", icon: "local_hospital" },
  { name: "MUI Kab. Bandung", category: "Dewan Pengawas Syariah", icon: "mosque" },
  { name: "Telkom University", category: "Riset Sosial & Beasiswa SKSS", icon: "school" },
  { name: "PT Feng Tay Indonesia", category: "Mitra Korporasi Industri", icon: "factory" },
  { name: "Lembaga Ekonomi Mustahik", category: "Inkubasi Usaha Z-Auto", icon: "storefront" },
]

const ROW_BOTTOM: Partner[] = [
  { name: "Bank BJB Cabang Soreang", category: "Kas Daerah & Giro Operasional", icon: "account_balance" },
  { name: "RSUD Bedahan Cicalengka", category: "Mitra Bandung Sehat", icon: "local_hospital" },
  { name: "PT Kahatex Rancaekek", category: "Mitra Zakat Perusahaan", icon: "factory" },
  { name: "Dewan Masjid Indonesia (DMI)", category: "Jaringan 487 UPZ Masjid", icon: "mosque" },
  { name: "UIN Sunan Gunung Djati", category: "Pengabdian Masyarakat & CIBEST", icon: "school" },
  { name: "Sentra Rajut Majalaya", category: "Klaster UMKM Produktif", icon: "inventory_2" },
  { name: "BAZNAS Tanggap Bencana", category: "Respon Darurat Kebencanaan", icon: "emergency" },
  { name: "PT Panasia Indo Resources", category: "Kemitraan Dana Sosial DSKL", icon: "domain" },
  { name: "KADIN Kab. Bandung", category: "Sinergi Pengusaha Daerah", icon: "handshake" },
  { name: "RS BAZNAS Jawa Barat", category: "Layanan Hemodialisa Gratis", icon: "health_and_safety" },
]

export function MitraMarquee() {
  return (
    <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
      {/* Edge Gradients Fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#f4f4f5] via-[#f4f4f5]/60 to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#f4f4f5] via-[#f4f4f5]/60 to-transparent z-20" />

      {/* Baris 1: Atas bergerak ke Kanan - tempo tenang & nyaman dibaca */}
      <Marquee direction="right" speed={58} pauseOnHover={true} className="mt-0">
        {ROW_TOP.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white border border-[#e4e4e7] hover:border-[#064e3b] shadow-xs transition-all duration-300 shrink-0 cursor-default group"
          >
            <span className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">{p.icon}</span>
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-[#09090b] whitespace-nowrap block">{p.name}</span>
              <span className="text-[10px] text-[#71717a] whitespace-nowrap block">{p.category}</span>
            </div>
          </div>
        ))}
      </Marquee>

      {/* Baris 2: Bawah bergerak ke Kiri - tempo tenang & nyaman dibaca */}
      <Marquee direction="left" speed={62} pauseOnHover={true} className="mt-2">
        {ROW_BOTTOM.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 sm:px-5 py-3 rounded-2xl bg-white border border-[#e4e4e7] hover:border-[#064e3b] shadow-xs transition-all duration-300 shrink-0 cursor-default group"
          >
            <span className="w-8 h-8 rounded-xl bg-[#ecfdf5] text-[#064e3b] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#064e3b] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-base">{p.icon}</span>
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-[#09090b] whitespace-nowrap block">{p.name}</span>
              <span className="text-[10px] text-[#71717a] whitespace-nowrap block">{p.category}</span>
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  )
}

export default MitraMarquee
