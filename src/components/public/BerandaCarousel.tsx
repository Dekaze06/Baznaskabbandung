"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  id: string | number;
  image: string;
  imageAlt?: string;
  title: string;
  description?: string;
  action?: string;
  href?: string;
  overlay?: React.ReactNode;
}

const BERANDA_SLIDES: CarouselSlide[] = [
  {
    id: "mustahik-31-kec",
    image: "/images/beranda-hero.webp",
    imageAlt: "Pemberdayaan Mustahik 31 Kecamatan BAZNAS Kabupaten Bandung",
    title: "Pemberdayaan Mustahik 31 Kecamatan.",
    description: "Transformasi ekonomi dan kemandirian mustahik melalui penyaluran zakat produktif di Kabupaten Bandung.",
    action: "Lihat Program",
    href: "/program/zis",
    overlay: (
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Program Unggulan • 31 Kecamatan</span>
      </div>
    ),
  },
  {
    id: "bedah-rutilahu",
    image: "/images/zis-peduli.webp",
    imageAlt: "Restorasi 340 Hunian Rutilahu Dhuafa",
    title: "Restorasi 340 Hunian Rutilahu Dhuafa.",
    description: "Mewujudkan rumah tinggal layak, bersih, dan sehat bagi keluarga dhuafa di pelosok perdesaan.",
    action: "Donasi Rutilahu",
    href: "/program/campaign",
    overlay: (
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <span>Bandung Peduli • Restorasi Hunian</span>
      </div>
    ),
  },
  {
    id: "bandung-sehat",
    image: "/images/beranda-sehat.webp",
    imageAlt: "Armada Medis dan Bantuan Pengobatan BAZNAS",
    title: "Bandung Sehat & Armada Medis 24 Jam.",
    description: "Layanan ambulans gratis serta bantuan biaya pengobatan mustahik darurat di seluruh kecamatan.",
    action: "Layanan Medis",
    href: "/program/zis",
    overlay: (
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Bandung Sehat • Siaga 24/7</span>
      </div>
    ),
  },
  {
    id: "bandung-cerdas",
    image: "/images/zis-cerdas.webp",
    imageAlt: "Beasiswa Pendidikan Santri dan Dhuafa",
    title: "Bandung Cerdas: Beasiswa Generasi Emas.",
    description: "Dukungan penuh SPP dan perlengkapan sekolah bagi siswa-siswi dhuafa berprestasi.",
    action: "Info Beasiswa",
    href: "/program/zis",
    overlay: (
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-sky-400"></span>
        <span>Bandung Cerdas • Generasi Emas</span>
      </div>
    ),
  },
  {
    id: "bandung-makmur",
    image: "/images/zis-makmur.webp",
    imageAlt: "Inkubasi Bisnis Z-Auto dan UMKM Mandiri",
    title: "Bandung Makmur: Inkubasi UMKM Berkelanjutan.",
    description: "Pemberian modal usaha tanpa bunga serta pelatihan keterampilan teknis bagi mustahik produktif.",
    action: "Program Ekonomi",
    href: "/program/zis",
    overlay: (
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Bandung Makmur • Z-Auto & UMKM</span>
      </div>
    ),
  },
  {
    id: "tanggap-bencana",
    image: "/images/campaign-bencana.webp",
    imageAlt: "BAZNAS Tanggap Bencana BTB",
    title: "Aksi Tanggap Bencana & Dapur Umum.",
    description: "Respons darurat bencana alam, evakuasi, dan distribusi ribuan paket pangan hangat.",
    action: "Salurkan Bantuan",
    href: "/program/campaign",
    overlay: (
      <div className="flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-sm">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
        <span>BAZNAS Tanggap Bencana • BTB</span>
      </div>
    ),
  },
];

export interface BerandaCarouselProps {
  className?: string;
  height?: number | string;
  interval?: number;
  autoplay?: boolean;
}

