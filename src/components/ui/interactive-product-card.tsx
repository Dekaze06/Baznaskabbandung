"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardSlide {
  imageUrl: string;
  logoUrl?: string;
  title: string;
  description: string;
  price: string;
}

// --- PROPS INTERFACE ---
export interface InteractiveProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string;
  logoUrl?: string;
  title?: string;
  description?: string;
  price?: string;
  slides?: CardSlide[];
  href?: string;
}

// --- COMPONENT DEFINITION ---
export function InteractiveProductCard({
  className,
  imageUrl = "/images/beranda-hero.webp",
  logoUrl = "/logo-baznas-navbar.webp",
  title = "Pemberdayaan Mustahik",
  description = "Kemandirian ekonomi umat di 31 kecamatan",
  price = "94.280 Jiwa Terbantu",
  slides,
  href,
  ...props
}: InteractiveProductCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({});
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Auto-cycle slides gently if multiple slides provided and not hovered
  React.useEffect(() => {
    if (!slides || slides.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slides, isHovered]);

  const currentSlide = slides && slides[activeSlide] ? slides[activeSlide] : {
    imageUrl,
    logoUrl,
    title,
    description,
    price,
  };

  // --- MOUSE MOVE HANDLER ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    const rotateX = ((y - height / 2) / (height / 2)) * -8; // Max rotation 8deg
    const rotateY = ((x - width / 2) / (width / 2)) * 8;   // Max rotation 8deg

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`,
      transition: "transform 0.1s ease-out",
      transformStyle: "preserve-3d",
    });
    setIsHovered(true);
  };

  // --- MOUSE LEAVE HANDLER ---
  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
      transformStyle: "preserve-3d",
    });
    setIsHovered(false);
  };

  const content = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: "480px",
        height: "520px",
        ...style,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative w-full max-w-[420px] h-[520px] rounded-3xl bg-neutral-900 shadow-2xl overflow-hidden group select-none border border-white/10",
        "transform-style-3d", // Enables 3D transformations for children
        className
      )}
      {...props}
    >
      {/* Background Image - positioned in front of card base */}
      <img
        src={currentSlide.imageUrl}
        alt={currentSlide.title}
        loading="eager"
        decoding="async"
        onError={(e) => {
          const target = e.currentTarget;
          if (!target.src.includes('zis-hero')) {
            target.src = '/images/zis-hero.webp';
          }
        }}
        className="absolute inset-0 h-full w-full object-cover rounded-3xl transition-transform duration-500 group-hover:scale-105 z-0"
        style={{ transform: "translateZ(1px)" }}
      />
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 rounded-3xl z-10 transition-opacity duration-300 pointer-events-none" 
        style={{ transform: "translateZ(2px)" }}
      />

      {/* Main Content with 3D effect */}
      <div
        className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between pointer-events-none z-20"
        style={{ transform: "translateZ(30px)" }}
      >
        {/* Glassmorphism Header */}
        <div className="flex items-start justify-between rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md shadow-sm">
          <div className="flex flex-col pr-2">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug drop-shadow-sm">
              {currentSlide.title}
            </h3>
            <p className="text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed">
              {currentSlide.description}
            </p>
          </div>
          {currentSlide.logoUrl && (
            <img 
              src={currentSlide.logoUrl} 
              alt="Brand Logo" 
              className="h-6 w-auto max-w-[70px] object-contain shrink-0 drop-shadow-xs" 
            />
          )}
        </div>

        {/* Price Tag - Absolute position with refined alignment */}
        <div className="absolute top-[108px] left-5">
          <div className="rounded-full bg-black/60 border border-white/20 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span>{currentSlide.price}</span>
          </div>
        </div>

        {/* Pagination Dots - Pushed to the bottom */}
        <div className="mt-auto flex w-full justify-center gap-2 pb-1 pointer-events-auto">
          {Array.from({ length: slides ? slides.length : 4 }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (slides) setActiveSlide(index);
              }}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none",
                index === (slides ? activeSlide : 0) 
                  ? "w-6 bg-white shadow-xs" 
                  : "w-2 bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Lihat slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline focus:outline-none w-full max-w-[420px]">
        {content}
      </a>
    );
  }

  return content;
}

export default InteractiveProductCard;
