import { Link } from "react-router-dom";
import { formatINR } from "@/lib/api";

export default function ProductCard({ product }) {
    const img1 = product.images?.[0];
    const img2 = product.images?.[1] || product.images?.[0];
    return (
        <Link
            to={`/product/${product.slug}`}
            data-testid={`product-card-${product.slug}`}
            className="group block"
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-ivory-2 image-zoom flex items-center justify-center">
                {img1 ? (
                    <img
                        src={img1}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-muted2 text-xs tracking-editorial">Adore Lighting</div>
                )}
                {img2 && img2 !== img1 && (
                    <img
                        src={img2}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 tracking-editorial text-charcoal bg-ivory/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] uppercase">New</span>
                )}
            </div>
            <div className="pt-3 sm:pt-4 md:pt-5">
                <div className="text-[9px] sm:text-[10px] tracking-editorial text-muted2 mb-0.5 sm:mb-1 capitalize">{(product.category || "").replace(/-/g, " ")}</div>
                <div className="font-serif text-sm sm:text-base md:text-lg lg:text-xl leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-300">{product.name}</div>
                <div className="mt-1 text-xs sm:text-sm text-charcoal/90 font-medium">{formatINR(product.price)}</div>
            </div>
        </Link>
    );
}
