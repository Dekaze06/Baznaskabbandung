import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

// Define the props for the component
interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  title: string;
  category: string;
  href: string;
  onSave?: () => void;
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ className, imageUrl, title, category, href, onSave, ...props }, ref) => {
    const [saved, setSaved] = React.useState(false);

    // Prevent click event from bubbling up from the button to the parent link
    const handleSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setSaved((prev) => !prev);
      if (onSave) {
        onSave();
      } else if (typeof window !== "undefined" && (window as any).showAppToast) {
        (window as any).showAppToast(
          saved ? "Program dihapus dari daftar simpan." : "Program berhasil disimpan.",
          "bookmark"
        );
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group relative block overflow-hidden rounded-3xl border border-mist-s6 bg-card text-card-foreground transition-all duration-300 ease-in-out hover:shadow-xl hover:border-steel",
          className
        )}
        {...props}
      >
        <a href={href} aria-label={title} className="block no-underline text-inherit">
          {/* Image container with aspect ratio */}
          <div className="aspect-square w-full overflow-hidden bg-cloud relative">
            <img
              src={imageUrl}
              alt={title}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
          </div>
          {/* Card content */}
          <div className="p-5 space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-obsidian leading-tight truncate">{title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">{category}</p>
          </div>
        </a>

        {/* Save button - appears on hover */}
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            "absolute top-4 right-4 h-9 w-9 rounded-full backdrop-blur-md transition-all duration-300 shadow-md cursor-pointer",
            saved 
              ? "opacity-100 bg-emerald-deep text-white hover:bg-emerald-vibrant" 
              : "opacity-90 sm:opacity-0 sm:group-hover:opacity-100 bg-white/90 text-obsidian hover:bg-white"
          )}
          onClick={handleSaveClick}
          aria-label={saved ? "Hapus simpanan" : "Simpan program"}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export { ProductCard };
export default ProductCard;
