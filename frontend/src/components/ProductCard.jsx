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
            <div className="relative aspect-[4/5] overflow-hidden bg-ivory-2 image-zoom">
                <img
                    src={img1}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />
                {img2 && (
                    <img
                        src={img2}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute top-4 left-4 tracking-editorial text-charcoal bg-ivory/90 px-3 py-1 text-[10px]">New</span>
                )}
            </div>
            <div className="pt-5">
                <div className="text-[10px] tracking-editorial text-muted2 mb-1">{product.category}</div>
                <div className="font-serif text-xl leading-snug">{product.name}</div>
                <div className="mt-1 text-sm text-charcoal/80">{formatINR(product.price)}</div>
            </div>
        </Link>
    );
}