export function BerandaCarousel({
  className,
  height = 440,
  interval = 4100,
  autoplay = true,
}: BerandaCarouselProps) {
  const slides = BERANDA_SLIDES;
  const count = slides.length;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const touchStartX = React.useRef<number | null>(null);

  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goToSlide = React.useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  // Autoplay cycle
  React.useEffect(() => {
    if (!autoplay || isPaused || count < 2) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoplay, isPaused, count, interval, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (deltaX > 45) {
      nextSlide();
    } else if (deltaX < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const frameHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn("flex w-full flex-col select-none", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carousel Program BAZNAS"
    >
      {/* Top Header: Pagination Dots + Navigation Arrows */}
      <div className="mb-3 flex items-center justify-between">
        {/* Pagination Dots */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Pilih Slide">
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Lihat slide ${idx + 1}`}
                onClick={() => goToSlide(idx)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300 cursor-pointer outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[#064e3b] focus-visible:ring-offset-2",
                  isActive
                    ? "w-7 bg-[#064e3b]"
                    : "w-2 bg-[#d4d4d8] hover:bg-[#a1a1aa]"
                )}
              />
            );
          })}
        </div>

        {/* Previous & Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className={cn(
              "grid size-8 cursor-pointer place-items-center rounded-[10px]",
              "bg-[#064e3b] text-white shadow-xs",
              "transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#064e3b] focus-visible:ring-offset-2"
            )}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M9.6 2.6 5.1 7.1h9.1v1.8H5.1l4.5 4.5-1.2 1.2-6-6L1.8 8l.6-.6 6-6 1.2 1.2Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className={cn(
              "grid size-8 cursor-pointer place-items-center rounded-[10px]",
              "bg-[#064e3b] text-white shadow-xs",
              "transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95 outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#064e3b] focus-visible:ring-offset-2"
            )}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M6.4 2.6l4.5 4.5H1.8v1.8h9.1l-4.5 4.5 1.2 1.2 6-6 .6-.6-.6-.6-6-6-1.2 1.2Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Single-Image Display Frame */}
      <div
        className="relative w-full overflow-hidden rounded-[16px] bg-neutral-900 shadow-md border border-[#e4e4e7]"
        style={{ height: frameHeight }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full w-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="relative h-full w-full shrink-0 overflow-hidden"
              aria-hidden={idx !== currentIndex}
            >
              <img
                src={slide.image}
                alt={slide.imageAlt ?? slide.title}
                draggable={false}
                loading={idx === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover select-none"
              />

              {/* Bottom soft gradient for overlay legibility */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
              />

              {/* Slide Overlay Badge */}
              {slide.overlay && (
                <div className="absolute bottom-5 left-5 z-10 pointer-events-none">
                  {slide.overlay}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Text Caption & Action Button (Under the Image) */}
      <div className="mt-4 grid" aria-live="polite">
        {slides.map((slide, idx) => {
          const isShown = idx === currentIndex;
          return (
            <div
              key={slide.id}
              aria-hidden={!isShown}
              className={cn(
                "col-start-1 row-start-1 flex flex-col gap-3",
                "sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              )}
              style={{
                opacity: isShown ? 1 : 0,
                visibility: isShown ? "visible" : "hidden",
                pointerEvents: isShown ? "auto" : "none",
                transition: "opacity 400ms ease, visibility 400ms",
              }}
            >
              <p className="max-w-[42rem] text-[14px] leading-[1.5] text-balance sm:text-[15px]">
                <span className="font-bold text-[#09090b]">{slide.title}</span>{" "}
                {slide.description && (
                  <span className="text-[#52525b] font-normal">{slide.description}</span>
                )}
              </p>

              {slide.action && (
                <a
                  href={slide.href}
                  className={cn(
                    "group/action inline-flex shrink-0 whitespace-nowrap cursor-pointer items-center gap-2 rounded-[12px]",
                    "bg-[#064e3b] px-4 py-2 text-xs font-semibold text-white shadow-xs",
                    "transition-all duration-200 hover:opacity-90 hover:shadow-md outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[#064e3b] focus-visible:ring-offset-2"
                  )}
                >
                  <span>{slide.action}</span>
                  <svg
                    width="6"
                    height="9"
                    viewBox="0 0 6 9"
                    fill="none"
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover/action:translate-x-0.5"
                  >
                    <path
                      d="M1.2 1 4.7 4.5 1.2 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BerandaCarousel;
